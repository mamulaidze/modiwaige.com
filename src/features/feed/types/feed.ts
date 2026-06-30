import type { CategoryValue } from '@/features/categories/category-taxonomy';

export type FeedCategory = CategoryValue;

export type FeedStatus = 'available' | 'reserved' | 'given';

export type FeedFilters = {
  search: string;
  category: FeedCategory | 'all';
  city: string | 'all';
  status: FeedStatus | 'all';
  boostedOnly: boolean;
};

export type FeedPost = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: FeedStatus;
  category: FeedCategory;
  createdAt: string;
  expiresAt: string;
  boostExpiresAt: string | null;
  isBoosted: boolean;
  imageUrl: string | null;
};
