-- Store newsletter requests and customer-support messages from the storefront.
-- Run in Supabase Dashboard > SQL Editor.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create trigger newsletter_subscribers_set_updated_at
  before update on public.newsletter_subscribers
  for each row execute procedure public.set_updated_at();

alter table public.newsletter_subscribers enable row level security;

create policy "Visitors can subscribe with an email"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (
    char_length(trim(email)) between 3 and 320
    and email = lower(trim(email))
  );

create policy "Admins can view newsletter subscribers"
  on public.newsletter_subscribers for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can manage newsletter subscribers"
  on public.newsletter_subscribers for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(first_name)) between 1 and 80),
  check (char_length(trim(last_name)) between 1 and 80),
  check (char_length(trim(email)) between 3 and 320),
  check (char_length(coalesce(trim(phone), '')) <= 30),
  check (char_length(trim(subject)) between 1 and 120),
  check (char_length(trim(message)) between 10 and 3000)
);

create index support_messages_status_created_at_index
  on public.support_messages (status, created_at desc);

create trigger support_messages_set_updated_at
  before update on public.support_messages
  for each row execute procedure public.set_updated_at();

alter table public.support_messages enable row level security;

create policy "Visitors can send a support message"
  on public.support_messages for insert
  to anon, authenticated
  with check (
    char_length(trim(first_name)) between 1 and 80
    and char_length(trim(last_name)) between 1 and 80
    and char_length(trim(email)) between 3 and 320
    and char_length(trim(subject)) between 1 and 120
    and char_length(trim(message)) between 10 and 3000
  );

create policy "Admins can view support messages"
  on public.support_messages for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can manage support messages"
  on public.support_messages for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
