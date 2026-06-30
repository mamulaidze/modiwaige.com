import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck,
  MessageCircle,
  PackageOpen,
  Phone,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchMyPosts } from '@/features/account/api/profile-api';
import { useAuth } from '@/features/auth/context/use-auth';
import { ReservationStatusBadge } from '@/features/posts/components/reservation-status-badge';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { getFriendlyErrorMessage } from '@/shared/lib/errors';

type ReservationSort = 'newest' | 'oldest' | 'most' | 'item_asc' | 'item_desc';

export function OwnerReservationsPage() {
  const { user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const [sortMode, setSortMode] = useState<ReservationSort>('newest');
  const postsQuery = useQuery({
    queryKey: ['my-posts', user?.id, 'owner-reservations'],
    queryFn: () => fetchMyPosts(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const postsWithReservations = useMemo(() => {
    const activePosts = (postsQuery.data ?? [])
      .map((post) => ({
        ...post,
        reservations: post.reservations.filter(
          (reservation) =>
            reservation.status === 'pending' ||
            reservation.status === 'accepted',
        ),
      }))
      .filter((post) => post.reservations.length > 0);

    return activePosts.sort((first, second) => {
      if (sortMode === 'item_asc') {
        return first.title.localeCompare(second.title);
      }

      if (sortMode === 'item_desc') {
        return second.title.localeCompare(first.title);
      }

      if (sortMode === 'most') {
        return second.reservations.length - first.reservations.length;
      }

      const firstReservationTime = getReservationSortTime(
        first.reservations[0]?.createdAt,
      );
      const secondReservationTime = getReservationSortTime(
        second.reservations[0]?.createdAt,
      );

      return sortMode === 'oldest'
        ? firstReservationTime - secondReservationTime
        : secondReservationTime - firstReservationTime;
    });
  }, [postsQuery.data, sortMode]);

  const totalReservations = postsWithReservations.reduce(
    (total, post) => total + post.reservations.length,
    0,
  );

  return (
    <PageContainer className="gap-3 pb-36 md:gap-4 md:pb-10">
      <Seo
        noindex
        title={t('Item reservations')}
        description={t('See who reserved your items.')}
      />

      <section className="premium-card rounded-[14px] p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <span className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-[12px]">
            <CalendarCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg leading-6 font-bold tracking-tight sm:text-xl">
              {t('Item reservations')}
            </h1>
            <p className="text-muted-foreground mt-0.5 truncate text-sm">
              {t('See who reserved your items.')}
            </p>
          </div>
        </div>
      </section>

      {postsQuery.isLoading ? (
        <LoadingState
          title={t('Loading reservations')}
          description={t('Checking who reserved your items.')}
        />
      ) : null}

      {postsQuery.isError ? (
        <div className="bg-card rounded-[14px] border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('Could not load reservations')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t(getFriendlyErrorMessage(postsQuery.error))}
          </p>
        </div>
      ) : null}

      {!postsQuery.isLoading &&
      !postsQuery.isError &&
      postsWithReservations.length === 0 ? (
        <section className="border-border bg-card rounded-[14px] border border-dashed p-5 text-center sm:p-6">
          <span className="bg-accent text-primary mx-auto flex size-11 items-center justify-center rounded-[12px]">
            <PackageOpen className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mx-auto mt-4 max-w-sm text-lg leading-6 font-bold">
            {t('No item reservations yet')}
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-5">
            {t('When someone reserves your item, it will appear here.')}
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild className="h-10">
              <Link to={localizedPath('/create')}>{t('Post an item')}</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {postsWithReservations.length > 0 ? (
        <section className="space-y-3" aria-label={t('Item reservations')}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
                {t('Item reservations')}
              </p>
              <p className="text-sm font-semibold">
                {totalReservations} {t('reservations')}
              </p>
            </div>
            <Select
              value={sortMode}
              onValueChange={(value) => setSortMode(value as ReservationSort)}
            >
              <SelectTrigger
                aria-label={t('Sort')}
                className="h-9 w-[142px] shrink-0 rounded-full px-3 text-sm sm:w-44"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="w-44">
                <SelectItem value="newest">{t('Newest')}</SelectItem>
                <SelectItem value="oldest">{t('Oldest')}</SelectItem>
                <SelectItem value="most">{t('Most reservations')}</SelectItem>
                <SelectItem value="item_asc">{t('Item')} A-Z</SelectItem>
                <SelectItem value="item_desc">{t('Item')} Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {postsWithReservations.map((post) => (
            <article
              className="bg-card border-border overflow-hidden rounded-[14px] border"
              key={post.id}
            >
              <div className="border-border/70 flex items-start justify-between gap-3 border-b p-3">
                <div className="min-w-0">
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase">
                    <PackageOpen className="size-3.5" aria-hidden="true" />
                    {t('Item')}
                  </p>
                  <Link
                    className="mt-0.5 block truncate text-base font-semibold hover:underline"
                    to={localizedPath(`/posts/${post.id}`)}
                  >
                    {post.title}
                  </Link>
                </div>
                <span className="bg-accent text-primary shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold">
                  {post.reservations.length} {t('reservations')}
                </span>
              </div>

              <div className="divide-border divide-y">
                {post.reservations.map((reservation) => (
                  <div
                    className="flex items-start justify-between gap-3 p-3"
                    key={reservation.id}
                  >
                    <div className="min-w-0 space-y-1.5">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <User
                          className="text-muted-foreground size-3.5"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {reservation.requesterName}
                        </span>
                      </p>
                      <div className="text-muted-foreground flex flex-col gap-1 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                        {reservation.requesterPhoneNumber ? (
                          <a
                            className="hover:text-foreground inline-flex items-center gap-1.5"
                            href={`tel:${reservation.requesterPhoneNumber}`}
                          >
                            <Phone className="size-3.5" aria-hidden="true" />
                            {reservation.requesterPhoneNumber}
                          </a>
                        ) : null}
                        <span>
                          {new Intl.DateTimeFormat(
                            getLanguageLocale(language),
                            {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            },
                          ).format(new Date(reservation.createdAt))}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <ReservationStatusBadge status={reservation.status} />
                      {reservation.status === 'accepted' ? (
                        <Button
                          asChild
                          className="h-8 rounded-full px-2.5 text-xs"
                          variant="outline"
                        >
                          <Link to={localizedPath(`/chat/${reservation.id}`)}>
                            <MessageCircle
                              className="size-4"
                              aria-hidden="true"
                            />
                            <span className="hidden sm:inline">
                              {t('Chat')}
                            </span>
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </PageContainer>
  );
}

function getReservationSortTime(createdAt: string | undefined) {
  return createdAt ? new Date(createdAt).getTime() : 0;
}
