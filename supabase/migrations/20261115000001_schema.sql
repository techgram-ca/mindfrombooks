-- mindfrombooks: core schema
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------- settings
create table public.app_settings (
  id boolean primary key default true check (id),
  refund_window_days int not null default 14 check (refund_window_days >= 0),
  default_reminder_hour int not null default 8 check (default_reminder_hour between 0 and 23),
  announcement text,
  instagram_followers int not null default 35000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id) values (true) on conflict do nothing;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  timezone text not null default 'America/Toronto',
  timezone_confirmed boolean not null default false,
  reminder_hour int not null default 8 check (reminder_hour between 0 and 23),
  email_reminders boolean not null default true,
  signup_source text,
  signup_medium text,
  signup_campaign text,
  landing_page text,
  referrer text,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_email_idx on public.profiles (lower(email));
create index profiles_campaign_idx on public.profiles (signup_campaign);

-- ---------------------------------------------------------------- catalog
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  category text not null default 'General',
  emoji text not null default '📘',
  accent_color text not null default '#C8892B',
  short_description text not null default '',
  description text not null default '',
  number_reason text not null default '',
  outcomes jsonb not null default '[]'::jsonb,       -- string[]  "what you'll achieve"
  notice text,                                        -- e.g. medical disclaimer
  days int not null check (days between 1 and 366),
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'usd',
  -- Days a learner may miss and still keep the refund guarantee.
  -- Copied onto each enrollment at purchase time.
  grace_days int not null default 0 check (grace_days >= 0),
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  faq jsonb not null default '[]'::jsonb,            -- {q, a}[]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_books (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  author text not null default '',
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index course_books_course_idx on public.course_books (course_id);

create table public.course_phases (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null,
  start_day int not null check (start_day >= 1),
  end_day int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_day >= start_day)
);
create index course_phases_course_idx on public.course_phases (course_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  day_number int not null check (day_number >= 1),
  title text not null,
  book_insight text not null default '',
  book_reference text not null default '',
  instructions jsonb not null default '[]'::jsonb,   -- string[]
  response_prompt text not null default '',
  min_response_chars int not null default 0 check (min_response_chars >= 0),
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_course_day_key unique (course_id, day_number)
);

create table public.bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_cents int not null check (price_cents >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bundle_courses (
  bundle_id uuid not null references public.bundles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (bundle_id, course_id)
);

-- ---------------------------------------------------------------- coupons
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and code ~ '^[A-Z0-9_-]{2,40}$'),
  percent_off int check (percent_off between 1 and 100),
  amount_off_cents int check (amount_off_cents > 0),
  course_ids uuid[],                                  -- null = all courses + bundle
  max_redemptions int check (max_redemptions > 0),    -- null = unlimited
  times_redeemed int not null default 0,
  one_per_user boolean not null default true,
  expires_at timestamptz,
  source_label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_one_discount check ((percent_off is null) <> (amount_off_cents is null))
);

-- ---------------------------------------------------------------- commerce
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_total_cents int not null check (amount_total_cents >= 0),
  amount_discount_cents int not null default 0 check (amount_discount_cents >= 0),
  amount_refunded_cents int not null default 0 check (amount_refunded_cents >= 0),
  currency text not null default 'usd',
  coupon_id uuid references public.coupons (id) on delete set null,
  course_id uuid references public.courses (id) on delete restrict,
  bundle_id uuid references public.bundles (id) on delete restrict,
  utm_campaign text,
  status text not null default 'paid'
    check (status in ('pending', 'paid', 'partially_refunded', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_one_product check ((course_id is null) <> (bundle_id is null))
);
create index orders_user_idx on public.orders (user_id);
create index orders_payment_intent_idx on public.orders (stripe_payment_intent_id);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  order_id uuid references public.orders (id) on delete set null,
  source text not null check (source in ('stripe', 'admin_grant', 'coupon_free', 'bundle')),
  amount_paid_cents int not null default 0 check (amount_paid_cents >= 0),
  coupon_id uuid references public.coupons (id) on delete set null,
  granted_by uuid references public.profiles (id) on delete set null,
  -- Day 1. Always the day AFTER the learner enrolls / starts the course.
  -- NULL = bought in a bundle and not started yet.
  start_date date,
  timezone text not null,
  -- Snapshot of courses.grace_days at purchase time.
  grace_days int not null default 0 check (grace_days >= 0),
  status text not null default 'active'
    check (status in ('active', 'completed', 'refunded', 'revoked')),
  completed_at timestamptz,
  utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index enrollments_course_idx on public.enrollments (course_id);
create index enrollments_status_idx on public.enrollments (status);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  day_number int not null check (day_number >= 1),
  body text not null check (char_length(body) between 1 and 10000),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_starred boolean not null default false,
  testimonial_name text,
  unique (enrollment_id, day_number)
);
create index responses_user_idx on public.responses (user_id, submitted_at desc);
create index responses_starred_idx on public.responses (is_starred) where is_starred;

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid unique references public.enrollments (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  stripe_refund_id text unique,
  amount_cents int not null check (amount_cents >= 0),
  type text not null check (type in ('guarantee', 'admin_manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  one_per_user boolean not null default true,
  created_at timestamptz not null default now()
);
-- Enforces "one per user" for coupons that have it switched on.
create unique index coupon_redemptions_one_per_user
  on public.coupon_redemptions (coupon_id, user_id) where one_per_user;
create unique index coupon_redemptions_order on public.coupon_redemptions (coupon_id, order_id);

create table public.certificates (
  id text primary key,                                -- short public id
  enrollment_id uuid not null unique references public.enrollments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name_on_certificate text not null,
  days_completed int not null default 0,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- email
create table public.email_templates (
  key text primary key check (key in (
    'welcome', 'daily_reminder', 'missed_yesterday',
    'course_complete', 'refund_confirmation', 'admin_invite')),
  subject text not null,
  body_markdown text not null,
  button_label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  template_key text not null,
  enrollment_id uuid references public.enrollments (id) on delete set null,
  sent_on date not null default current_date,         -- the user's local date
  -- Daily emails share dedupe_key 'daily' so a user gets at most one per day.
  dedupe_key text,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error text,
  created_at timestamptz not null default now()
);
create unique index email_log_daily_once
  on public.email_log (user_id, dedupe_key, sent_on) where dedupe_key is not null;
create index email_log_created_idx on public.email_log (created_at desc);

-- ---------------------------------------------------------------- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'app_settings','profiles','courses','course_books','course_phases','tasks','bundles',
    'coupons','orders','enrollments','responses','refunds','certificates','email_templates']
  loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;
