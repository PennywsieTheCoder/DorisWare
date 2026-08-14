-- Fetch product reviews in small pages so products with many reviews stay fast.
create or replace function public.get_product_reviews(
  p_product_id text,
  p_limit integer default 5,
  p_offset integer default 0
)
returns table (
  id uuid,
  user_id uuid,
  rating smallint,
  title text,
  body text,
  is_visible boolean,
  created_at timestamptz,
  reviewer_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    review.id,
    review.user_id,
    review.rating,
    review.title,
    review.body,
    review.is_visible,
    review.created_at,
    nullif(split_part(trim(coalesce(profile.full_name, '')), ' ', 1), '') as reviewer_name
  from public.product_reviews as review
  join public.profiles as profile on profile.id = review.user_id
  where review.product_id = p_product_id
    and (review.is_visible = true or review.user_id = (select auth.uid()))
  order by review.created_at desc
  limit least(greatest(coalesce(p_limit, 5), 1), 6)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

grant execute on function public.get_product_reviews(text, integer, integer) to anon, authenticated;
