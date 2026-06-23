import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Clock3, MessageCircle, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { cn } from '@/shared/lib/cn';

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../api/notifications-api';
import { useUnreadNotifications } from '../hooks/use-unread-notifications';

export function NotificationsPage() {
  const { user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const queryClient = useQueryClient();
  const unreadQuery = useUnreadNotifications();
  const unreadCount = Number(unreadQuery.data ?? 0);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user?.id),
    enabled: Boolean(user?.id),
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

  return (
    <PageContainer className="max-w-3xl gap-6">
      <Seo noindex title={t('Notifications')} description={t('Notifications')} />

      <section className="premium-card rounded-[18px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-accent text-primary flex size-11 items-center justify-center rounded-full">
              <Bell className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {t('Notifications')}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {unreadCount > 0
                  ? `${unreadCount} ${t('unread')}`
                  : t('No unread notifications')}
              </p>
            </div>
          </div>

          {unreadCount > 0 ? (
            <Button
              disabled={markAllMutation.isPending}
              type="button"
              variant="outline"
              onClick={() => markAllMutation.mutate()}
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              {t('Mark all read')}
            </Button>
          ) : null}
        </div>
      </section>

      {notificationsQuery.isLoading ? (
        <LoadingState
          title={t('Loading notifications')}
          description={t('Loading notifications')}
        />
      ) : null}

      {notificationsQuery.error ? (
        <div className="bg-card rounded-lg border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('Could not load notifications')}
          </h2>
        </div>
      ) : null}

      {!notificationsQuery.isLoading &&
      !notificationsQuery.error &&
      (notificationsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          title={t('No notifications yet')}
          description={t('No notifications yet')}
        />
      ) : null}

      <section className="space-y-3" aria-label={t('Notifications')}>
        {notificationsQuery.data?.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            timestamp={formatNotificationTime(notification.createdAt, language)}
            to={
              notification.type === 'chat_message' &&
              notification.reservationId
                ? localizedPath(`/chat/${notification.reservationId}`)
                : notification.postId
                  ? localizedPath(`/posts/${notification.postId}`)
                  : localizedPath('/profile')
            }
            onOpen={() => {
              if (!notification.readAt) {
                markOneMutation.mutate(notification.id);
              }
            }}
          />
        ))}
      </section>
    </PageContainer>
  );
}

function NotificationRow({
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
  const isBoostNotification = notification.type === 'post_boosted';
  const isChatNotification = notification.type === 'chat_message';

  return (
    <Link
      className={cn(
        'premium-card flex gap-4 rounded-[16px] p-4 transition-colors hover:bg-accent/60',
        isUnread && 'border-primary/25 bg-primary/5',
      )}
      to={to}
      onClick={onOpen}
    >
      <span
        className={cn(
          'mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full',
          isBoostNotification
            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
            : isChatNotification
              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
              : 'bg-accent text-primary',
        )}
      >
        {isBoostNotification ? (
          <Rocket className="size-5" aria-hidden="true" />
        ) : isChatNotification ? (
          <MessageCircle className="size-5" aria-hidden="true" />
        ) : (
          <Bell className="size-5" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {getNotificationTitle(notification.type, t)}
          </span>
          {isUnread ? (
            <span className="bg-primary size-2 shrink-0 rounded-full" />
          ) : null}
        </span>
        <span className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-6">
          {notification.type === 'chat_message'
            ? notification.body
            : getNotificationBody(notification.type, t)}
        </span>
        <span className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {timestamp}
        </span>
      </span>
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
    post_boosted: 'VIP placement activated',
    chat_message: 'New chat message',
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
    post_boosted: 'Your post is now shown as a VIP listing.',
    chat_message: 'Open the temporary chat to read the message.',
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
