create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  resume_data jsonb not null default '{}'::jsonb,
  user_id text not null,
  user_email text,
  created_at timestamptz not null default now()
);

alter table public.resumes
add column if not exists content text not null default '';

alter table public.resumes
add column if not exists resume_data jsonb not null default '{}'::jsonb;

alter table public.resumes enable row level security;

create policy "Users can view their own resumes"
on public.resumes
for select
to authenticated
using (user_id = (auth.jwt() ->> 'sub'));

create policy "Users can create their own resumes"
on public.resumes
for insert
to authenticated
with check (user_id = (auth.jwt() ->> 'sub'));

create policy "Users can update their own resumes"
on public.resumes
for update
to authenticated
using (user_id = (auth.jwt() ->> 'sub'))
with check (user_id = (auth.jwt() ->> 'sub'));

create policy "Users can delete their own resumes"
on public.resumes
for delete
to authenticated
using (user_id = (auth.jwt() ->> 'sub'));
