import { supabase } from '@/shared/lib/supabase';

export type PostBoostPlan = 'day' | 'three_days' | 'week';

export async function activateDemoPostBoost(
  postId: string,
  plan: PostBoostPlan,
): Promise<{ boost_expires_at: string | null }> {
  const { data, error } = await supabase.rpc('activate_demo_post_boost', {
    target_post_id: postId,
    selected_plan: plan,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
