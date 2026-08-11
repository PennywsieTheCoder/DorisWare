-- Manage the category cards without changing frontend code.
-- Run in Supabase Dashboard > SQL Editor.

insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

create table public.categories (
  id text primary key,
  name text not null unique,
  description text not null,
  image_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

alter table public.categories enable row level security;

create policy "Anyone can view active categories"
  on public.categories for select
  using (is_active = true);

insert into public.categories (id, name, description, image_url, sort_order)
values
  ('cookware', 'Cookware', 'Pre-seasoned cast iron & steel pans.', 'https://owqjghnxrhilcekumojd.supabase.co/storage/v1/object/public/category-images/cookware.png', 1),
  ('utensils', 'Utensils', 'Hand-carved premium wooden spoons.', 'https://owqjghnxrhilcekumojd.supabase.co/storage/v1/object/public/category-images/utensils.png', 2),
  ('bakeware', 'Bakeware', 'Weighted heavy stoneware bowls.', 'https://owqjghnxrhilcekumojd.supabase.co/storage/v1/object/public/category-images/bakeware.png', 3),
  ('cutlery', 'Cutlery', 'Full tang carbon-forged knives.', 'https://owqjghnxrhilcekumojd.supabase.co/storage/v1/object/public/category-images/cutlery.png', 4),
  ('appliances', 'Appliances', 'Fast smart kitchen electricals.', 'https://owqjghnxrhilcekumojd.supabase.co/storage/v1/object/public/category-images/appliances.png', 5)
on conflict (id) do nothing;
