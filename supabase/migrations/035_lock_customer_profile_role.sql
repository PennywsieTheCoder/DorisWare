-- Customers may edit only their own display details. Role changes must be
-- performed through the Supabase Dashboard or a privileged server process.
-- This blocks direct REST/RPC attempts to promote a customer to admin.
revoke update on table public.profiles from public, anon, authenticated;

grant update (full_name, phone, avatar_url) on table public.profiles to authenticated;
