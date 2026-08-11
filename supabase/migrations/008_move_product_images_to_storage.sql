-- Run this only AFTER uploading castironskillet.jpg to the product-images bucket.
-- The bucket is public, so shoppers can view product images without signing in.

update public.products
set image_url = 'https://owqjghnxrhilcekumojd.supabase.co/storage/v1/object/public/product-images/castironskillet.jpg'
where id in ('skillet', 'spoons', 'bowl', 'knife', 'Cooker');
