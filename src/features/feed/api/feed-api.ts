import { supabase } from '@/shared/lib/supabase';

import type { FeedFilters, FeedPost } from '../types/feed';

const PAGE_SIZE = 12;

type FeedPostRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: FeedPost['status'];
  category: FeedPost['category'];
  created_at: string;
  expires_at: string;
  boost_expires_at: string | null;
  first_image_storage_path: string | null;
};

type FetchFeedPageInput = {
  pageParam: number;
  filters: FeedFilters;
};

export type FeedPage = {
  items: FeedPost[];
  nextPage: number | null;
};

export async function fetchFeedPage({
  pageParam,
  filters,
}: FetchFeedPageInput): Promise<FeedPage> {
  const { data, error } = await supabase.rpc('get_feed_posts', {
    page_offset: pageParam * PAGE_SIZE,
    page_limit: PAGE_SIZE,
    search_query: filters.search,
    category_filter: filters.category,
    city_filter: filters.city,
    boosted_only: filters.boostedOnly,
  });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as FeedPostRow[];
  const items = await Promise.all(rows.map(mapFeedPost));

  return {
    items,
    nextPage: rows.length === PAGE_SIZE ? pageParam + 1 : null,
  };
}

async function mapFeedPost(post: FeedPostRow): Promise<FeedPost> {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    location: post.location,
    status: post.status,
    category: post.category,
    createdAt: post.created_at,
    expiresAt: post.expires_at,
    boostExpiresAt: post.boost_expires_at,
    isBoosted:
      Boolean(post.boost_expires_at) &&
      new Date(post.boost_expires_at ?? 0).getTime() > Date.now(),
    imageUrl: post.first_image_storage_path
      ? await createImageUrl(post.first_image_storage_path)
      : null,
  };
}

async function createImageUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from('post-images')
    .createSignedUrl(storagePath, 600);

  if (error) {
    console.error('Unable to create post image URL', error);
    return null;
  }

  return data.signedUrl;
}
