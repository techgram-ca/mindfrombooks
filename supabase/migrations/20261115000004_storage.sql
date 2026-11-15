-- Public bucket for course cover images and "inspired by" card images that the
-- admin uploads. Uploads happen server-side with the service role.
insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', true)
on conflict (id) do nothing;
