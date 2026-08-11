-- Safely create profiles for any Auth users created before the profile trigger.
-- Run in Supabase Dashboard > SQL Editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
      and not tgisinternal
  ) then
    execute 'create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user()';
  end if;
end;
$$;

insert into public.profiles (id, full_name, email, phone)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  email,
  phone
from auth.users
on conflict (id) do nothing;
