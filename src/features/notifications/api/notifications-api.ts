import { supabase } from '@/shared/lib/supabase';

export type AppNotification = {
  id: string;
  type:
    | 'reservation_requested'
    | 'reservation_accepted'
    | 'reservation_declined'
    | 'reservation_cancelled'
    | 'post_given'
    | 'post_boosted'
    | 'chat_message';
  title: string;
  body: string;
  postId: string | null;
  reservationId: string | null;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
};

type NotificationRow = {
  id: string;
  type: AppNotification['type'];
  title: string;
  body: string;
  post_id: string | null;
  reservation_id: string | null;
  read_at: string | null;
  created_at: string;
  expires_at: string | null;
};

export async function fetchUnreadNotificationCount(userId?: string) {
  if (!userId) {
    return 0;
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function fetchNotifications(userId?: string) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select(
      'id, type, title, body, post_id, reservation_id, read_at, created_at, expires_at',
    )
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NotificationRow[]).map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    postId: notification.post_id,
    reservationId: notification.reservation_id,
    readAt: notification.read_at,
    createdAt: notification.created_at,
    expiresAt: notification.expires_at,
  }));
}

export async function markNotificationRead(input: {
  notificationId: string;
  userId: string;
}) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', input.notificationId)
    .eq('recipient_id', input.userId)
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }
}
