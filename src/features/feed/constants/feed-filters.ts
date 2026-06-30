import { postCityOptions } from '@/features/posts/constants/post-options';
import {
  flatCategoryOptions,
  topLevelCategoryOptions,
} from '@/features/categories/category-taxonomy';

import type { FeedCategory } from '../types/feed';

export const categoryOptions: Array<{
  label: string;
  value: FeedCategory | 'all';
}> = [
  { label: 'All categories', value: 'all' },
  ...flatCategoryOptions.map((option) => ({
    label: option.label,
    value: option.value,
  })),
];

export const topLevelFeedCategoryOptions: Array<{
  label: string;
  value: FeedCategory | 'all';
}> = [
  { label: 'All categories', value: 'all' },
  ...topLevelCategoryOptions.map((option) => ({
    label: option.label,
    value: option.value,
  })),
];

export const cityOptions = [
  { label: 'All cities', value: 'all' },
  ...postCityOptions.map((city) => ({ label: city, value: city })),
] as const;
