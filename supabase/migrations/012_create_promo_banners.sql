-- Homepage promotions managed from Admin.
-- Run in Supabase Dashboard > SQL Editor.

create table public.promo_banners (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default 'Limited Time Special Offer',
  title text not null,
  highlight text,
  description text not null,
  cta_label text not null default 'Shop now',
  cta_path text not null default '/shop',
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger promo_banners_set_updated_at
  before update on public.promo_banners
  for each row execute procedure public.set_updated_at();

alter table public.promo_banners enable row level security;

create policy "Anyone can view active promo banners"
  on public.promo_banners for select
  using (is_active = true);

create policy "Admins can manage promo banners"
  on public.promo_banners for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.promo_banners (title, highlight, description, cta_label, cta_path, sort_order)
values (
  'Summer Sale',
  'Up to 30% Off Premium Ware',
  'Refresh your kitchen with heirloom-quality cast iron skillets, weighted stoneware, and carbon steel knives at our best prices of the season. Free shipping on all orders over ₵50.',
  'Shop the Sale',
  '/shop',
  1
);
