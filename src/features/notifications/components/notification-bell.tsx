import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { useI18n } from '@/shared/i18n/i18n';

import { useUnreadNotifications } from '../hooks/use-unread-notifications';

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { localizedPath, t } = useI18n();
  const unreadQuery = useUnreadNotifications();
  const unreadCount = Number(unreadQuery.data ?? 0);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      aria-label={t('Notifications')}
      className="border-border bg-card text-primary relative flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-accent"
      to={localizedPath('/notifications')}
    >
      <Bell className="size-4" aria-hidden="true" />
      {unreadCount > 0 ? (
        <span className="bg-destructive text-primary-foreground absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-5 font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
