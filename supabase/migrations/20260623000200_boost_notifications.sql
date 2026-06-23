alter table public.notifications
add column if not exists expires_at timestamptz;

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
    'post_boosted'
  )
);

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
  target_post public.posts;
  duration interval;
  price_tetri integer;
  boost_start timestamptz;
  boost_end timestamptz;
begin
  if auth.uid() is null then
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

  if target_post.owner_id <> auth.uid() then
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
    auth.uid(),
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
    auth.uid(),
    'post_boosted',
    'VIP placement activated',
    'Your post is now shown as a VIP listing.',
    target_post.id,
    boost_end
  );

  return target_post;
end;
$$;

revoke all on function public.activate_demo_post_boost(uuid, text) from public;
grant execute on function public.activate_demo_post_boost(uuid, text) to authenticated;
