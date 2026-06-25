alter table public.profiles
drop constraint if exists profiles_id_fkey;

alter table public.profiles
alter column id set default gen_random_uuid();

alter table public.profiles
add column if not exists clerk_user_id text unique;

create or replace function public.current_profile_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  jwt_subject text;
  profile_id uuid;
begin
  jwt_subject := auth.jwt()->>'sub';

  if jwt_subject is null then
    return null;
  end if;

  if jwt_subject ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return jwt_subject::uuid;
  end if;

  select id
  into profile_id
  from public.profiles
  where clerk_user_id = jwt_subject;

  return profile_id;
end;
$$;

create or replace function public.ensure_clerk_profile(
  display_name_input text,
  avatar_url_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_subject text;
  profile_id uuid;
begin
  jwt_subject := auth.jwt()->>'sub';

  if jwt_subject is null then
    raise exception 'Authentication is required.';
  end if;

  insert into public.profiles (
    clerk_user_id,
    display_name,
    avatar_url,
    location
  )
  values (
    jwt_subject,
    coalesce(nullif(trim(display_name_input), ''), 'Gaachuqe user'),
    nullif(trim(avatar_url_input), ''),
    'Georgia'
  )
  on conflict (clerk_user_id) do update
  set
    display_name = coalesce(nullif(trim(excluded.display_name), ''), profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url)
  returning id into profile_id;

  return profile_id;
end;
$$;

revoke all on function public.ensure_clerk_profile(text, text) from public;
grant execute on function public.ensure_clerk_profile(text, text) to authenticated;

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

create or replace function public.current_profile_has_phone()
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
      and phone_number is not null
  );
$$;

drop policy if exists "users create their own profile" on public.profiles;
drop policy if exists "users update their own profile" on public.profiles;
drop policy if exists "users create their own posts" on public.posts;
drop policy if exists "owners update their own posts" on public.posts;
drop policy if exists "owners delete their own posts" on public.posts;
drop policy if exists "owners create images for their posts" on public.post_images;
drop policy if exists "owners update images for their posts" on public.post_images;
drop policy if exists "owners delete images for their posts" on public.post_images;
drop policy if exists "reservation participants can read reservations" on public.reservations;
drop policy if exists "users request available posts from others" on public.reservations;
drop policy if exists "requesters can cancel pending reservations" on public.reservations;
drop policy if exists "owners can manage reservation status" on public.reservations;
drop policy if exists "users read their notifications" on public.notifications;
drop policy if exists "users mark their notifications read" on public.notifications;
drop policy if exists "system can create notifications" on public.notifications;
drop policy if exists "users create reports" on public.reports;
drop policy if exists "reporters read their reports" on public.reports;
drop policy if exists "owners read their post boosts" on public.post_boosts;
drop policy if exists "participants read conversations" on public.conversations;
drop policy if exists "participants read messages" on public.messages;

create policy "users update their own profile"
on public.profiles for update
to authenticated
using (id = public.current_profile_id())
with check (id = public.current_profile_id());

create policy "users create their own posts"
on public.posts for insert
to authenticated
with check (
  owner_id = public.current_profile_id()
  and public.current_profile_has_phone()
);

create policy "owners update their own posts"
on public.posts for update
to authenticated
using (owner_id = public.current_profile_id())
with check (owner_id = public.current_profile_id());

create policy "owners delete their own posts"
on public.posts for delete
to authenticated
using (owner_id = public.current_profile_id());

create policy "owners create images for their posts"
on public.post_images for insert
to authenticated
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = public.current_profile_id()
  )
);

create policy "owners update images for their posts"
on public.post_images for update
to authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = public.current_profile_id()
  )
)
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = public.current_profile_id()
  )
);

create policy "owners delete images for their posts"
on public.post_images for delete
to authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = public.current_profile_id()
  )
);

create policy "reservation participants can read reservations"
on public.reservations for select
to authenticated
using (
  requester_id = public.current_profile_id()
  or owner_id = public.current_profile_id()
);

create policy "users request available posts from others"
on public.reservations for insert
to authenticated
with check (
  requester_id = public.current_profile_id()
  and requester_id <> owner_id
  and exists (
    select 1
    from public.posts
    where posts.id = reservations.post_id
      and posts.owner_id = reservations.owner_id
      and posts.status = 'available'
  )
);

create policy "requesters can cancel pending reservations"
on public.reservations for update
to authenticated
using (requester_id = public.current_profile_id() and status = 'pending')
with check (requester_id = public.current_profile_id() and status = 'cancelled');

create policy "owners can manage reservation status"
on public.reservations for update
to authenticated
using (owner_id = public.current_profile_id())
with check (owner_id = public.current_profile_id());

create policy "users read their notifications"
on public.notifications for select
to authenticated
using (recipient_id = public.current_profile_id());

create policy "users mark their notifications read"
on public.notifications for update
to authenticated
using (recipient_id = public.current_profile_id())
with check (recipient_id = public.current_profile_id());

create policy "system can create notifications"
on public.notifications for insert
to authenticated
with check (recipient_id = public.current_profile_id());

create policy "users create reports"
on public.reports for insert
to authenticated
with check (reporter_id = public.current_profile_id());

create policy "reporters read their reports"
on public.reports for select
to authenticated
using (reporter_id = public.current_profile_id());

create policy "owners read their post boosts"
on public.post_boosts for select
to authenticated
using (owner_id = public.current_profile_id());

create policy "participants read conversations"
on public.conversations for select
to authenticated
using (
  owner_id = public.current_profile_id()
  or requester_id = public.current_profile_id()
);

create policy "participants read messages"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.owner_id = public.current_profile_id()
        or conversations.requester_id = public.current_profile_id()
      )
  )
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
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_profile_has_phone() then
    raise exception 'A mobile phone number is required before reserving items.';
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

  select display_name
  into requester_name
  from public.profiles
  where id = current_user_id;

  update public.posts
  set status = 'reserved'
  where id = target_post_id;

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
  set status = 'cancelled'
  where id = target_reservation_id
  returning * into reservation_record;

  update public.posts
  set status = 'available'
  where id = reservation_record.post_id
    and status = 'reserved';

  return reservation_record;
end;
$$;

create or replace function public.mark_post_given(target_post_id uuid)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.current_profile_id();
  post_record public.posts;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into post_record
  from public.posts
  where id = target_post_id
  for update;

  if post_record.id is null then
    raise exception 'Post was not found.';
  end if;

  if post_record.owner_id <> current_user_id then
    raise exception 'Only the owner can mark this post as given.';
  end if;

  update public.posts
  set status = 'given'
  where id = target_post_id
  returning * into post_record;

  update public.reservations
  set status = 'completed'
  where post_id = target_post_id
    and status in ('pending', 'accepted');

  return post_record;
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
  current_user_id uuid := public.current_profile_id();
  reservation_record public.reservations;
  conversation_record public.conversations;
  message_record public.messages;
  recipient_id uuid;
  sender_name text;
begin
  if current_user_id is null then
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

  if current_user_id not in (
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
      and sender_id = current_user_id
      and created_at > now() - interval '1 second'
  ) then
    raise exception 'Please wait before sending another message.';
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (conversation_record.id, current_user_id, trim(message_body))
  returning * into message_record;

  update public.conversations
  set updated_at = now()
  where id = conversation_record.id;

  recipient_id := case
    when current_user_id = reservation_record.owner_id
      then reservation_record.requester_id
    else reservation_record.owner_id
  end;

  select display_name
  into sender_name
  from public.profiles
  where id = current_user_id;

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

drop policy if exists "owners upload post images" on storage.objects;
drop policy if exists "owners update post images" on storage.objects;
drop policy if exists "owners delete post images" on storage.objects;

create policy "owners upload post images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and public.is_new_owned_post_image_path(storage.objects.name, public.current_profile_id())
);

create policy "owners update post images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'post-images'
  and public.is_owned_post_image_path(storage.objects.name, public.current_profile_id())
)
with check (
  bucket_id = 'post-images'
  and public.is_new_owned_post_image_path(storage.objects.name, public.current_profile_id())
);

create policy "owners delete post images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and public.is_owned_post_image_path(storage.objects.name, public.current_profile_id())
);
