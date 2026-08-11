-- Product catalogue foundation. Run after migrations 001–005.

create table public.products (
  id text primary key,
  name text not null,
  category text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

-- The current frontend catalogue, seeded once. Images remain in the app's
-- public images folder for now; Supabase Storage comes next.
insert into public.products (id, name, category, description, price, stock_quantity, image_url, featured)
values
  ('skillet', 'Cast Iron Skillet', 'Cookware', '10-inch, pre-seasoned, built to outlive its owner.', 38.00, 12, 'images/castironskillet.jpg', true),
  ('spoons', 'Olive Wood Spoon Set', 'Utensils', 'Three hand-carved spoons for pans that scratch easily.', 19.00, 4, 'images/castironskillet.jpg', false),
  ('bowl', 'Stoneware Mixing Bowl', 'Bakeware', 'Wide-rimmed, weighted base, does not skid on the counter.', 24.00, 2, 'images/castironskillet.jpg', true),
  ('knife', 'Chef''s Knife, 8-inch', 'Cutlery', 'Full tang, forged carbon steel, holds an edge for weeks.', 52.00, 6, 'images/castironskillet.jpg', true),
  ('Cooker', 'Electric Pressure Cooker', 'Appliances', 'Electric Pressure Cookers.', 100.00, 0, 'images/castironskillet.jpg', true)
on conflict (id) do nothing;
