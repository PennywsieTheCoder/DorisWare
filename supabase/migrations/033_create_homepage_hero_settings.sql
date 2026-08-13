-- Admin-managed hero gallery for the top of the homepage.
create table public.homepage_hero_settings (
  id boolean primary key default true check (id),
  image_urls text[] not null default array['/images/herobanner.png'],
  updated_at timestamptz not null default now()
);

create trigger homepage_hero_settings_set_updated_at
  before update on public.homepage_hero_settings
  for each row execute procedure public.set_updated_at();

alter table public.homepage_hero_settings enable row level security;

create policy "Anyone can view homepage hero settings"
  on public.homepage_hero_settings for select using (true);

create policy "Admins can manage homepage hero settings"
  on public.homepage_hero_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.homepage_hero_settings (image_urls)
values (array['/images/herobanner.png']);

alter publication supabase_realtime add table public.homepage_hero_settings;
