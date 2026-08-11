-- Delivery pricing and estimates managed from Admin.
create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  regions text[] not null default '{}',
  shipping_fee numeric(10, 2) not null check (shipping_fee >= 0),
  estimated_delivery text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger delivery_zones_set_updated_at
  before update on public.delivery_zones
  for each row execute procedure public.set_updated_at();

alter table public.delivery_zones enable row level security;

create policy "Anyone can view active delivery zones"
  on public.delivery_zones for select
  using (is_active = true);

create policy "Admins can manage delivery zones"
  on public.delivery_zones for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.delivery_zones (name, regions, shipping_fee, estimated_delivery, sort_order)
values
  ('Greater Accra', array['Greater Accra'], 5.00, '1–2 business days', 1),
  ('Other Ghana regions', array['Ashanti', 'Central', 'Eastern', 'Western', 'Other'], 10.00, '2–5 business days', 2)
on conflict (name) do nothing;
