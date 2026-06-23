import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import {
  fetchMyPosts,
  fetchReservedItems,
} from '@/features/account/api/profile-api';
import { ReservationStatusBadge } from '@/features/posts/components/reservation-status-badge';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { getFriendlyErrorMessage } from '@/shared/lib/errors';
import { buildChatInboxRows } from '../utils/chat-inbox';

export function ChatsPage() {
  const { user } = useAuth();
  const { localizedPath, t } = useI18n();

  const reservedItemsQuery = useQuery({
    queryKey: ['reserved-items', user?.id],
    queryFn: () => fetchReservedItems(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const myPostsQuery = useQuery({
    queryKey: ['my-posts', user?.id],
    queryFn: () => fetchMyPosts(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  if (!user?.id) {
    return <Navigate replace to={localizedPath('/login')} />;
  }

  const isLoading = reservedItemsQuery.isLoading || myPostsQuery.isLoading;
  const error = reservedItemsQuery.error ?? myPostsQuery.error;
  const chats = buildChatInboxRows(
    reservedItemsQuery.data ?? [],
    myPostsQuery.data ?? [],
  );
  const hasOwnerChats = chats.some((chat) => chat.role === 'owner');

  return (
    <PageContainer className="max-w-3xl gap-5">
      <Seo
        noindex
        title={t('Chats')}
        description={t('Temporary reservation chat for arranging item pickup.')}
      />

      <Button asChild className="w-fit" variant="outline">
        <Link to={localizedPath('/profile')}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('Back')}
        </Link>
      </Button>

      <section className="premium-card rounded-[18px] p-5">
        <div className="flex items-center gap-3">
          <span className="bg-accent text-primary flex size-12 items-center justify-center rounded-full">
            <MessageCircle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('Chats')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('Accepted reservations with active chats will appear here.')}
            </p>
          </div>
        </div>
      </section>

      {hasOwnerChats ? (
        <div className="rounded-[14px] border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-800 dark:text-amber-200">
          {t(
            'If a reserved item was already given, do not forget to mark it as given.',
          )}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState
          title={t('Loading chat')}
          description={t('Your temporary conversation is loading.')}
        />
      ) : null}

      {error ? (
        <div className="bg-card rounded-lg border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('This chat could not be opened.')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t(getFriendlyErrorMessage(error))}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && chats.length === 0 ? (
        <EmptyState
          title={t('No conversations yet')}
          description={t('Accepted reservations with active chats will appear here.')}
        />
      ) : null}

      <section className="space-y-3" aria-label={t('Chats')}>
        {chats.map((chat) => (
          <Link
            className="premium-card flex min-w-0 items-center gap-4 rounded-[16px] p-4 transition-colors hover:bg-accent/60"
            key={`${chat.role}-${chat.id}`}
            to={localizedPath(`/chat/${chat.id}`)}
          >
            <span className="bg-accent text-primary flex size-12 shrink-0 items-center justify-center rounded-full">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {chat.counterpartName} · {chat.itemTitle}
              </span>
              <span className="text-muted-foreground mt-1 block truncate text-sm">
                {chat.role === 'owner'
                  ? t('Requester chat')
                  : t('Author chat')}
              </span>
            </span>
            <span className="hidden shrink-0 sm:block">
              <ReservationStatusBadge status={chat.status} />
            </span>
          </Link>
        ))}
      </section>
    </PageContainer>
  );
}
