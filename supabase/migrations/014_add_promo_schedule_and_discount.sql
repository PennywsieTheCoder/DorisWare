-- A promotion can have an end time and a store-wide discount percentage.
alter table public.promo_banners
  add column if not exists ends_at timestamptz,
  add column if not exists discount_percent numeric(5, 2) not null default 0
    check (discount_percent >= 0 and discount_percent <= 100);
