-- Image storage for DorisWare. Run in Supabase Dashboard > SQL Editor.

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('promo-banners', 'promo-banners', true),
  ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Avatar files must be stored under: <authenticated-user-id>/<filename>
create policy "Users can view their own avatars"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can upload their own avatars"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can update their own avatars"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete their own avatars"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
