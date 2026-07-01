import type { PostBoostPlan } from '../api/post-boost-api';

export type BoostPlanOption = {
  description: string;
  duration: string;
  plan: PostBoostPlan;
  price: string;
  title: string;
};

export const defaultBoostPlan: PostBoostPlan = 'three_days';

export const boostPlanOptions: BoostPlanOption[] = [
  {
    description: '24 hours near the top of the feed.',
    duration: '24 hours',
    plan: 'day',
    price: '2 GEL',
    title: 'Starter VIP',
  },
  {
    description: '3 days of priority visibility.',
    duration: '3 days',
    plan: 'three_days',
    price: '5 GEL',
    title: 'Popular VIP',
  },
  {
    description: '7 days of maximum visibility.',
    duration: '7 days',
    plan: 'week',
    price: '10 GEL',
    title: 'Maximum VIP',
  },
];

export function getBoostPlanOption(plan: PostBoostPlan) {
  return boostPlanOptions.find((option) => option.plan === plan);
}

export function parseBoostPlan(value: string | null): PostBoostPlan | null {
  return boostPlanOptions.some((option) => option.plan === value)
    ? (value as PostBoostPlan)
    : null;
}
