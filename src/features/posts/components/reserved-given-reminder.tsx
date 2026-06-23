import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchMyPosts } from '@/features/account/api/profile-api';
import { useAuth } from '@/features/auth/context/use-auth';
import { useI18n } from '@/shared/i18n/i18n';

export function ReservedGivenReminder() {
  const { isAuthenticated, user } = useAuth();
  const { localizedPath, t } = useI18n();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const myPostsQuery = useQuery({
    queryKey: ['my-posts', user?.id, 'reserved-given-reminder'],
    queryFn: () => fetchMyPosts(user?.id ?? ''),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 20_000,
  });

  const acceptedReservationPostIds = useMemo(
    () =>
      (myPostsQuery.data ?? [])
        .filter((post) =>
          post.reservations.some(
            (reservation) => reservation.status === 'accepted',
          ),
        )
        .map((post) => post.id)
        .sort(),
    [myPostsQuery.data],
  );

  const reminderKey =
    user?.id && acceptedReservationPostIds.length > 0
      ? `reserved-given-reminder:${user.id}:${acceptedReservationPostIds.join(',')}`
      : null;

  useEffect(() => {
    if (!reminderKey) {
      setDismissedKey(null);
      return;
    }

    setDismissedKey(
      sessionStorage.getItem(reminderKey) === 'dismissed'
        ? reminderKey
        : null,
    );
  }, [reminderKey]);

  if (!isAuthenticated || !reminderKey || dismissedKey === reminderKey) {
    return null;
  }

  function dismissReminder() {
    if (reminderKey) {
      sessionStorage.setItem(reminderKey, 'dismissed');
      setDismissedKey(reminderKey);
    }
  }

  return (
    <aside
      className="mx-auto mt-2 w-[calc(100%-1.5rem)] max-w-5xl rounded-2xl border border-amber-500/25 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-full bg-amber-500/15 p-2 text-amber-700 dark:text-amber-200">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {t('Reserved item reminder')}
          </p>
          <p className="mt-1 text-sm leading-5">
            {t(
              'If a reserved item was already given, do not forget to mark it as given.',
            )}
          </p>
          <Link
            className="mt-2 inline-flex text-sm font-semibold text-amber-800 underline-offset-4 hover:underline dark:text-amber-100"
            to={localizedPath('/profile?tab=posts')}
          >
            {t('Review reserved posts')}
          </Link>
        </div>
        <button
          aria-label={t('Dismiss')}
          className="-mr-1 rounded-full p-1 text-amber-800/70 transition hover:bg-amber-500/10 hover:text-amber-950 dark:text-amber-100/70 dark:hover:text-amber-50"
          type="button"
          onClick={dismissReminder}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
