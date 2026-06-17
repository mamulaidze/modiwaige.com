import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { Button } from '@/shared/components/ui/button';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../api/notifications-api';
import { useUnreadNotifications } from '../hooks/use-unread-notifications';

export function NotificationBell() {
  const { isAuthenticated, user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const queryClient = useQueryClient();
  const unreadQuery = useUnreadNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = Number(unreadQuery.data ?? 0);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user?.id),
    enabled: isOpen && isAuthenticated && Boolean(user?.id),
    staleTime: 10_000,
  });

  const markOneMutation = useMutation({
    mutationFn: (notificationId: string) => {
      if (!user?.id) {
        throw new Error('Authentication is required.');
      }

      return markNotificationRead({ notificationId, userId: user.id });
    },
    onSuccess: () => invalidateNotificationQueries(queryClient, user?.id),
  });

  const markAllMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) {
        throw new Error('Authentication is required.');
      }

      return markAllNotificationsRead(user.id);
    },
    onSuccess: () => invalidateNotificationQueries(queryClient, user?.id),
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-label={t('Notifications')}
        className="glass-control text-primary relative flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="bg-destructive text-primary-foreground absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-5 font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="city-picker-popover filter-panel-enter fixed top-20 right-3 left-3 z-50 max-h-[calc(100svh-6rem)] overflow-hidden rounded-3xl p-2 md:absolute md:top-12 md:right-0 md:left-auto md:w-[22rem]">
          <div className="flex items-center justify-between gap-3 px-2 py-2">
            <div>
              <h2 className="text-sm font-semibold">{t('Notifications')}</h2>
              <p className="text-muted-foreground text-xs">
                {unreadCount > 0
                  ? `${unreadCount} ${t('unread')}`
                  : t('No unread notifications')}
              </p>
            </div>
            {unreadCount > 0 ? (
              <Button
                className="h-8 px-2 text-xs"
                disabled={markAllMutation.isPending}
                type="button"
                variant="outline"
                onClick={() => markAllMutation.mutate()}
              >
                <CheckCheck className="size-3.5" aria-hidden="true" />
                {t('Mark all read')}
              </Button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto pr-1">
            {notificationsQuery.isLoading ? (
              <p className="text-muted-foreground px-3 py-4 text-sm">
                {t('Loading notifications')}
              </p>
            ) : null}

            {notificationsQuery.error ? (
              <p className="text-destructive px-3 py-4 text-sm" role="alert">
                {t('Could not load notifications')}
              </p>
            ) : null}

            {!notificationsQuery.isLoading &&
            !notificationsQuery.error &&
            (notificationsQuery.data?.length ?? 0) === 0 ? (
              <p className="text-muted-foreground px-3 py-4 text-sm">
                {t('No notifications yet')}
              </p>
            ) : null}

            {notificationsQuery.data?.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                timestamp={formatNotificationTime(
                  notification.createdAt,
                  language,
                )}
                to={
                  notification.postId
                    ? localizedPath(`/posts/${notification.postId}`)
                    : localizedPath('/profile')
                }
                onOpen={() => {
                  setIsOpen(false);

                  if (!notification.readAt) {
                    markOneMutation.mutate(notification.id);
                  }
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationItem({
  notification,
  onOpen,
  timestamp,
  to,
}: {
  notification: AppNotification;
  onOpen: () => void;
  timestamp: string;
  to: string;
}) {
  const { t } = useI18n();
  const isUnread = !notification.readAt;

  return (
    <Link
      className={cn(
        'flex gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-[var(--theme-glass-hover)]',
        isUnread && 'bg-primary/10',
      )}
      to={to}
      onClick={onOpen}
    >
      <span
        className={cn(
          'mt-1 size-2 shrink-0 rounded-full',
          isUnread ? 'bg-primary' : 'bg-muted-foreground/35',
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {getNotificationTitle(notification.type, t)}
        </span>
        <span className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
          {getNotificationBody(notification.type, t)}
        </span>
        <span className="text-muted-foreground mt-1 block text-[11px]">
          {timestamp}
        </span>
      </span>
      <ExternalLink
        className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
        aria-hidden="true"
      />
    </Link>
  );
}

function getNotificationTitle(
  type: AppNotification['type'],
  t: (text: string) => string,
) {
  const titles: Record<AppNotification['type'], string> = {
    reservation_requested: 'New reservation request',
    reservation_accepted: 'Reservation accepted',
    reservation_declined: 'Reservation declined',
    reservation_cancelled: 'Reservation cancelled',
    post_given: 'Reservation completed',
  };

  return t(titles[type]);
}

function getNotificationBody(
  type: AppNotification['type'],
  t: (text: string) => string,
) {
  const bodies: Record<AppNotification['type'], string> = {
    reservation_requested: 'Someone reserved one of your items.',
    reservation_accepted: 'Your reservation request was accepted.',
    reservation_declined: 'Your reservation request was declined.',
    reservation_cancelled: 'A reservation was cancelled.',
    post_given: 'The item was marked as given.',
  };

  return t(bodies[type]);
}

function formatNotificationTime(value: string, language: string) {
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

function invalidateNotificationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
  void queryClient.invalidateQueries({
    queryKey: ['unread-notifications', userId],
  });
}
