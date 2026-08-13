-- Keep optional customer profile details in the database. Google supplies a
-- name and avatar, but birth dates remain explicitly customer-provided.
alter table public.profiles
  add column if not exists date_of_birth date;

grant update (full_name, phone, avatar_url, date_of_birth) on table public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Fill only missing information for existing OAuth customers; never replace
-- profile values that a customer has already chosen.
update public.profiles as profile
set full_name = coalesce(profile.full_name, auth_user.raw_user_meta_data ->> 'full_name', auth_user.raw_user_meta_data ->> 'name'),
    avatar_url = coalesce(profile.avatar_url, auth_user.raw_user_meta_data ->> 'avatar_url', auth_user.raw_user_meta_data ->> 'picture')
from auth.users as auth_user
where profile.id = auth_user.id
  and (profile.full_name is null or profile.avatar_url is null);
