-- mindfrombooks: Row Level Security
-- Rule of thumb: people read their own rows; every write that involves money,
-- day numbers or eligibility goes through server code using the service role.

do $$
declare t text;
begin
  foreach t in array array[
    'app_settings','profiles','courses','course_books','course_phases','tasks','bundles',
    'bundle_courses','coupons','orders','enrollments','responses','refunds',
    'coupon_redemptions','certificates','email_templates','email_log']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_all', t);
  end loop;
end $$;

-- settings: public read (announcement, follower count)
create policy app_settings_read on public.app_settings for select using (true);

-- profiles: own row. Column grants below stop users from changing role/email/attribution.
create policy profiles_read_own on public.profiles for select using (id = auth.uid());
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (name, timezone, timezone_confirmed, reminder_hour, email_reminders)
  on public.profiles to authenticated;

-- catalog: published is public; learners keep seeing courses they are enrolled in
create policy courses_read on public.courses for select using (
  status = 'published'
  or exists (select 1 from public.enrollments e
             where e.course_id = courses.id and e.user_id = auth.uid())
);
create policy course_books_read on public.course_books for select using (
  exists (select 1 from public.courses c where c.id = course_books.course_id)
);
create policy course_phases_read on public.course_phases for select using (
  exists (select 1 from public.courses c where c.id = course_phases.course_id)
);
-- Only sample tasks are public. Full task content is paid and served by the
-- server after it has checked the enrollment and which days are unlocked.
create policy tasks_read_samples on public.tasks for select using (
  is_sample and exists (
    select 1 from public.courses c where c.id = tasks.course_id and c.status = 'published')
);
create policy bundles_read on public.bundles for select using (status = 'published');
create policy bundle_courses_read on public.bundle_courses for select using (true);

-- own rows, read-only
create policy orders_read_own on public.orders for select using (user_id = auth.uid());
create policy enrollments_read_own on public.enrollments for select using (user_id = auth.uid());
create policy responses_read_own on public.responses for select using (user_id = auth.uid());
create policy refunds_read_own on public.refunds for select using (user_id = auth.uid());
create policy certificates_read_own on public.certificates for select using (user_id = auth.uid());
create policy coupon_redemptions_read_own on public.coupon_redemptions for select
  using (user_id = auth.uid());

-- Everything else (coupons, email_templates, email_log) is admin / service-role only.
revoke insert, update, delete on
  public.orders, public.enrollments, public.responses, public.refunds, public.certificates,
  public.coupon_redemptions, public.coupons, public.email_log
  from anon, authenticated;
