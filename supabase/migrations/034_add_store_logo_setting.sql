-- A public logo URL shared by the storefront header and footer.
alter table public.store_contact_settings
  add column logo_url text not null default '/logo.png';
