alter table public.posts
add column if not exists boost_expires_at timestamptz;

create table if not exists public.post_boosts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null check (plan in ('day', 'three_days', 'week')),
  amount_tetri integer not null check (amount_tetri >= 0),
  status text not null default 'demo_paid' check (
    status in ('pending', 'demo_paid', 'paid', 'failed', 'refunded')
  ),
  payment_provider text,
  payment_reference text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (expires_at > starts_at)
);

create index if not exists posts_active_boost_idx
on public.posts (boost_expires_at desc, created_at desc)
where status = 'available';

create index if not exists post_boosts_post_created_at_idx
on public.post_boosts (post_id, created_at desc);

alter table public.post_boosts enable row level security;

create policy "owners read their post boosts"
on public.post_boosts for select
to authenticated
using (owner_id = auth.uid());

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

  boost_start := greatest(now(), coalesce(target_post.boost_expires_at, now()));
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

  return target_post;
end;
$$;

revoke all on function public.activate_demo_post_boost(uuid, text) from public;
grant execute on function public.activate_demo_post_boost(uuid, text) to authenticated;

create or replace function public.get_feed_posts(
  page_offset integer default 0,
  page_limit integer default 12,
  search_query text default '',
  category_filter text default 'all',
  city_filter text default 'all',
  boosted_only boolean default false
)
returns table (
  id uuid,
  title text,
  description text,
  location text,
  status text,
  category text,
  created_at timestamptz,
  expires_at timestamptz,
  boost_expires_at timestamptz,
  first_image_storage_path text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    posts.id,
    posts.title,
    posts.description,
    posts.location,
    posts.status,
    posts.category,
    posts.created_at,
    posts.expires_at,
    posts.boost_expires_at,
    (
      select post_images.storage_path
      from public.post_images
      where post_images.post_id = posts.id
      order by post_images.sort_order asc
      limit 1
    ) as first_image_storage_path
  from public.posts
  where posts.status = 'available'
    and (
      trim(search_query) = ''
      or posts.title ilike '%' || search_query || '%'
      or posts.description ilike '%' || search_query || '%'
    )
    and (category_filter = 'all' or posts.category = category_filter)
    and (city_filter = 'all' or posts.location ilike '%' || city_filter || '%')
    and (
      not boosted_only
      or posts.boost_expires_at > now()
    )
  order by
    case when posts.boost_expires_at > now() then 0 else 1 end asc,
    posts.boost_expires_at desc nulls last,
    posts.created_at desc
  offset greatest(page_offset, 0)
  limit least(greatest(page_limit, 1), 50);
$$;

grant execute on function public.get_feed_posts(integer, integer, text, text, text, boolean)
to anon, authenticated;
