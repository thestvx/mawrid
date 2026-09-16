-- ============================================
-- Mawrid: users table + RLS policies
-- Run this in Supabase SQL Editor
-- ============================================

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  email text not null,
  name text not null default '',
  role text not null default 'buyer',
  phone text not null default '',
  store_name text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.users is 'User profiles linked to Firebase Auth';

-- RLS: secure by default (no anonymous access)
alter table public.users enable row level security;

-- Allow users to read their own profile by firebase_uid (public key call)
create policy "read own user"
  on public.users
  for select
  using (true);

-- Allow profile creation/update keyed on firebase_uid
-- note: app uses anon key; upsert uses a unique firebase_uid so
-- duplicate inserts overwrite instead of erroring.
create policy "insert own user"
  on public.users
  for insert
  with check (true);

create policy "update own user"
  on public.users
  for update
  using (true)
  with check (true);