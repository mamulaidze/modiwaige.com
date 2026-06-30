alter table public.posts
drop constraint if exists posts_category_check;

alter table public.posts
add constraint posts_category_check check (
  category in (
    'clothing',
    'clothing_women',
    'clothing_men',
    'clothing_shoes',
    'clothing_bags',
    'clothing_accessories',
    'clothing_baby',
    'home',
    'home_furniture',
    'home_appliances',
    'home_kitchenware',
    'home_decor',
    'home_textiles',
    'home_garden',
    'electronics',
    'electronics_phones',
    'electronics_computers',
    'electronics_tv_audio',
    'electronics_photo_video',
    'electronics_gaming',
    'electronics_cables',
    'books',
    'books_fiction',
    'books_school',
    'books_university',
    'books_stationery',
    'books_art_supplies',
    'books_music_movies',
    'children',
    'children_toys',
    'children_strollers',
    'children_car_seats',
    'children_furniture',
    'children_school_supplies',
    'children_baby_care',
    'sports',
    'sports_bicycles',
    'sports_fitness',
    'sports_outdoor',
    'sports_team',
    'sports_camping',
    'sports_instruments',
    'construction',
    'construction_tools',
    'construction_paint',
    'construction_plumbing',
    'construction_electrical',
    'construction_tiles_flooring',
    'construction_doors_windows',
    'construction_wood_metal',
    'construction_hardware',
    'vehicles',
    'vehicles_car_parts',
    'vehicles_tires_wheels',
    'vehicles_motorcycle_parts',
    'vehicles_bicycle_parts',
    'vehicles_tools_accessories',
    'beauty_health',
    'beauty_health_beauty',
    'beauty_health_personal_care',
    'beauty_health_medical',
    'beauty_health_mobility',
    'pets',
    'pets_food',
    'pets_beds_houses',
    'pets_toys',
    'pets_aquarium',
    'office',
    'office_furniture',
    'office_equipment',
    'office_packaging',
    'office_shop_cafe',
    'other'
  )
);

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
    and (
      category_filter = 'all'
      or posts.category = category_filter
      or posts.category like category_filter || '\_%' escape '\'
    )
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
