-- Keep customer ideas separate from support requests while retaining one admin inbox.
alter table public.support_messages
  add column message_type text not null default 'support'
  check (message_type in ('support', 'suggestion'));

create index support_messages_type_status_created_at_index
  on public.support_messages (message_type, status, created_at desc);
