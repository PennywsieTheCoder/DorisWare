-- Orders must be created through create_checkout_order(), not directly from the browser.
drop policy if exists "Users can create their own orders" on public.orders;
drop policy if exists "Users can add items to their own orders" on public.order_items;
