-- Store an ordered product gallery while retaining image_url as the primary-image fallback.
alter table public.products add column image_urls text[] not null default '{}';

update public.products
set image_urls = case
  when image_url is null or image_url = '' then '{}'
  else array[image_url]
end
where cardinality(image_urls) = 0;
