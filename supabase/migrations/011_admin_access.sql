-- Step 1 of admin: secure role checks and admin-only data access.
-- Run in Supabase Dashboard > SQL Editor.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create policy "Admins can view all profiles"
  on public.profiles for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can view all products"
  on public.products for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can add products"
  on public.products for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update products"
  on public.products for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete products"
  on public.products for delete to authenticated
  using ((select public.is_admin()));

create policy "Admins can view all categories"
  on public.categories for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can manage categories"
  on public.categories for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can view all orders"
  on public.orders for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can update orders"
  on public.orders for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can view all order items"
  on public.order_items for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can view managed images"
  on storage.objects for select to authenticated
  using (bucket_id in ('product-images', 'promo-banners', 'category-images') and (select public.is_admin()));

create policy "Admins can upload managed images"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('product-images', 'promo-banners', 'category-images') and (select public.is_admin()));

create policy "Admins can update managed images"
  on storage.objects for update to authenticated
  using (bucket_id in ('product-images', 'promo-banners', 'category-images') and (select public.is_admin()))
  with check (bucket_id in ('product-images', 'promo-banners', 'category-images') and (select public.is_admin()));

create policy "Admins can delete managed images"
  on storage.objects for delete to authenticated
  using (bucket_id in ('product-images', 'promo-banners', 'category-images') and (select public.is_admin()));
