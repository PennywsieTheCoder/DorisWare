-- Route public submissions through controlled RPCs so direct REST calls cannot
-- bypass validation, duplicate handling, or per-client rate limits.
create table if not exists public.public_form_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts > 0)
);

alter table public.public_form_rate_limits enable row level security;

create or replace function public.enforce_public_form_rate_limit(
  p_form text,
  p_limit integer,
  p_window interval
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  v_ip text := split_part(coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'x-real-ip', ''), ',', 1);
  v_rate_key text;
  v_attempts integer;
begin
  -- The Supabase gateway supplies this header. The fallback keeps rate limiting
  -- active even if a local development request has no forwarded address.
  v_rate_key := p_form || ':' || md5(coalesce(nullif(trim(v_ip), ''), coalesce(v_headers ->> 'user-agent', 'unknown')));

  insert into public.public_form_rate_limits as limits (rate_key, window_started_at, attempts)
  values (v_rate_key, now(), 1)
  on conflict (rate_key) do update
    set window_started_at = case when limits.window_started_at <= now() - p_window then now() else limits.window_started_at end,
        attempts = case when limits.window_started_at <= now() - p_window then 1 else limits.attempts + 1 end
  returning attempts into v_attempts;

  if v_attempts > p_limit then
    raise exception 'Too many requests. Please wait and try again.' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.subscribe_newsletter(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.enforce_public_form_rate_limit('newsletter', 3, interval '1 hour');

  if char_length(trim(coalesce(p_email, ''))) not between 3 and 320 then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;

  insert into public.newsletter_subscribers (email)
  values (lower(trim(p_email)))
  on conflict (email) do nothing;

  -- Always return success so callers cannot use this endpoint to enumerate subscribers.
  return true;
end;
$$;

create or replace function public.submit_public_support_message(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_subject text,
  p_message text,
  p_message_type text default 'support'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.enforce_public_form_rate_limit('support', 5, interval '15 minutes');

  if p_message_type not in ('support', 'suggestion') then
    raise exception 'Invalid message type.' using errcode = '22023';
  end if;

  insert into public.support_messages (first_name, last_name, email, phone, subject, message, message_type)
  values (trim(p_first_name), trim(p_last_name), lower(trim(p_email)), nullif(trim(coalesce(p_phone, '')), ''), trim(p_subject), trim(p_message), p_message_type);

  return true;
end;
$$;

drop policy if exists "Visitors can subscribe with an email" on public.newsletter_subscribers;
drop policy if exists "Visitors can send a support message" on public.support_messages;
revoke insert on table public.newsletter_subscribers, public.support_messages from public, anon, authenticated;
revoke all on function public.enforce_public_form_rate_limit(text, integer, interval) from public;
revoke all on function public.subscribe_newsletter(text) from public;
revoke all on function public.submit_public_support_message(text, text, text, text, text, text, text) from public;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;
grant execute on function public.submit_public_support_message(text, text, text, text, text, text, text) to anon, authenticated;
