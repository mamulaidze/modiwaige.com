import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock3,
  MessageCircle,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { ReservationCountdown } from '@/features/posts/components/reservation-countdown';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { cn } from '@/shared/lib/cn';
import { getFriendlyErrorMessage, logErrorDetails } from '@/shared/lib/errors';
import { supabase } from '@/shared/lib/supabase';

import {
  fetchChatContext,
  markChatNotificationsRead,
  sendChatMessage,
} from '../api/chat-api';

export function ChatPage() {
  const { reservationId } = useParams();
  const { user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const messageListRef = useRef<HTMLDivElement>(null);

  const chatQuery = useQuery({
    queryKey: ['chat', reservationId],
    queryFn: () => fetchChatContext(reservationId ?? ''),
    enabled: Boolean(reservationId),
    refetchInterval: 10_000,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendChatMessage(reservationId ?? '', body),
    onSuccess: async () => {
      setMessage('');
      setSendError(null);
      await queryClient.invalidateQueries({
        queryKey: ['chat', reservationId],
      });
    },
    onError: (error) => {
      logErrorDetails('Send chat message failed', error);
      setSendError(
        getFriendlyErrorMessage(error, 'Message could not be sent.'),
      );
    },
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!reservationId || !user?.id) {
      return;
    }

    void markChatNotificationsRead(reservationId, user.id)
      .then(() => {
        void queryClient.invalidateQueries({
          queryKey: ['notifications', user.id],
        });
        void queryClient.invalidateQueries({
          queryKey: ['unread-notifications', user.id],
        });
      })
      .catch((error: unknown) => {
        logErrorDetails('Mark chat notifications read failed', error);
      });
  }, [queryClient, reservationId, user?.id]);

  useEffect(() => {
    const conversationId = chatQuery.data?.conversationId;

    if (!conversationId) {
      return;
    }

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ['chat', reservationId],
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [chatQuery.data?.conversationId, queryClient, reservationId]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatQuery.data?.messages.length]);

  const isActive = useMemo(() => {
    const chat = chatQuery.data;

    return Boolean(
      chat &&
      chat.status === 'active' &&
      chat.reservationStatus === 'accepted' &&
      chat.expiresAt &&
      new Date(chat.expiresAt).getTime() > now,
    );
  }, [chatQuery.data, now]);

  if (!reservationId) {
    return <Navigate replace to={localizedPath('/profile')} />;
  }

  if (chatQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState
          title={t('Loading chat')}
          description={t('Your temporary conversation is loading.')}
        />
      </PageContainer>
    );
  }

  if (chatQuery.error || !chatQuery.data) {
    return (
      <PageContainer>
        <EmptyState
          title={t('Chat unavailable')}
          description={t(
            getFriendlyErrorMessage(
              chatQuery.error,
              'This chat could not be opened.',
            ),
          )}
        />
      </PageContainer>
    );
  }

  const chat = chatQuery.data;
  const otherName =
    user?.id === chat.ownerId ? chat.requesterName : chat.ownerName;

  return (
    <PageContainer className="max-w-3xl gap-4">
      <Seo
        noindex
        title={`${t('Chat')} · ${chat.postTitle}`}
        description={t('Temporary reservation chat for arranging item pickup.')}
      />

      <Button asChild className="w-fit" variant="outline">
        <Link to={localizedPath(`/posts/${chat.postId}`)}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('Back to item')}
        </Link>
      </Button>

      <section className="overflow-hidden rounded-[18px] border bg-card shadow-sm">
        <header className="border-b p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="bg-accent text-primary flex size-12 shrink-0 items-center justify-center rounded-full">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="font-bold [overflow-wrap:anywhere] break-words sm:text-lg">
                {chat.postTitle}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('Chat with')} {otherName}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[10px] border border-amber-600/20 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
            <div className="flex items-start gap-2">
              <ShieldAlert
                className="mt-1 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                {t(
                  'This chat is temporary. Messages are deleted when the reservation ends, is cancelled, or the item is given.',
                )}
              </p>
            </div>
          </div>

          {isActive && chat.expiresAt ? (
            <div className="mt-3">
              <ReservationCountdown expiresAt={chat.expiresAt} />
            </div>
          ) : null}
        </header>

        <div
          className="bg-muted/25 flex max-h-[56svh] min-h-96 flex-col gap-3 overflow-y-auto p-4 sm:p-5"
          ref={messageListRef}
        >
          {chat.messages.length === 0 && isActive ? (
            <div className="m-auto max-w-sm text-center">
              <MessageCircle
                className="text-muted-foreground mx-auto size-9"
                aria-hidden="true"
              />
              <p className="mt-3 font-semibold">{t('No messages yet')}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('Use this temporary chat to arrange pickup.')}
              </p>
            </div>
          ) : null}

          {!isActive ? (
            <div className="bg-card m-auto max-w-sm rounded-[14px] border p-5 text-center">
              <Clock3
                className="text-muted-foreground mx-auto size-9"
                aria-hidden="true"
              />
              <p className="mt-3 font-bold">{t('This chat has ended')}</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {t(
                  'The reservation is no longer active, so all chat messages were deleted.',
                )}
              </p>
            </div>
          ) : null}

          {isActive
            ? chat.messages.map((chatMessage) => {
                const isOwn = chatMessage.senderId === user?.id;

                return (
                  <div
                    className={cn(
                      'flex max-w-[86%] flex-col gap-1',
                      isOwn ? 'ml-auto items-end' : 'mr-auto items-start',
                    )}
                    key={chatMessage.id}
                  >
                    <div
                      className={cn(
                        'rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap',
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-card rounded-bl-md border',
                      )}
                    >
                      {chatMessage.body}
                    </div>
                    <span className="text-muted-foreground mt-1 px-1 text-[10px]">
                      {formatMessageTime(chatMessage.createdAt, language)}
                    </span>
                  </div>
                );
              })
            : null}
        </div>

        {isActive ? (
          <form
            className="border-t bg-background/80 p-3 sm:p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmedMessage = message.trim();

              if (trimmedMessage) {
                sendMutation.mutate(trimmedMessage);
              }
            }}
          >
            <div className="flex items-end gap-2">
              <textarea
                aria-label={t('Message')}
                className="modern-input max-h-32 min-h-12 min-w-0 flex-1 resize-y rounded-[10px] px-3 py-3 text-base outline-none"
                maxLength={1000}
                placeholder={t('Write a message...')}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    const trimmedMessage = message.trim();

                    if (trimmedMessage && !sendMutation.isPending) {
                      sendMutation.mutate(trimmedMessage);
                    }
                  }
                }}
              />
              <Button
                aria-label={t('Send')}
                className="size-12 shrink-0 p-0"
                disabled={!message.trim() || sendMutation.isPending}
                type="submit"
              >
                <Send className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-2 flex justify-between gap-3 text-xs">
              <span className="text-destructive">{t(sendError ?? '')}</span>
              <span className="text-muted-foreground ml-auto">
                {message.length}/1000
              </span>
            </div>
          </form>
        ) : null}
      </section>
    </PageContainer>
  );
}

function formatMessageTime(value: string, language: string) {
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
