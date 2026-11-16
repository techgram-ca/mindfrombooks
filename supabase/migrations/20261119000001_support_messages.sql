-- Messages sent from the Contact page. Read and answered in Admin > Support.
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null, -- set when sent while logged in
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 254),
  topic text not null default 'general'
    check (topic in ('general', 'course', 'payment', 'account', 'feedback', 'other')),
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'open' check (status in ('open', 'resolved')),
  admin_note text check (char_length(admin_note) <= 2000),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_messages_status_idx on public.support_messages (status, created_at desc);

create trigger support_messages_set_updated_at before update on public.support_messages
  for each row execute function public.set_updated_at();

alter table public.support_messages enable row level security;
create policy support_messages_admin_all on public.support_messages for all
  using (public.is_admin()) with check (public.is_admin());
-- Messages are written by the server (with spam checks), never directly.
revoke insert, update, delete on public.support_messages from anon, authenticated;
