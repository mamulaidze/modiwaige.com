import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
let accessTokenProvider: (() => Promise<string | null>) | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not configured.');
}

export const supabase = createClient<Database>(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    accessToken: async () => accessTokenProvider?.() ?? null,
  },
);

export function setSupabaseAccessTokenProvider(
  provider: (() => Promise<string | null>) | null,
) {
  accessTokenProvider = provider;
}
