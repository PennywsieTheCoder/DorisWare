-- Public review feed: reveal only the reviewer's first name, never their email,
-- address, phone, or full profile.
create or replace function public.get_homepage_reviews(p_limit integer default 3)
returns table (
  id uuid,
  product_id text,
  rating smallint,
  title text,
  body text,
  created_at timestamptz,
  product_name text,
  reviewer_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    review.id,
    review.product_id,
    review.rating,
    review.title,
    review.body,
    review.created_at,
    product.name,
    nullif(split_part(trim(coalesce(profile.full_name, '')), ' ', 1), '') as reviewer_name
  from public.product_reviews as review
  join public.products as product on product.id = review.product_id
  join public.profiles as profile on profile.id = review.user_id
  where review.is_visible = true
  order by review.created_at desc
  limit least(greatest(coalesce(p_limit, 3), 1), 3);
$$;

grant execute on function public.get_homepage_reviews(integer) to anon, authenticated;
