-- Self-paced workshops: every lesson is open at once, learners tick lessons
-- off, and a course can be sold without the refund guarantee.

alter table public.courses
  add column if not exists format text not null default 'daily',
  add column if not exists has_guarantee boolean not null default true;
alter table public.courses drop constraint if exists courses_format_check;
alter table public.courses add constraint courses_format_check check (format in ('daily', 'self_paced'));

-- Copy-able blocks on a lesson: prompts, commands (per operating system), links, notes.
alter table public.tasks add column if not exists resources jsonb not null default '[]'::jsonb;

-- Lessons a learner has marked as done.
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_number int not null check (lesson_number >= 1),
  completed_at timestamptz not null default now(),
  unique (enrollment_id, lesson_number)
);
create index if not exists lesson_progress_user_idx on public.lesson_progress (user_id);

-- YouTube video ids for lessons. Kept out of the tasks table so they are never
-- readable with the public key (sample lessons are public); the server hands
-- them only to people enrolled in the course.
create table if not exists public.lesson_videos (
  task_id uuid primary key references public.tasks (id) on delete cascade,
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists lesson_videos_set_updated_at on public.lesson_videos;
create trigger lesson_videos_set_updated_at before update on public.lesson_videos
  for each row execute function public.set_updated_at();

alter table public.lesson_progress enable row level security;
alter table public.lesson_videos enable row level security;
drop policy if exists lesson_progress_admin_all on public.lesson_progress;
create policy lesson_progress_admin_all on public.lesson_progress for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists lesson_progress_read_own on public.lesson_progress;
create policy lesson_progress_read_own on public.lesson_progress for select using (user_id = auth.uid());
drop policy if exists lesson_videos_admin_all on public.lesson_videos;
create policy lesson_videos_admin_all on public.lesson_videos for all
  using (public.is_admin()) with check (public.is_admin());
revoke insert, update, delete on public.lesson_progress, public.lesson_videos from anon, authenticated;
revoke select on public.lesson_videos from anon, authenticated;

-- ---------------------------------------------------------------- progress + refund eligibility
-- Same contract as before; self-paced courses count ticked lessons, never
-- have missed days, and courses without the guarantee are never refundable.
create or replace function public.enrollment_progress(p_enrollment_id uuid)
returns table (
  current_day int,
  total_days int,
  responded_days int,
  missed_days int[],
  grace_days int,
  is_complete boolean,
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

  if c.format = 'self_paced' then
    select coalesce(array_agg(lp.lesson_number order by lp.lesson_number), '{}') into v_resp
    from public.lesson_progress lp
    where lp.enrollment_id = e.id and lp.lesson_number <= c.days;
    v_finished := coalesce(array_length(v_resp, 1), 0) >= c.days;
    return query select
      coalesce(array_length(v_resp, 1), 0), c.days, coalesce(array_length(v_resp, 1), 0),
      '{}'::int[], 0, v_finished, false,
      case
        when e.status = 'refunded' then 'Already refunded'
        when e.status = 'revoked' then 'Access revoked'
        else 'No refund guarantee on this course'
      end,
      null::date;
    return;
  end if;

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
  elsif not c.has_guarantee then
    v_reason := 'No refund guarantee on this course';
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

-- ---------------------------------------------------------------- admin reports
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
    select en.*, c.days, c.format,
           case when c.format = 'self_paced'
             then (select count(*) from public.lesson_progress lp
                    where lp.enrollment_id = en.id and lp.lesson_number <= c.days)
             else (select count(*) from public.responses r
                    where r.enrollment_id = en.id and r.day_number <= c.days)
           end as answered,
           case when c.format = 'self_paced'
             then (select count(*) from public.lesson_progress lp
                    where lp.enrollment_id = en.id and lp.lesson_number <= c.days) >= c.days
             else (en.start_date is not null
                   and (now() at time zone en.timezone)::date > en.start_date + (c.days - 1))
           end as is_finished
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

-- Per day (daily courses) or per lesson (workshops): how many reached it and how many did it.
create or replace function public.admin_course_dropoff(p_course_id uuid)
returns table (day_number int, title text, reached bigint, responded bigint)
language sql stable security definer set search_path = public as $$
  with c as (select days, format from public.courses where id = p_course_id),
  e as (
    select en.id,
           case when c.format = 'self_paced' then c.days
                else least((now() at time zone en.timezone)::date - en.start_date, c.days) end as days_closed
    from public.enrollments en, c
    where en.course_id = p_course_id and en.status <> 'revoked'
      and (c.format = 'self_paced' or en.start_date is not null)
  )
  select d.day,
         t.title,
         (select count(*) from e where e.days_closed >= d.day),
         case when (select format from c) = 'self_paced'
           then (select count(*) from e join public.lesson_progress lp on lp.enrollment_id = e.id
                  where lp.lesson_number = d.day)
           else (select count(*) from e join public.responses r on r.enrollment_id = e.id
                  where r.day_number = d.day and e.days_closed >= d.day)
         end
  from c, generate_series(1, c.days) as d (day)
  left join public.tasks t on t.course_id = p_course_id and t.day_number = d.day
  order by d.day;
$$;
revoke execute on function public.admin_course_stats() from public, anon, authenticated;
revoke execute on function public.admin_course_dropoff(uuid) from public, anon, authenticated;
grant execute on function public.admin_course_stats() to service_role;
grant execute on function public.admin_course_dropoff(uuid) to service_role;

-- ---------------------------------------------------------------- welcome email
-- The daily-course wording moves into variables so workshops read correctly.
-- Only touches the default text; a template you edited yourself is left alone.
update public.email_templates
   set body_markdown = replace(
         replace(body_markdown,
           '{{days}} days, one small action a day.', '{{course_line}}'),
         '**{{start_line}}** Each day you get one task and answer one question. A day''s task closes at 11:59 pm your time, so try to do it early.',
         '{{start_line}}')
 where key = 'welcome';
