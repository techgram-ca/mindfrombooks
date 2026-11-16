-- Lets dev and staging hold clearly-marked SAMPLE testimonials for previewing
-- the layout. Sample rows need no customer permission (there is no customer),
-- and the app never shows them on the production deployment.
alter table public.testimonials
  add column if not exists is_dev_sample boolean not null default false;

alter table public.testimonials drop constraint if exists testimonials_permission_confirmed_check;
alter table public.testimonials drop constraint if exists testimonials_permission_or_sample;
alter table public.testimonials
  add constraint testimonials_permission_or_sample check (permission_confirmed or is_dev_sample);

create index if not exists testimonials_dev_sample_idx on public.testimonials (is_dev_sample) where is_dev_sample;
