-- A promotion can discount every in-stock product or selected categories only.
alter table public.promo_banners
  add column if not exists discount_scope text not null default 'all'
    check (discount_scope in ('all', 'categories')),
  add column if not exists discount_categories text[] not null default '{}';
