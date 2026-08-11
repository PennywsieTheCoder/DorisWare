-- Admin-managed delivery information for paid orders.
alter table public.orders
  add column if not exists estimated_delivery_at date,
  add column if not exists fulfilment_note text;
