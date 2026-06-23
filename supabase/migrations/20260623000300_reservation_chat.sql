alter table public.notifications
drop constraint if exists notifications_type_check;

alter table public.notifications
add constraint notifications_type_check check (
  type in (
    'reservation_requested',
    'reservation_accepted',
    'reservation_declined',
    'reservation_cancelled',
    'post_given',
    'post_boosted',
    'chat_message'
  )
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.reservations (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'closed')),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (owner_id <> requester_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index conversations_owner_updated_at_idx
on public.conversations (owner_id, updated_at desc);

create index conversations_requester_updated_at_idx
on public.conversations (requester_id, updated_at desc);

create index messages_conversation_created_at_idx
on public.messages (conversation_id, created_at);

create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "participants read conversations"
on public.conversations for select
to authenticated
using (owner_id = auth.uid() or requester_id = auth.uid());

create policy "participants read messages"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.owner_id = auth.uid()
        or conversations.requester_id = auth.uid()
      )
  )
);

insert into public.conversations (
  reservation_id,
  post_id,
  owner_id,
  requester_id,
  status
)
select
  reservations.id,
  reservations.post_id,
  reservations.owner_id,
  reservations.requester_id,
  'active'
from public.reservations
where reservations.status = 'accepted'
on conflict (reservation_id) do nothing;

create or replace function public.sync_reservation_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.conversations (
      reservation_id,
      post_id,
      owner_id,
      requester_id,
      status,
      closed_at
    )
    values (
      new.id,
      new.post_id,
      new.owner_id,
      new.requester_id,
      'active',
      null
    )
    on conflict (reservation_id) do update
    set
      status = 'active',
      closed_at = null;
  elsif old.status = 'accepted' and new.status <> 'accepted' then
    delete from public.messages
    where conversation_id in (
      select id
      from public.conversations
      where reservation_id = new.id
    );

    update public.conversations
    set
      status = 'closed',
      closed_at = now()
    where reservation_id = new.id;
  end if;

  return new;
end;
$$;

create trigger reservations_sync_conversation
after update of status on public.reservations
for each row execute function public.sync_reservation_conversation();

create or replace function public.send_chat_message(
  target_reservation_id uuid,
  message_body text
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_record public.reservations;
  conversation_record public.conversations;
  message_record public.messages;
  recipient_id uuid;
  sender_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if char_length(trim(message_body)) not between 1 and 1000 then
    raise exception 'Message must contain between 1 and 1000 characters.';
  end if;

  select *
  into reservation_record
  from public.reservations
  where id = target_reservation_id;

  if reservation_record.id is null then
    raise exception 'Reservation was not found.';
  end if;

  if auth.uid() not in (
    reservation_record.owner_id,
    reservation_record.requester_id
  ) then
    raise exception 'You are not a participant in this chat.';
  end if;

  if reservation_record.status <> 'accepted'
    or reservation_record.expires_at is null
    or reservation_record.expires_at <= now() then
    raise exception 'This temporary chat is no longer active.';
  end if;

  select *
  into conversation_record
  from public.conversations
  where reservation_id = target_reservation_id
    and status = 'active'
  for update;

  if conversation_record.id is null then
    raise exception 'Active chat was not found.';
  end if;

  if exists (
    select 1
    from public.messages
    where conversation_id = conversation_record.id
      and sender_id = auth.uid()
      and created_at > now() - interval '1 second'
  ) then
    raise exception 'Please wait before sending another message.';
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (conversation_record.id, auth.uid(), trim(message_body))
  returning * into message_record;

  update public.conversations
  set updated_at = now()
  where id = conversation_record.id;

  recipient_id := case
    when auth.uid() = reservation_record.owner_id
      then reservation_record.requester_id
    else reservation_record.owner_id
  end;

  select display_name
  into sender_name
  from public.profiles
  where id = auth.uid();

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    post_id,
    reservation_id
  )
  values (
    recipient_id,
    'chat_message',
    'New chat message',
    coalesce(sender_name, 'Member') || ': ' || left(trim(message_body), 160),
    reservation_record.post_id,
    reservation_record.id
  );

  return message_record;
end;
$$;

revoke all on function public.send_chat_message(uuid, text) from public;
grant execute on function public.send_chat_message(uuid, text) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end;
$$;
