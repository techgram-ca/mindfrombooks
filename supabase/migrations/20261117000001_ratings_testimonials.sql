-- Course ratings (asked on completion) and admin-entered testimonials.

-- One rating per enrolment: 1–5 stars, an optional comment, and — only if the
-- learner agrees — a display name and country so the comment can be shown on
-- the course page after an admin publishes it.
create table public.course_ratings (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text check (char_length(comment) <= 600),
  share_ok boolean not null default false,
  display_name text check (char_length(display_name) <= 60),
  country text check (char_length(country) <= 60),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Only comments the learner agreed to share can ever be published.
  constraint course_ratings_publish_needs_consent
    check (not is_published or (share_ok and comment is not null))
);
create index course_ratings_course_idx on public.course_ratings (course_id);

-- Quotes the admin adds by hand (for example from Instagram DMs or email).
-- Each one records where it came from and that the person agreed to it.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade, -- null = general
  name text not null check (char_length(name) between 1 and 60),
  country text check (char_length(country) <= 60),
  body text not null check (char_length(body) between 1 and 600),
  stars int check (stars between 1 and 5),
  source_note text not null check (char_length(source_note) between 3 and 300),
  permission_confirmed boolean not null check (permission_confirmed),
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index testimonials_course_idx on public.testimonials (course_id);

create trigger course_ratings_set_updated_at before update on public.course_ratings
  for each row execute function public.set_updated_at();
create trigger testimonials_set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.course_ratings enable row level security;
alter table public.testimonials enable row level security;

create policy course_ratings_admin_all on public.course_ratings for all
  using (public.is_admin()) with check (public.is_admin());
create policy testimonials_admin_all on public.testimonials for all
  using (public.is_admin()) with check (public.is_admin());

-- Learners can read their own rating. Writes go through the server, which
-- checks the course is finished first.
create policy course_ratings_read_own on public.course_ratings for select using (user_id = auth.uid());

revoke insert, update, delete on public.course_ratings, public.testimonials from anon, authenticated;
