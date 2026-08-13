-- Only the CAPTCHA-verifying Edge Function may submit public forms. It passes
-- the request address to these private functions for per-visitor rate limits.
create or replace function public.enforce_verified_form_rate_limit(
  p_form text,
  p_client_address text,
  p_limit integer,
  p_window interval
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rate_key text := p_form || ':' || md5(coalesce(nullif(trim(p_client_address), ''), 'unknown'));
  v_attempts integer;
begin
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

create or replace function public.submit_verified_newsletter(p_email text, p_client_address text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.enforce_verified_form_rate_limit('newsletter', p_client_address, 3, interval '1 hour');
  if char_length(trim(coalesce(p_email, ''))) not between 3 and 320 or trim(p_email) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;
  insert into public.newsletter_subscribers (email) values (lower(trim(p_email))) on conflict (email) do nothing;
  return true;
end;
$$;

create or replace function public.submit_verified_support_message(
  p_first_name text, p_last_name text, p_email text, p_phone text, p_subject text,
  p_message text, p_message_type text, p_client_address text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.enforce_verified_form_rate_limit('support', p_client_address, 5, interval '15 minutes');
  if char_length(trim(coalesce(p_first_name, ''))) not between 1 and 100
    or char_length(trim(coalesce(p_last_name, ''))) not between 1 and 100
    or char_length(trim(coalesce(p_email, ''))) not between 3 and 320
    or trim(p_email) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    or char_length(trim(coalesce(p_subject, ''))) not between 1 and 200
    or char_length(trim(coalesce(p_message, ''))) not between 10 and 3000
    or p_message_type not in ('support', 'suggestion') then
    raise exception 'Enter valid message details.' using errcode = '22023';
  end if;
  insert into public.support_messages (first_name, last_name, email, phone, subject, message, message_type)
  values (trim(p_first_name), trim(p_last_name), lower(trim(p_email)), nullif(trim(coalesce(p_phone, '')), ''), trim(p_subject), trim(p_message), p_message_type);
  return true;
end;
$$;

revoke all on function public.enforce_verified_form_rate_limit(text, text, integer, interval) from public, anon, authenticated;
revoke all on function public.submit_verified_newsletter(text, text) from public, anon, authenticated;
revoke all on function public.submit_verified_support_message(text, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.subscribe_newsletter(text) from anon, authenticated;
revoke execute on function public.submit_public_support_message(text, text, text, text, text, text, text) from anon, authenticated;
