-- Persist the preferred cookware field from the customer profile.
alter table public.profiles
  add column if not exists cooking_style text;

grant update (cooking_style) on table public.profiles to authenticated;
