-- Persistent customer addresses and saved products.
-- Run in Supabase Dashboard > SQL Editor.

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  recipient text not null,
  phone text not null,
  street text not null,
  city text not null,
  region text not null,
  country text not null default 'Ghana',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index addresses_one_default_per_user
  on public.addresses (user_id)
  where is_default;

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute procedure public.set_updated_at();

alter table public.addresses enable row level security;

create policy "Users can view their own addresses"
  on public.addresses for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own addresses"
  on public.addresses for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own addresses"
  on public.addresses for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own addresses"
  on public.addresses for delete to authenticated
  using ((select auth.uid()) = user_id);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own favorites"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own favorites"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);
