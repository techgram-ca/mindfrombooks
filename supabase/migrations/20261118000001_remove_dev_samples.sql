-- Removes the dev-only sample testimonials feature. Every environment ends up
-- with the same schema: only genuine testimonials, each with a permission tick.
-- Safe on a database that never had the sample feature.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'testimonials' and column_name = 'is_dev_sample'
  ) then
    execute 'delete from public.testimonials where is_dev_sample';
  end if;
end $$;

-- Belt and braces: any placeholder row, whatever its flags.
delete from public.testimonials where source_note like 'DEV SAMPLE%';

drop index if exists public.testimonials_dev_sample_idx;
alter table public.testimonials drop constraint if exists testimonials_permission_or_sample;
alter table public.testimonials drop column if exists is_dev_sample;

-- Every testimonial must again be a real quote with permission.
alter table public.testimonials drop constraint if exists testimonials_permission_confirmed_check;
alter table public.testimonials
  add constraint testimonials_permission_confirmed_check check (permission_confirmed);
