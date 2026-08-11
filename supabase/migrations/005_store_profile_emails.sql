-- Mirror each Auth email in public.profiles for customer records and admin use.
-- Auth remains the source of truth for sign-in and email changes.

alter table public.profiles
  add column if not exists email text;

update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where profile.id = auth_user.id
  and profile.email is distinct from auth_user.email;

create unique index if not exists profiles_email_unique
  on public.profiles (email)
  where email is not null;

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

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_email_updated'
      and tgrelid = 'auth.users'::regclass
      and not tgisinternal
  ) then
    execute 'create trigger on_auth_user_email_updated after update of email on auth.users for each row execute procedure public.sync_profile_email()';
  end if;
end;
$$;
