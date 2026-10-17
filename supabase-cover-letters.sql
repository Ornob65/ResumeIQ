-- Run this migration in the Supabase SQL Editor for the project used by VITE_SUPABASE_URL.
-- It is safe to run more than once.

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  cover_letter_data jsonb not null default '{}'::jsonb,
  user_id text not null,
  user_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cover_letters enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cover_letters'
      and policyname = 'Users can view their own cover letters'
  ) then
    create policy "Users can view their own cover letters"
    on public.cover_letters for select to authenticated
    using (user_id = (auth.jwt() ->> 'sub'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cover_letters'
      and policyname = 'Users can create their own cover letters'
  ) then
    create policy "Users can create their own cover letters"
    on public.cover_letters for insert to authenticated
    with check (user_id = (auth.jwt() ->> 'sub'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cover_letters'
      and policyname = 'Users can update their own cover letters'
  ) then
    create policy "Users can update their own cover letters"
    on public.cover_letters for update to authenticated
    using (user_id = (auth.jwt() ->> 'sub'))
    with check (user_id = (auth.jwt() ->> 'sub'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cover_letters'
      and policyname = 'Users can delete their own cover letters'
  ) then
    create policy "Users can delete their own cover letters"
    on public.cover_letters for delete to authenticated
    using (user_id = (auth.jwt() ->> 'sub'));
  end if;
end
$$;
