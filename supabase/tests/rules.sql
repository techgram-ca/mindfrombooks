-- Database-level checks for the money rules. Run against a scratch database
-- that has the migrations + seed applied:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rules.sql
-- Everything runs in one transaction and is rolled back.
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'learner@example.com', '{"name":"Lea","timezone":"America/Toronto"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'other@example.com', '{"name":"Otto","timezone":"Not/AZone"}');

do $$
declare
  u1 uuid := '00000000-0000-0000-0000-0000000000a1';
  u2 uuid := '00000000-0000-0000-0000-0000000000a2';
  c uuid; o uuid; e uuid; cp uuid; t1 uuid; t2 uuid; t3 uuid;
  today date := (now() at time zone 'America/Toronto')::date;
  p record;
  ok boolean;
begin
  -- profile trigger
  assert (select name from profiles where id = u1) = 'Lea', 'trigger copies name';
  assert (select timezone_confirmed from profiles where id = u1), 'valid timezone is confirmed';
  assert (select timezone from profiles where id = u2) = 'America/Toronto', 'bad timezone falls back';
  assert not (select timezone_confirmed from profiles where id = u2), 'bad timezone is not confirmed';

  -- a 5-day test course
  insert into courses (slug, name, days, price_cents, status, grace_days)
    values ('sql-test', 'SQL Test', 5, 999, 'published', 1) returning id into c;
  insert into tasks (course_id, day_number, title) select c, d, 'Day ' || d from generate_series(1, 5) d;
  insert into orders (user_id, amount_total_cents, course_id, stripe_payment_intent_id)
    values (u1, 999, c, 'pi_test') returning id into o;

  -- finished yesterday, every day answered, grace 0
  insert into enrollments (user_id, course_id, order_id, source, amount_paid_cents, start_date, timezone, grace_days)
    values (u1, c, o, 'stripe', 999, today - 5, 'America/Toronto', 0) returning id into e;
  insert into responses (enrollment_id, user_id, day_number, body) select e, u1, d, 'did it' from generate_series(1, 5) d;
  select * into p from enrollment_progress(e);
  assert p.refund_eligible, 'all days answered → eligible';
  assert p.current_day = 5 and p.responded_days = 5 and p.is_complete, 'progress numbers';
  assert p.refund_deadline = today - 1 + 14, 'deadline = final day + window';

  -- one missed day, grace 0 → not eligible, with the reason
  delete from responses where enrollment_id = e and day_number = 3;
  select * into p from enrollment_progress(e);
  assert not p.refund_eligible, 'missed day → not eligible';
  assert p.missed_days = array[3], 'missed days listed';
  assert p.refund_ineligible_reason = 'Missed 1 day (Day 3)', 'reason: ' || p.refund_ineligible_reason;

  -- same miss with a grace day on the enrollment → eligible
  update enrollments set grace_days = 1 where id = e;
  select * into p from enrollment_progress(e);
  assert p.refund_eligible, 'miss within grace → eligible';

  -- grace comes from the enrollment, not the course
  update courses set grace_days = 0 where id = c;
  assert (select refund_eligible from enrollment_progress(e)), 'changing the course does not change the enrollment';
  delete from responses where enrollment_id = e and day_number = 4;
  select * into p from enrollment_progress(e);
  assert p.refund_ineligible_reason = 'Missed 2 days (Day 3, Day 4) — up to 1 allowed', 'reason: ' || p.refund_ineligible_reason;
  insert into responses (enrollment_id, user_id, day_number, body) values (e, u1, 3, 'x'), (e, u1, 4, 'x');

  -- refund window
  update app_settings set refund_window_days = 0;
  assert not (select refund_eligible from enrollment_progress(e)), 'window closed';
  update app_settings set refund_window_days = 14;

  -- still running: today is day 3, days 1-2 answered
  update enrollments set start_date = today - 2, grace_days = 0 where id = e;
  delete from responses where enrollment_id = e and day_number >= 3;
  select * into p from enrollment_progress(e);
  assert p.current_day = 3 and not p.is_complete and p.missed_days = '{}', 'today is not missed yet';
  assert p.refund_ineligible_reason = 'Available once you finish Day 5', 'reason: ' || p.refund_ineligible_reason;

  -- starts tomorrow / not started
  update enrollments set start_date = today + 1 where id = e;
  assert (select current_day from enrollment_progress(e)) = 0, 'starts tomorrow → day 0';
  update enrollments set start_date = null where id = e;
  assert (select refund_ineligible_reason from enrollment_progress(e)) = 'Course not started yet', 'not started';

  -- free and refunded
  update enrollments set start_date = today - 5, source = 'coupon_free', amount_paid_cents = 0 where id = e;
  assert (select refund_ineligible_reason from enrollment_progress(e)) = 'Free access', 'free access';
  update enrollments set source = 'stripe', amount_paid_cents = 999, status = 'refunded' where id = e;
  assert (select refund_ineligible_reason from enrollment_progress(e)) = 'Already refunded', 'refunded';

  -- coupons: atomic, capped, one per user, idempotent per order
  insert into coupons (code, percent_off, max_redemptions) values ('SQLTEST', 100, 1) returning id into cp;
  assert redeem_coupon(cp, u1, o), 'first redemption';
  assert redeem_coupon(cp, u1, o), 'same order again is a no-op';
  assert (select times_redeemed from coupons where id = cp) = 1, 'counted once';
  insert into orders (user_id, amount_total_cents, course_id) values (u2, 0, c) returning id into o;
  assert not redeem_coupon(cp, u2, o), 'used up';
  update coupons set max_redemptions = 5 where id = cp;
  assert redeem_coupon(cp, u2, o), 'second user';
  insert into orders (user_id, amount_total_cents, course_id) values (u2, 0, c) returning id into o;
  assert not redeem_coupon(cp, u2, o), 'one per user';
  assert (select times_redeemed from coupons where id = cp) = 2, 'failed redemption rolled back';
  perform release_coupon(cp, o);
  assert (select times_redeemed from coupons where id = cp) = 2, 'release of an unknown order is a no-op';

  -- constraints
  begin
    insert into coupons (code, percent_off, amount_off_cents) values ('BOTH', 10, 100);
    assert false, 'both discount types must be rejected';
  exception when check_violation then null;
  end;
  begin
    insert into coupons (code) values ('NEITHER');
    assert false, 'a coupon needs a discount';
  exception when check_violation then null;
  end;
  begin
    insert into responses (enrollment_id, user_id, day_number, body) values (e, u1, 1, 'again');
    assert false, 'one response per day';
  exception when unique_violation then null;
  end;

  -- task reordering
  select id into t1 from tasks where course_id = c and day_number = 1;
  select id into t2 from tasks where course_id = c and day_number = 2;
  select id into t3 from tasks where course_id = c and day_number = 3;
  perform reorder_tasks(c, array[t3, t1, t2] || (select array_agg(id order by day_number) from tasks where course_id = c and day_number > 3));
  assert (select day_number from tasks where id = t3) = 1 and (select day_number from tasks where id = t1) = 2, 'reordered';
end $$;

-- ---------------------------------------------------------------- RLS, as a signed-in learner
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a2', true);

do $$
declare n int;
begin
  assert (select count(*) from profiles) = 1, 'sees only own profile';
  assert (select count(*) from enrollments) = 0, 'cannot see another learner''s enrollments';
  assert (select count(*) from responses) = 0, 'cannot see another learner''s responses';
  assert (select count(*) from orders) = 2, 'sees own orders only';
  assert (select count(*) from coupons) = 0, 'coupon codes are hidden';
  assert (select count(*) from email_templates) = 0, 'email templates are hidden';
  assert (select count(*) from tasks where not is_sample) = 0, 'paid task content is hidden';
  assert (select count(*) from tasks where is_sample) > 0, 'sample tasks are public';
  assert (select count(*) from courses where status = 'published') > 0, 'published courses are public';

  update profiles set name = 'Otto B' where id = auth.uid();
  get diagnostics n = row_count;
  assert n = 1, 'can edit own name';

  begin
    update profiles set role = 'admin' where id = auth.uid();
    assert false, 'must not be able to make themselves admin';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into responses (enrollment_id, user_id, day_number, body)
      select id, auth.uid(), 1, 'forged' from enrollments limit 1;
    insert into responses (enrollment_id, user_id, day_number, body)
      values (gen_random_uuid(), auth.uid(), 1, 'forged');
    assert false, 'must not be able to write responses directly';
  exception when insufficient_privilege then null;
  end;
  begin
    update enrollments set status = 'active';
    assert false, 'must not be able to edit enrollments';
  exception when insufficient_privilege then null;
  end;
  begin
    perform redeem_coupon(gen_random_uuid(), auth.uid(), gen_random_uuid());
    assert false, 'must not be able to call redeem_coupon';
  exception when insufficient_privilege then null;
  end;
  update courses set price_cents = 0;
  get diagnostics n = row_count;
  assert n = 0, 'cannot change prices';
end $$;

reset role;
rollback;
\echo 'all database rule checks passed'
