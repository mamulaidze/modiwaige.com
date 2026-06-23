import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, MessageCircle, PackageOpen, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { fetchMyPosts } from '@/features/account/api/profile-api';
import { useAuth } from '@/features/auth/context/use-auth';
import { ReservationStatusBadge } from '@/features/posts/components/reservation-status-badge';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { getFriendlyErrorMessage } from '@/shared/lib/errors';

export function OwnerReservationsPage() {
  const { user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const postsQuery = useQuery({
    queryKey: ['my-posts', user?.id, 'owner-reservations'],
    queryFn: () => fetchMyPosts(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const postsWithReservations = (postsQuery.data ?? [])
    .map((post) => ({
      ...post,
      reservations: post.reservations.filter(
        (reservation) =>
          reservation.status === 'pending' || reservation.status === 'accepted',
      ),
    }))
    .filter((post) => post.reservations.length > 0)
    .sort((first, second) => first.title.localeCompare(second.title));

  return (
    <PageContainer className="gap-5">
      <Seo
        noindex
        title={t('Item reservations')}
        description={t('See who reserved your items.')}
      />

      <section className="premium-card rounded-[14px] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="bg-accent text-primary flex size-11 shrink-0 items-center justify-center rounded-full">
            <CalendarCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl leading-8 font-bold tracking-tight">
              {t('Item reservations')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
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
        <EmptyState
          title={t('No item reservations yet')}
          description={t('When someone reserves your item, it will appear here.')}
        />
      ) : null}

      {postsWithReservations.length > 0 ? (
        <section className="space-y-4" aria-label={t('Item reservations')}>
          {postsWithReservations.map((post) => (
            <article
              className="premium-card overflow-hidden rounded-[14px]"
              key={post.id}
            >
              <div className="border-border/70 flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase">
                    <PackageOpen className="size-4" aria-hidden="true" />
                    {t('Item')}
                  </p>
                  <Link
                    className="mt-1 block truncate text-lg font-semibold hover:underline"
                    to={localizedPath(`/posts/${post.id}`)}
                  >
                    {post.title}
                  </Link>
                </div>
                <span className="bg-accent text-primary w-fit rounded-full px-3 py-1.5 text-sm font-semibold">
                  {post.reservations.length} {t('reservations')}
                </span>
              </div>

              <div className="divide-border divide-y">
                {post.reservations.map((reservation) => (
                  <div
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    key={reservation.id}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="flex items-center gap-2 font-semibold">
                        <User className="text-muted-foreground size-4" aria-hidden="true" />
                        <span className="truncate">
                          {reservation.requesterName}
                        </span>
                      </p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        {reservation.requesterPhoneNumber ? (
                          <a
                            className="inline-flex items-center gap-1.5 hover:text-foreground"
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
                    <div className="flex shrink-0 items-center gap-2">
                      <ReservationStatusBadge status={reservation.status} />
                      {reservation.status === 'accepted' ? (
                        <Button asChild className="h-9 px-3" variant="outline">
                          <Link to={localizedPath(`/chat/${reservation.id}`)}>
                            <MessageCircle className="size-4" aria-hidden="true" />
                            {t('Chat')}
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
