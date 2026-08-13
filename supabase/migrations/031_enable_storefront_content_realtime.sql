-- Keep open storefront pages in sync with administrator edits.
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.about_content;
alter publication supabase_realtime add table public.store_social_links;
alter publication supabase_realtime add table public.product_reviews;
