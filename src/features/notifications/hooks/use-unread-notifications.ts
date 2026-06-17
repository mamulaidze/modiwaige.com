import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/use-auth';

import { fetchUnreadNotificationCount } from '../api/notifications-api';

export function useUnreadNotifications() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['unread-notifications', user?.id],
    queryFn: () => fetchUnreadNotificationCount(user?.id),
    enabled: isAuthenticated && Boolean(user?.id),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}
