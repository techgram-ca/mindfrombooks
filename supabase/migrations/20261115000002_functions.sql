-- mindfrombooks: helpers, auth trigger, business-rule functions

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Create a profile row whenever a new auth user appears.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_tz text := meta ->> 'timezone';
  v_tz_ok boolean;
begin
  v_tz_ok := v_tz is not null and exists (select 1 from pg_timezone_names where name = v_tz);
  insert into public.profiles (id, email, name, timezone, timezone_confirmed, reminder_hour)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(meta ->> 'name', ''), nullif(meta ->> 'full_name', ''),
             split_part(coalesce(new.email, ''), '@', 1)),
    case when v_tz_ok then v_tz else 'America/Toronto' end,
    v_tz_ok,
    coalesce((select default_reminder_hour from public.app_settings limit 1), 8)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- progress + refund eligibility
-- Single source of truth for the refund guarantee. lib/refunds.ts mirrors this
-- logic for display; the refund API always re-checks here.
create or replace function public.enrollment_progress(p_enrollment_id uuid)
returns table (
  current_day int,               -- 0 = not started yet / starts tomorrow
  total_days int,
  responded_days int,
  missed_days int[],
  grace_days int,
  is_complete boolean,           -- the course is finished for this learner
  refund_eligible boolean,
  refund_ineligible_reason text,
  refund_deadline date
)
language plpgsql stable security invoker set search_path = public as $$
declare
  e public.enrollments;
  c public.courses;
  v_window int;
  v_today date;
  v_raw int;
  v_resp int[];
  v_missed int[] := '{}';
  v_last date;
  v_finished boolean := false;
  v_eligible boolean := false;
  v_reason text;
  v_deadline date;
  v_n int;
begin
  select * into e from public.enrollments where id = p_enrollment_id;
  if not found then return; end if;
  select * into c from public.courses where id = e.course_id;
  select s.refund_window_days into v_window from public.app_settings s limit 1;
  v_window := coalesce(v_window, 14);
  v_today := (now() at time zone e.timezone)::date;

  select coalesce(array_agg(r.day_number order by r.day_number), '{}') into v_resp
  from public.responses r
  where r.enrollment_id = e.id and r.day_number <= c.days;

  if e.start_date is not null then
    v_raw := v_today - e.start_date + 1;
    v_last := e.start_date + (c.days - 1);
    v_deadline := v_last + v_window;
    select coalesce(array_agg(d order by d), '{}') into v_missed
    from generate_series(1, least(v_raw - 1, c.days)) d
    where not (d = any (v_resp));
    v_finished := v_today > v_last or c.days = any (v_resp);
  end if;
  v_n := coalesce(array_length(v_missed, 1), 0);

  if e.status = 'refunded' then
    v_reason := 'Already refunded';
  elsif e.status = 'revoked' then
    v_reason := 'Access revoked';
  elsif e.source not in ('stripe', 'bundle') or e.amount_paid_cents <= 0 then
    v_reason := 'Free access';
  elsif e.start_date is null then
    v_reason := 'Course not started yet';
  elsif v_n > e.grace_days then
    v_reason := 'Missed ' || v_n || case when v_n = 1 then ' day' else ' days' end
      || ' (' || (select string_agg('Day ' || d, ', ' order by d) from unnest(v_missed) d) || ')'
      || case when e.grace_days > 0 then ' — up to ' || e.grace_days || ' allowed' else '' end;
  elsif not v_finished then
    v_reason := 'Available once you finish Day ' || c.days;
  elsif v_today > v_deadline then
    v_reason := 'Refund window closed on ' || to_char(v_deadline, 'YYYY-MM-DD');
  else
    v_eligible := true;
  end if;

  return query select
    case when e.start_date is null then 0 else greatest(0, least(v_raw, c.days)) end,
    c.days,
    coalesce(array_length(v_resp, 1), 0),
    v_missed,
    e.grace_days,
    v_finished,
    v_eligible,
    v_reason,
    v_deadline;
end $$;

-- ---------------------------------------------------------------- coupons
-- Atomically redeem a coupon for an order. Returns false when the coupon is
-- used up or this user already used a one-per-user code. Idempotent per order.
create or replace function public.redeem_coupon(p_coupon_id uuid, p_user_id uuid, p_order_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_one boolean;
begin
  if exists (select 1 from public.coupon_redemptions
             where coupon_id = p_coupon_id and order_id = p_order_id) then
    return true;
  end if;
  begin
    update public.coupons
       set times_redeemed = times_redeemed + 1
     where id = p_coupon_id
       and (max_redemptions is null or times_redeemed < max_redemptions)
    returning one_per_user into v_one;
    if not found then
      return false;
    end if;
    insert into public.coupon_redemptions (coupon_id, user_id, order_id, one_per_user)
    values (p_coupon_id, p_user_id, p_order_id, v_one);
  exception when unique_violation then
    return false;  -- the increment above is rolled back with this block
  end;
  return true;
end $$;

-- Give back a redemption (used when a free checkout fails after redeeming).
create or replace function public.release_coupon(p_coupon_id uuid, p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.coupon_redemptions where coupon_id = p_coupon_id and order_id = p_order_id;
  if found then
    update public.coupons set times_redeemed = greatest(times_redeemed - 1, 0)
     where id = p_coupon_id;
  end if;
end $$;

-- ---------------------------------------------------------------- task ordering
-- Renumber a course's tasks to match the order of p_task_ids (drag-to-reorder).
create or replace function public.reorder_tasks(p_course_id uuid, p_task_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.tasks where course_id = p_course_id)
     <> coalesce(array_length(p_task_ids, 1), 0) then
    raise exception 'task list does not match course';
  end if;
  -- Two steps so the unique (course_id, day_number) key is never violated mid-way.
  update public.tasks set day_number = day_number + 100000 where course_id = p_course_id;
  update public.tasks t
     set day_number = o.ord
    from unnest(p_task_ids) with ordinality as o (id, ord)
   where t.id = o.id and t.course_id = p_course_id;
  if exists (select 1 from public.tasks where course_id = p_course_id and day_number > 100000) then
    raise exception 'task list does not match course';
  end if;
end $$;

-- Server-only functions: never callable with the anon / user key.
revoke execute on function public.redeem_coupon(uuid, uuid, uuid) from public, anon, authenticated;
revoke execute on function public.release_coupon(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.reorder_tasks(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.redeem_coupon(uuid, uuid, uuid) to service_role;
grant execute on function public.release_coupon(uuid, uuid) to service_role;
grant execute on function public.reorder_tasks(uuid, uuid[]) to service_role;
