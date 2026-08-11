-- One editable About-page story, managed from the Admin workspace.

create table public.about_content (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default 'Our story',
  title text not null,
  description text not null,
  image_url text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger about_content_set_updated_at
  before update on public.about_content
  for each row execute procedure public.set_updated_at();

alter table public.about_content enable row level security;

create policy "Anyone can view active about content"
  on public.about_content for select
  using (is_active = true);

create policy "Admins can manage about content"
  on public.about_content for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.about_content (title, description)
values (
  'Tools for the everyday kitchen.',
  'DorisWare brings considered kitchen essentials to home cooks who value craft, durability, and everyday usefulness.'
);
