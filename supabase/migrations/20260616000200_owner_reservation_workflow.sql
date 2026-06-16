drop policy if exists "owners can manage reservation status" on public.reservations;

create or replace function public.manage_reservation(
  target_reservation_id uuid,
  next_status text
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_record public.reservations;
  requester_name text;
  notification_type text;
  notification_title text;
  notification_body text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into reservation_record
  from public.reservations
  where id = target_reservation_id
  for update;

  if reservation_record.id is null then
    raise exception 'Reservation was not found.';
  end if;

  if reservation_record.owner_id <> auth.uid() then
    raise exception 'Only the owner can manage this reservation.';
  end if;

  -- Business rules:
  -- Owners accept or reject pending requests.
  -- Owners can cancel accepted requests before pickup.
  -- Owners complete accepted requests when the item is handed over.
  if reservation_record.status = 'pending' and next_status = 'accepted' then
    update public.reservations
    set status = 'accepted'
    where id = target_reservation_id
    returning * into reservation_record;

    notification_type := 'reservation_accepted';
    notification_title := 'Reservation accepted';
    notification_body := 'Your reservation request was accepted.';
  elsif reservation_record.status = 'pending' and next_status = 'declined' then
    update public.reservations
    set status = 'declined'
    where id = target_reservation_id
    returning * into reservation_record;

    update public.posts
    set status = 'available'
    where id = reservation_record.post_id
      and status = 'reserved';

    notification_type := 'reservation_declined';
    notification_title := 'Reservation declined';
    notification_body := 'Your reservation request was declined.';
  elsif reservation_record.status = 'accepted' and next_status = 'cancelled' then
    update public.reservations
    set status = 'cancelled'
    where id = target_reservation_id
    returning * into reservation_record;

    update public.posts
    set status = 'available'
    where id = reservation_record.post_id
      and status = 'reserved';

    notification_type := 'reservation_cancelled';
    notification_title := 'Reservation cancelled';
    notification_body := 'The owner cancelled this reservation.';
  elsif reservation_record.status = 'accepted' and next_status = 'completed' then
    update public.reservations
    set status = 'completed'
    where id = target_reservation_id
    returning * into reservation_record;

    update public.posts
    set status = 'given'
    where id = reservation_record.post_id;

    notification_type := 'post_given';
    notification_title := 'Reservation completed';
    notification_body := 'The item was marked as given.';
  else
    raise exception 'This reservation status change is not allowed.';
  end if;

  select display_name
  into requester_name
  from public.profiles
  where id = reservation_record.requester_id;

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    post_id,
    reservation_id
  )
  values (
    reservation_record.requester_id,
    notification_type,
    notification_title,
    coalesce(requester_name, 'Member') || ': ' || notification_body,
    reservation_record.post_id,
    reservation_record.id
  );

  return reservation_record;
end;
$$;

grant execute on function public.manage_reservation(uuid, text) to authenticated;
