-- Public contact details editable by administrators.
create table public.store_contact_settings (
  id boolean primary key default true check (id),
  email text not null,
  phone text not null,
  whatsapp_number text not null,
  location_label text not null,
  directions_url text not null,
  support_hours text not null,
  updated_at timestamptz not null default now()
);

create trigger store_contact_settings_set_updated_at
  before update on public.store_contact_settings
  for each row execute procedure public.set_updated_at();

alter table public.store_contact_settings enable row level security;

create policy "Anyone can view store contact settings"
  on public.store_contact_settings for select using (true);

create policy "Admins can manage store contact settings"
  on public.store_contact_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.store_contact_settings (email, phone, whatsapp_number, location_label, directions_url, support_hours)
values ('info@dorisware.com', '+233 20 000 0000', '233200000000', 'Accra, Greater Accra, Ghana', 'https://www.google.com/maps/dir/?api=1&destination=Accra%2C%20Ghana', 'Mon – Fri: 8:00 AM – 6:00 PM\nSaturday: 9:00 AM – 4:00 PM\nSunday: Closed');
