-- ============================================
-- Mawrid: categories + products tables & RLS
-- Run this in Supabase SQL Editor (after users.sql)
-- ============================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text not null default '',
  slug text unique not null default '',
  icon text not null default '',
  enabled boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is 'Marketplace product categories';

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text not null default '',
  description text not null default '',
  price numeric(10, 2) not null default 0,
  sale_price numeric(10, 2),
  category_id uuid references public.categories(id) on delete set null,
  seller_id text not null default '',
  seller_name text not null default '',
  store_name text not null default '',
  thumbnail text not null default '',
  images jsonb not null default '[]',
  tags jsonb not null default '[]',
  stock int not null default 0,
  status text not null default 'pending',
  featured boolean not null default false,
  sales int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'Marketplace products';

-- indexes
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_seller_id_idx on public.products (seller_id);

-- RLS (matches users.sql policy pattern used by the app anon client)
alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "read all categories"
  on public.categories for select using (true);

create policy "insert all categories"
  on public.categories for insert with check (true);

create policy "update all categories"
  on public.categories for update using (true) with check (true);

create policy "delete all categories"
  on public.categories for delete using (true);

create policy "read all products"
  on public.products for select using (true);

create policy "insert all products"
  on public.products for insert with check (true);

create policy "update all products"
  on public.products for update using (true) with check (true);

create policy "delete all products"
  on public.products for delete using (true);