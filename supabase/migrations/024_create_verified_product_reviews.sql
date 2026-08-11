-- Verified product reviews. A customer can review a product once after a paid,
-- delivered order containing that product. Admins decide which reviews are public.

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  is_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id),
  check (char_length(coalesce(title, '')) <= 100),
  check (char_length(coalesce(body, '')) <= 1000)
);

create index product_reviews_product_visible_created_index
  on public.product_reviews (product_id, created_at desc)
  where is_visible = true;

create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute procedure public.set_updated_at();

alter table public.product_reviews enable row level security;

create policy "Anyone can view visible product reviews"
  on public.product_reviews for select
  using (is_visible = true or (select auth.uid()) = user_id);

create policy "Verified customers can write product reviews"
  on public.product_reviews for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.orders as customer_order
      join public.order_items as customer_item on customer_item.order_id = customer_order.id
      where customer_order.user_id = (select auth.uid())
        and customer_order.payment_status = 'paid'
        and customer_order.status = 'delivered'
        and customer_item.product_id = product_reviews.product_id
    )
  );

create policy "Admins can manage product reviews"
  on public.product_reviews for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
