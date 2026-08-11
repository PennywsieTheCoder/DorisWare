-- Repair the checkout function for projects where 016 was already run.
create or replace function public.create_checkout_order(
  p_items jsonb, p_payment_method text, p_contact_email text, p_contact_phone text,
  p_shipping_address jsonb, p_shipping_fee numeric, p_delivery_notes text default null
)
returns table (id uuid, order_number text, total numeric)
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid(); v_order_id uuid;
  v_order_number text := 'DW-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  v_subtotal numeric(10, 2) := 0; v_total numeric(10, 2); v_item record; v_product record; v_promo record;
  v_unit_price numeric(10, 2); v_discount_percent numeric := 0;
begin
  if v_user_id is null then raise exception 'Sign in before placing an order.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty.'; end if;
  if p_payment_method not in ('mobile_money', 'card') then raise exception 'Choose a valid payment method.'; end if;
  if coalesce(trim(p_contact_email), '') = '' or coalesce(trim(p_contact_phone), '') = '' then raise exception 'A contact email and phone number are required.'; end if;
  if jsonb_typeof(p_shipping_address) <> 'object' then raise exception 'A shipping address is required.'; end if;
  if coalesce(p_shipping_fee, 0) < 0 then raise exception 'Shipping fee cannot be negative.'; end if;

  select promo.discount_percent, promo.discount_scope, promo.discount_categories into v_promo
  from public.promo_banners as promo
  where promo.is_active = true and (promo.ends_at is null or promo.ends_at > now())
  order by promo.sort_order limit 1;

  insert into public.orders (order_number, user_id, payment_method, subtotal, shipping_fee, total, contact_email, contact_phone, shipping_address, delivery_notes)
  values (v_order_number, v_user_id, p_payment_method, 0, coalesce(p_shipping_fee, 0), 0, trim(p_contact_email), trim(p_contact_phone), p_shipping_address, nullif(trim(p_delivery_notes), ''))
  returning orders.id into v_order_id;

  for v_item in select item.product_id, sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id text, quantity integer) group by item.product_id
  loop
    if v_item.product_id is null or v_item.quantity is null or v_item.quantity <= 0 then raise exception 'Each cart item needs a valid product and quantity.'; end if;
    select product.id, product.name, product.category, product.price, product.stock_quantity, product.image_url into v_product
    from public.products as product where product.id = v_item.product_id and product.is_active = true for update;
    if not found then raise exception 'A product in the cart is no longer available.'; end if;
    if v_product.stock_quantity < v_item.quantity then raise exception '% does not have enough stock.', v_product.name; end if;
    v_discount_percent := 0;
    if v_promo.discount_percent > 0 and (v_promo.discount_scope = 'all' or (v_promo.discount_scope = 'categories' and v_product.category = any(v_promo.discount_categories))) then v_discount_percent := v_promo.discount_percent; end if;
    v_unit_price := round(v_product.price * (1 - v_discount_percent / 100), 2);
    v_subtotal := v_subtotal + v_unit_price * v_item.quantity;
    insert into public.order_items (order_id, product_id, product_name, product_image_url, unit_price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.image_url, v_unit_price, v_item.quantity);
  end loop;
  v_total := v_subtotal + coalesce(p_shipping_fee, 0);
  update public.orders set subtotal = v_subtotal, total = v_total where orders.id = v_order_id;
  return query select v_order_id, v_order_number, v_total;
end;
$$;
