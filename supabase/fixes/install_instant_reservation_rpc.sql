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

  return reservation_record;
end;
$$;

revoke all on function public.reserve_post_instant_demo(uuid) from public;
grant execute on function public.reserve_post_instant_demo(uuid) to public;
grant execute on function public.reserve_post_instant_demo(uuid) to authenticated;
grant execute on function public.reserve_post_instant_demo(uuid) to anon;

notify pgrst, 'reload schema';

select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'reserve_post_instant_demo';
