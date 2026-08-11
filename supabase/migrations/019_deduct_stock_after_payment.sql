-- Mark a verified Paystack order as paid and deduct each item once.
-- Safe against webhook retries: an already-paid order returns without a second deduction.
create or replace function public.complete_paid_order(p_payment_reference text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_item record;
begin
  select orders.id, orders.payment_status
  into v_order
  from public.orders
  where orders.payment_reference = p_payment_reference
  for update;

  if not found then
    raise exception 'Order not found for payment reference.';
  end if;
  if v_order.payment_status = 'paid' then
    return true;
  end if;

  for v_item in
    select order_items.product_id, order_items.product_name, order_items.quantity, products.stock_quantity
    from public.order_items
    join public.products on products.id = order_items.product_id
    where order_items.order_id = v_order.id
    order by order_items.product_id
    for update of products
  loop
    if v_item.stock_quantity < v_item.quantity then
      raise exception 'Insufficient stock for %.', v_item.product_name;
    end if;

    update public.products
    set stock_quantity = stock_quantity - v_item.quantity
    where products.id = v_item.product_id;
  end loop;

  update public.orders
  set payment_status = 'paid', status = 'processing'
  where orders.id = v_order.id;

  return true;
end;
$$;

revoke all on function public.complete_paid_order(text) from public;
