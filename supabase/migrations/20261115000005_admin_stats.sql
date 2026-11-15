-- Reporting functions for the admin portal. Service role only.

-- Per-course totals. "completed" = finished the course having answered every
-- required day (within that enrollment's grace days).
create or replace function public.admin_course_stats()
returns table (
  course_id uuid,
  enrollments bigint,
  paid_enrollments bigint,
  finished bigint,
  completed bigint,
  refunded bigint
)
language sql stable security definer set search_path = public as $$
  with e as (
    select en.*, c.days,
           (select count(*) from public.responses r
             where r.enrollment_id = en.id and r.day_number <= c.days) as answered,
           (en.start_date is not null
             and (now() at time zone en.timezone)::date > en.start_date + (c.days - 1)) as is_finished
    from public.enrollments en
    join public.courses c on c.id = en.course_id
    where en.status <> 'revoked'
  )
  select c.id,
         count(e.id),
         count(e.id) filter (where e.source in ('stripe', 'bundle') and e.amount_paid_cents > 0),
         count(e.id) filter (where e.is_finished),
         count(e.id) filter (where e.is_finished and e.days - e.answered <= e.grace_days),
         count(e.id) filter (where e.status = 'refunded')
  from public.courses c
  left join e on e.course_id = c.id
  group by c.id;
$$;

-- Day-by-day drop-off for one course: how many learners reached each day and
-- how many of them responded.
create or replace function public.admin_course_dropoff(p_course_id uuid)
returns table (day_number int, title text, reached bigint, responded bigint)
language sql stable security definer set search_path = public as $$
  with c as (select days from public.courses where id = p_course_id),
  e as (
    select en.id,
           least((now() at time zone en.timezone)::date - en.start_date, c.days) as days_closed
    from public.enrollments en, c
    where en.course_id = p_course_id and en.start_date is not null and en.status <> 'revoked'
  )
  select d.day,
         t.title,
         (select count(*) from e where e.days_closed >= d.day),
         (select count(*) from e join public.responses r on r.enrollment_id = e.id
           where r.day_number = d.day and e.days_closed >= d.day)
  from c, generate_series(1, c.days) as d (day)
  left join public.tasks t on t.course_id = p_course_id and t.day_number = d.day
  order by d.day;
$$;

-- Signups, buyers and revenue grouped by the campaign people first arrived from.
create or replace function public.admin_campaign_stats()
returns table (campaign text, source text, signups bigint, buyers bigint, revenue_cents bigint)
language sql stable security definer set search_path = public as $$
  with paid as (
    select o.user_id, sum(o.amount_total_cents - o.amount_refunded_cents) as cents
    from public.orders o
    where o.status <> 'pending' and o.amount_total_cents > 0 and o.user_id is not null
    group by o.user_id
  )
  select coalesce(p.signup_campaign, '(none)'),
         coalesce(max(p.signup_source), '—'),
         count(*),
         count(paid.user_id),
         coalesce(sum(paid.cents), 0)::bigint
  from public.profiles p
  left join paid on paid.user_id = p.id
  group by coalesce(p.signup_campaign, '(none)')
  order by count(*) desc;
$$;

-- Usage and revenue per coupon.
create or replace function public.admin_coupon_stats()
returns table (coupon_id uuid, orders bigint, revenue_cents bigint)
language sql stable security definer set search_path = public as $$
  select o.coupon_id, count(*), coalesce(sum(o.amount_total_cents - o.amount_refunded_cents), 0)::bigint
  from public.orders o
  where o.coupon_id is not null and o.status <> 'pending'
  group by o.coupon_id;
$$;

-- Headline numbers for the overview page.
create or replace function public.admin_overview()
returns table (
  signups_today bigint, signups_7d bigint, signups_30d bigint, signups_total bigint,
  buyers_total bigint, buyers_30d bigint, paid_enrollments bigint,
  revenue_cents bigint, refunds_cents bigint, refund_count bigint, active_today bigint
)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from public.profiles where created_at >= now() - interval '1 day'),
    (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    (select count(*) from public.profiles where created_at >= now() - interval '30 days'),
    (select count(*) from public.profiles),
    (select count(distinct user_id) from public.orders where status <> 'pending' and amount_total_cents > 0),
    (select count(distinct o.user_id) from public.orders o join public.profiles p on p.id = o.user_id
      where o.status <> 'pending' and o.amount_total_cents > 0 and p.created_at >= now() - interval '30 days'),
    (select count(*) from public.enrollments where source in ('stripe', 'bundle') and amount_paid_cents > 0),
    (select coalesce(sum(amount_total_cents), 0) from public.orders where status <> 'pending')::bigint,
    (select coalesce(sum(amount_cents), 0) from public.refunds)::bigint,
    (select count(*) from public.refunds),
    (select count(distinct user_id) from public.responses where updated_at >= now() - interval '1 day');
$$;

revoke execute on function public.admin_course_stats() from public, anon, authenticated;
revoke execute on function public.admin_course_dropoff(uuid) from public, anon, authenticated;
revoke execute on function public.admin_campaign_stats() from public, anon, authenticated;
revoke execute on function public.admin_coupon_stats() from public, anon, authenticated;
revoke execute on function public.admin_overview() from public, anon, authenticated;
grant execute on function public.admin_course_stats() to service_role;
grant execute on function public.admin_course_dropoff(uuid) to service_role;
grant execute on function public.admin_campaign_stats() to service_role;
grant execute on function public.admin_coupon_stats() to service_role;
grant execute on function public.admin_overview() to service_role;
