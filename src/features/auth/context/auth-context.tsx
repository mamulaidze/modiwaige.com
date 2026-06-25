import { useSession, useUser } from '@clerk/clerk-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
  supabase,
  setSupabaseAccessTokenProvider,
} from '@/shared/lib/supabase';
import { AuthContext, type AuthContextValue } from './auth-context-value';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const clerkSession = useSession();
  const clerkUser = useUser();
  const [profileId, setProfileId] = useState<string | null>(null);
  const isClerkLoading = !clerkSession.isLoaded || !clerkUser.isLoaded;

  useEffect(() => {
    setSupabaseAccessTokenProvider(async () => {
      return clerkSession.session?.getToken() ?? null;
    });

    return () => {
      setSupabaseAccessTokenProvider(null);
    };
  }, [clerkSession.session]);

  useEffect(() => {
    let isMounted = true;

    async function syncProfile() {
      if (!clerkUser.user) {
        setProfileId(null);
        return;
      }

      const displayName =
        clerkUser.user.fullName ??
        clerkUser.user.primaryEmailAddress?.emailAddress?.split('@')[0] ??
        'Gaachuqe user';

      const { data, error } = await supabase.rpc('ensure_clerk_profile', {
        avatar_url_input: clerkUser.user.imageUrl ?? null,
        display_name_input: displayName,
      });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Unable to sync Clerk profile', error);
        setProfileId(null);
        return;
      }

      setProfileId(data);
    }

    if (!isClerkLoading) {
      void syncProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [clerkUser.user, isClerkLoading]);

  const value = useMemo<AuthContextValue>(() => {
    const user = clerkUser.user;
    const email = user?.primaryEmailAddress?.emailAddress;

    return {
      user:
        user && profileId
          ? {
              id: profileId,
              email,
              phone: user.primaryPhoneNumber?.phoneNumber ?? null,
              user_metadata: {
                avatar_url: user.imageUrl,
                display_name:
                  user.fullName ?? email?.split('@')[0] ?? 'Gaachuqe user',
                first_name: user.firstName ?? undefined,
                last_name: user.lastName ?? undefined,
              },
            }
          : null,
      session: clerkSession.session ?? null,
      isLoading: isClerkLoading || Boolean(user && !profileId),
      isAuthenticated: Boolean(user && profileId),
    };
  }, [clerkSession.session, clerkUser.user, isClerkLoading, profileId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
