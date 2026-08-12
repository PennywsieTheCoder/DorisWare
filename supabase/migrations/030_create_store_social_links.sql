create table public.store_social_links (
  platform text primary key check (platform in ('facebook', 'instagram', 'x', 'tiktok', 'pinterest')),
  url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create trigger store_social_links_set_updated_at before update on public.store_social_links for each row execute procedure public.set_updated_at();
alter table public.store_social_links enable row level security;
create policy "Anyone can view active social links" on public.store_social_links for select using (is_active);
create policy "Admins can manage social links" on public.store_social_links for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
insert into public.store_social_links (platform, url, sort_order) values ('facebook', 'https://facebook.com', 1), ('instagram', 'https://instagram.com', 2), ('x', 'https://x.com', 3), ('tiktok', 'https://tiktok.com', 4), ('pinterest', 'https://pinterest.com', 5);
