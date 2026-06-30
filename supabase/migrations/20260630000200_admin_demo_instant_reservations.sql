alter table public.reservations
add column if not exists cancelled_at timestamptz,
add column if not exists cancelled_by uuid references public.profiles (id) on delete set null;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = public.current_profile_id()
      and role = 'admin'
  );
$$;

create or replace function public.reservation_penalty_until(
  target_profile_id uuid default public.current_profile_id()
)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select max(cancelled_at + interval '5 hours')
  from public.reservations
  where requester_id = target_profile_id
    and cancelled_by = requester_id
    and cancelled_at is not null
    and cancelled_at + interval '5 hours' > now();
$$;

create or replace function public.activate_demo_post_boost(
  target_post_id uuid,
  selected_plan text
)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.current_profile_id();
  target_post public.posts;
  duration interval;
  price_tetri integer;
  boost_start timestamptz;
  boost_end timestamptz;
begin
  if current_user_id is null then
    raise exception 'You must be logged in to boost a post.';
  end if;

  if not public.is_admin() then
    raise exception 'VIP placement is available to admins only during demo testing.';
  end if;

  select *
  into target_post
  from public.posts
  where id = target_post_id
  for update;

  if target_post.id is null then
    raise exception 'Post was not found.';
  end if;

  if target_post.owner_id <> current_user_id then
    raise exception 'Only the post owner can boost this post.';
  end if;

  if target_post.status <> 'available' then
    raise exception 'Only available posts can be boosted.';
  end if;

  if target_post.boost_expires_at > now() then
    raise exception 'This post already has an active VIP placement.';
  end if;

  case selected_plan
    when 'day' then
      duration := interval '1 day';
      price_tetri := 200;
    when 'three_days' then
      duration := interval '3 days';
      price_tetri := 500;
    when 'week' then
      duration := interval '7 days';
      price_tetri := 1000;
    else
      raise exception 'Invalid boost plan.';
  end case;

  boost_start := now();
  boost_end := boost_start + duration;

  insert into public.post_boosts (
    post_id,
    owner_id,
    plan,
    amount_tetri,
    status,
    payment_provider,
    payment_reference,
    starts_at,
    expires_at
  )
  values (
    target_post.id,
    current_user_id,
    selected_plan,
    price_tetri,
    'demo_paid',
    'demo',
    'demo_' || gen_random_uuid()::text,
    boost_start,
    boost_end
  );

  update public.posts
  set boost_expires_at = boost_end
  where id = target_post.id
  returning * into target_post;

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    post_id,
    expires_at
  )
  values (
    current_user_id,
    'post_boosted',
    'VIP placement activated',
    'Your post is now shown as a VIP listing.',
    target_post.id,
    boost_end
  );

  return target_post;
end;
$$;

drop policy if exists "users create their own posts" on public.posts;
drop policy if exists "users request available posts from others" on public.reservations;

create policy "users create their own posts"
on public.posts for insert
to authenticated
with check (
  owner_id = public.current_profile_id()
  and public.reservation_penalty_until(public.current_profile_id()) is null
);

create policy "users request available posts from others"
on public.reservations for insert
to authenticated
with check (
  requester_id = public.current_profile_id()
  and requester_id <> owner_id
  and status = 'pending'
  and public.reservation_penalty_until(public.current_profile_id()) is null
  and exists (
    select 1
    from public.posts
    where posts.id = reservations.post_id
      and posts.owner_id = reservations.owner_id
      and posts.status = 'available'
  )
  and not exists (
    select 1
    from public.reservations existing_reservation
    where existing_reservation.post_id = reservations.post_id
      and existing_reservation.status = 'accepted'
  )
);

update public.posts
set status = 'available'
where status = 'reserved'
  and not exists (
    select 1
    from public.reservations
    where reservations.post_id = posts.id
      and reservations.status = 'accepted'
  );

create or replace function public.reserve_post(target_post_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.current_profile_id();
  post_record public.posts;
  reservation_record public.reservations;
  requester_name text;
  penalty_until timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_profile_has_phone() then
    raise exception 'A mobile phone number is required before reserving items.';
  end if;

  penalty_until := public.reservation_penalty_until(current_user_id);
  if penalty_until is not null then
    raise exception 'You can reserve or post items again after %.', penalty_until;
  end if;

  select *
  into post_record
  from public.posts
  where id = target_post_id
  for update;

  if post_record.id is null then
    raise exception 'Post was not found.';
  end if;

  if post_record.owner_id = current_user_id then
    raise exception 'Owners cannot reserve their own posts.';
  end if;

  if post_record.status <> 'available' then
    raise exception 'This item is not available.';
  end if;

  if exists (
    select 1
    from public.reservations
    where post_id = target_post_id
      and status = 'accepted'
  ) then
    raise exception 'This item is already reserved.';
  end if;

  select display_name
  into requester_name
  from public.profiles
  where id = current_user_id;

  insert into public.reservations (
    post_id,
    requester_id,
    owner_id,
    status,
    expires_at
  )
  values (
    target_post_id,
    current_user_id,
    post_record.owner_id,
    'pending',
    now() + interval '24 hours'
  )
  returning * into reservation_record;

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    post_id,
    reservation_id
  )
  values (
    post_record.owner_id,
    'reservation_requested',
    'New reservation request',
    coalesce(requester_name, 'A member') || ' reserved "' || post_record.title || '".',
    target_post_id,
    reservation_record.id
  );

  return reservation_record;
end;
$$;

create or replace function public.reserve_post_instant_demo(target_post_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.current_profile_id();
  post_record public.posts;
  reservation_record public.reservations;
  requester_name text;
  penalty_until timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.is_admin() then
    raise exception 'Instant reservation is available to admins only during demo testing.';
  end if;

  if not public.current_profile_has_phone() then
    raise exception 'A mobile phone number is required before reserving items.';
  end if;

  penalty_until := public.reservation_penalty_until(current_user_id);
  if penalty_until is not null then
    raise exception 'You can reserve or post items again after %.', penalty_until;
  end if;

  select *
  into post_record
  from public.posts
  where id = target_post_id
  for update;

  if post_record.id is null then
    raise exception 'Post was not found.';
  end if;

  if post_record.owner_id = current_user_id then
    raise exception 'Owners cannot reserve their own posts.';
  end if;

  if post_record.status <> 'available' then
    raise exception 'This item is not available.';
  end if;

  if exists (
    select 1
    from public.reservations
    where post_id = target_post_id
      and status = 'accepted'
  ) then
    raise exception 'This item is already reserved.';
  end if;

  select display_name
  into requester_name
  from public.profiles
  where id = current_user_id;

  insert into public.reservations (
    post_id,
    requester_id,
    owner_id,
    status,
    expires_at
  )
  values (
    target_post_id,
    current_user_id,
    post_record.owner_id,
    'accepted',
    now() + interval '24 hours'
  )
  returning * into reservation_record;

  update public.posts
  set status = 'reserved'
  where id = target_post_id;

  update public.reservations
  set
    status = 'declined',
    updated_at = now()
  where post_id = target_post_id
    and id <> reservation_record.id
    and status = 'pending';

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    post_id,
    reservation_id
  )
  values (
    post_record.owner_id,
    'reservation_accepted',
    'Instant reservation created',
    coalesce(requester_name, 'A member') || ' instantly reserved "' || post_record.title || '" in demo mode.',
    target_post_id,
    reservation_record.id
  );

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    post_id,
    reservation_id
  )
  values (
    current_user_id,
    'reservation_accepted',
    'Reservation accepted',
    'Your instant demo reservation was accepted. The owner can still cancel it.',
    target_post_id,
    reservation_record.id
  );

  return reservation_record;
end;
$$;

create or replace function public.cancel_reservation(target_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.current_profile_id();
  reservation_record public.reservations;
begin
  if current_user_id is null then
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

  if reservation_record.requester_id <> current_user_id then
    raise exception 'Only the requester can cancel this reservation.';
  end if;

  if reservation_record.status not in ('pending', 'accepted') then
    raise exception 'This reservation cannot be cancelled.';
  end if;

  update public.reservations
  set
    status = 'cancelled',
    cancelled_at = now(),
    cancelled_by = current_user_id
  where id = target_reservation_id
  returning * into reservation_record;

  if not exists (
    select 1
    from public.reservations
    where post_id = reservation_record.post_id
      and status = 'accepted'
  ) then
    update public.posts
    set status = 'available'
    where id = reservation_record.post_id
      and status = 'reserved';
  end if;

  return reservation_record;
end;
$$;

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
  current_user_id uuid := public.current_profile_id();
  reservation_record public.reservations;
  requester_name text;
  notification_type text;
  notification_title text;
  notification_body text;
begin
  if current_user_id is null then
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

  if reservation_record.owner_id <> current_user_id then
    raise exception 'Only the owner can manage this reservation.';
  end if;

  if reservation_record.status = 'pending' and next_status = 'accepted' then
    if exists (
      select 1
      from public.reservations
      where post_id = reservation_record.post_id
        and id <> target_reservation_id
        and status = 'accepted'
    ) then
      raise exception 'This item already has an accepted reservation.';
    end if;

    update public.reservations
    set status = 'accepted'
    where id = target_reservation_id
    returning * into reservation_record;

    update public.posts
    set status = 'reserved'
    where id = reservation_record.post_id
      and status = 'available';

    update public.reservations
    set
      status = 'declined',
      updated_at = now()
    where post_id = reservation_record.post_id
      and id <> target_reservation_id
      and status = 'pending';

    notification_type := 'reservation_accepted';
    notification_title := 'Reservation accepted';
    notification_body := 'Your reservation request was accepted.';
  elsif reservation_record.status = 'pending' and next_status = 'declined' then
    update public.reservations
    set status = 'declined'
    where id = target_reservation_id
    returning * into reservation_record;

    notification_type := 'reservation_declined';
    notification_title := 'Reservation declined';
    notification_body := 'Your reservation request was declined.';
  elsif reservation_record.status = 'accepted' and next_status = 'cancelled' then
    update public.reservations
    set
      status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = current_user_id
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

revoke all on function public.reserve_post_instant_demo(uuid) from public;
grant execute on function public.reserve_post_instant_demo(uuid) to authenticated;
revoke all on function public.activate_demo_post_boost(uuid, text) from public;
grant execute on function public.activate_demo_post_boost(uuid, text) to authenticated;
grant execute on function public.reservation_penalty_until(uuid) to authenticated;
