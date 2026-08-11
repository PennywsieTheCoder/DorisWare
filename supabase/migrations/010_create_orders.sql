-- Step 1 of checkout: persistent orders and line items.
-- Run in Supabase Dashboard > SQL Editor.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed')),
  payment_method text not null
    check (payment_method in ('mobile_money', 'card')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  currency text not null default 'GHS' check (currency = 'GHS'),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping_fee numeric(10, 2) not null check (shipping_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  contact_email text not null,
  contact_phone text not null,
  shipping_address jsonb not null,
  delivery_notes text,
  payment_reference text unique,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_image_url text,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index orders_user_created_at_index on public.orders (user_id, created_at desc);
create index order_items_order_id_index on public.order_items (order_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can view their own orders"
  on public.orders for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own orders"
  on public.orders for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can view items from their own orders"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );

create policy "Users can add items to their own orders"
  on public.order_items for insert to authenticated
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );
