-- Admin-managed DorisWare Club rules. Checkout still awards points server-side.

create table public.club_settings (
  id boolean primary key default true check (id),
  is_active boolean not null default true,
  points_per_ghs numeric(8, 2) not null default 1 check (points_per_ghs >= 0 and points_per_ghs <= 100),
  include_delivery_in_points boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger club_settings_set_updated_at
  before update on public.club_settings
  for each row execute procedure public.set_updated_at();

alter table public.club_settings enable row level security;

create policy "Anyone can view active club settings"
  on public.club_settings for select
  using (is_active = true or (select public.is_admin()));

create policy "Admins can manage club settings"
  on public.club_settings for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.club_settings (id, is_active, points_per_ghs, include_delivery_in_points)
values (true, true, 1, false)
on conflict (id) do nothing;

create table public.club_tiers (
  id text primary key,
  name text not null,
  required_points integer not null check (required_points >= 0),
  benefit text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create unique index club_tiers_required_points_unique on public.club_tiers (required_points);

create trigger club_tiers_set_updated_at
  before update on public.club_tiers
  for each row execute procedure public.set_updated_at();

alter table public.club_tiers enable row level security;

create policy "Anyone can view active club tiers"
  on public.club_tiers for select
  using (is_active = true or (select public.is_admin()));

create policy "Admins can manage club tiers"
  on public.club_tiers for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.club_tiers (id, name, required_points, benefit, sort_order)
values
  ('culinary-enthusiast', 'Culinary Enthusiast', 0, 'Start earning points on paid orders.', 1),
  ('home-chef', 'Home Chef', 500, 'Recognition for your growing collection.', 2),
  ('master-chef', 'Master Chef', 1500, 'Top-tier DorisWare Club status.', 3)
on conflict (id) do nothing;

create or replace function public.complete_paid_order(p_payment_reference text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_item record;
  v_club record;
  v_reward_points integer := 0;
  v_eligible_amount numeric(10, 2);
begin
  select orders.id, orders.user_id, orders.subtotal, orders.shipping_fee, orders.payment_status
  into v_order
  from public.orders
  where orders.payment_reference = p_payment_reference
  for update;

  if not found then raise exception 'Order not found for payment reference.'; end if;
  if v_order.payment_status = 'paid' then return true; end if;

  for v_item in
    select order_items.product_id, order_items.product_name, order_items.quantity, products.stock_quantity
    from public.order_items
    join public.products on products.id = order_items.product_id
    where order_items.order_id = v_order.id
    order by order_items.product_id
    for update of products
  loop
    if v_item.stock_quantity < v_item.quantity then raise exception 'Insufficient stock for %.', v_item.product_name; end if;
    update public.products set stock_quantity = stock_quantity - v_item.quantity where products.id = v_item.product_id;
  end loop;

  select club_settings.is_active, club_settings.points_per_ghs, club_settings.include_delivery_in_points
  into v_club from public.club_settings where club_settings.id = true;

  if coalesce(v_club.is_active, false) then
    v_eligible_amount := coalesce(v_order.subtotal, 0)
      + case when v_club.include_delivery_in_points then coalesce(v_order.shipping_fee, 0) else 0 end;
    v_reward_points := floor(v_eligible_amount * v_club.points_per_ghs)::integer;
    update public.profiles set reward_points = reward_points + v_reward_points where profiles.id = v_order.user_id;
  end if;

  update public.orders
  set payment_status = 'paid', status = 'processing', reward_points_awarded = v_reward_points
  where orders.id = v_order.id;
  return true;
end;
$$;

revoke all on function public.complete_paid_order(text) from public;
