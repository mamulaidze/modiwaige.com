create or replace function public.sync_reservation_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  should_open_conversation boolean := false;
begin
  if new.status = 'accepted' and tg_op = 'INSERT' then
    should_open_conversation := true;
  elsif new.status = 'accepted'
    and tg_op = 'UPDATE'
    and old.status is distinct from 'accepted'
  then
    should_open_conversation := true;
  end if;

  if should_open_conversation then
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
      post_id = excluded.post_id,
      owner_id = excluded.owner_id,
      requester_id = excluded.requester_id,
      status = 'active',
      closed_at = null,
      updated_at = now();
  elsif tg_op = 'UPDATE'
    and old.status = 'accepted'
    and new.status <> 'accepted'
  then
    delete from public.messages
    where conversation_id in (
      select id
      from public.conversations
      where reservation_id = new.id
    );

    update public.conversations
    set
      status = 'closed',
      closed_at = now(),
      updated_at = now()
    where reservation_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists reservations_sync_conversation on public.reservations;
drop trigger if exists reservations_sync_conversation_insert on public.reservations;
drop trigger if exists reservations_sync_conversation_status_update on public.reservations;

create trigger reservations_sync_conversation_insert
after insert on public.reservations
for each row execute function public.sync_reservation_conversation();

create trigger reservations_sync_conversation_status_update
after update of status on public.reservations
for each row execute function public.sync_reservation_conversation();

insert into public.conversations (
  reservation_id,
  post_id,
  owner_id,
  requester_id,
  status,
  closed_at
)
select
  reservations.id,
  reservations.post_id,
  reservations.owner_id,
  reservations.requester_id,
  'active',
  null
from public.reservations
where reservations.status = 'accepted'
on conflict (reservation_id) do update
set
  post_id = excluded.post_id,
  owner_id = excluded.owner_id,
  requester_id = excluded.requester_id,
  status = 'active',
  closed_at = null,
  updated_at = now();

notify pgrst, 'reload schema';
