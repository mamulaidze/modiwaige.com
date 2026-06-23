import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  CalendarDays,
  Eye,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Settings,
  ShieldCheck,
  Rocket,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { formatGeorgianPhoneNumber } from '@/features/auth/utils/georgian-phone-number';
import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { StatusBadge } from '@/features/feed/components/status-badge';
import {
  cancelReservation,
  deletePost,
  fetchPostDetails,
  markPostGiven,
  manageReservation,
} from '@/features/posts/api/post-details-api';
import { ReservationCountdown } from '@/features/posts/components/reservation-countdown';
import { ReservationStatusBadge } from '@/features/posts/components/reservation-status-badge';
import { BoostBadge } from '@/features/posts/components/boost-badge';
import { BoostActiveCountdown } from '@/features/posts/components/boost-active-countdown';
import {
  BoostPaymentSuccess,
  BoostSuccessAlert,
} from '@/features/posts/components/boost-payment-success';
import { BoostPostDialog } from '@/features/posts/components/boost-post-dialog';
import {
  activateDemoPostBoost,
  type PostBoostPlan,
} from '@/features/posts/api/post-boost-api';
import { postCityOptions } from '@/features/posts/constants/post-options';
import { CityPicker } from '@/shared/components/city-picker';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { cn } from '@/shared/lib/cn';
import { getFriendlyErrorMessage, logErrorDetails } from '@/shared/lib/errors';

import {
  deleteAccount,
  fetchMyPosts,
  fetchProfileSummary,
  fetchReservedItems,
  updateProfileSettings,
  type ProfilePost,
  type ReservedItem,
} from '../api/profile-api';
import {
  profileSettingsSchema,
  type ProfileSettingsValues,
} from '../validation/profile-settings-schema';

type ProfileTab = 'posts' | 'reserved' | 'settings';
const profileLocationBaseOptions = [
  { label: 'Georgia', value: 'Georgia' },
  ...postCityOptions.map((city) => ({ label: city, value: city })),
];

export function AccountPage() {
  const { user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const adminStatus = useAdminStatus();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const activeTab = getProfileTab(searchParams.get('tab'));
  const [actionError, setActionError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile-summary', user?.id],
    queryFn: () => fetchProfileSummary(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const postsQuery = useQuery({
    queryKey: ['my-posts', user?.id],
    queryFn: () => fetchMyPosts(user?.id ?? ''),
    enabled: Boolean(user?.id) && activeTab === 'posts',
  });

  const reservationsQuery = useQuery({
    queryKey: ['reserved-items', user?.id],
    queryFn: () => fetchReservedItems(user?.id ?? ''),
    enabled: Boolean(user?.id) && activeTab === 'reserved',
  });

  const displayName =
    profileQuery.data?.displayName ??
    (typeof user?.user_metadata.display_name === 'string'
      ? user.user_metadata.display_name
      : t('Your account'));

  const isLoading =
    profileQuery.isLoading ||
    (activeTab === 'posts' && postsQuery.isLoading) ||
    (activeTab === 'reserved' && reservationsQuery.isLoading);
  const error =
    profileQuery.error ??
    (activeTab === 'posts' ? postsQuery.error : null) ??
    (activeTab === 'reserved' ? reservationsQuery.error : null);

  return (
    <PageContainer className="gap-6">
      <Seo
        noindex
        title={language === 'ge' ? 'პროფილი' : 'Profile'}
        description={
          language === 'ge'
            ? 'მართეთ თქვენი Gaachuqe-ის პროფილი, განცხადებები, ჯავშნები და ანგარიშის პარამეტრები.'
            : 'Manage your Gaachuqe profile, posts, reservations, and account settings.'
        }
      />
      <section className="premium-card rounded-[14px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-accent text-primary flex size-14 items-center justify-center overflow-hidden rounded-full">
              {profileQuery.data?.avatarUrl ? (
                <img
                  className="h-full w-full object-cover"
                  src={profileQuery.data.avatarUrl}
                  alt=""
                />
              ) : (
                <User className="size-6" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl leading-[30px] font-bold tracking-tight">
                {displayName}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('Profile')}
              </p>
            </div>
          </div>
          <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:items-end">
            <span className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden="true" />
              {profileQuery.data?.phoneNumber ??
                user?.phone ??
                t('Phone unavailable')}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              {profileQuery.data?.location
                ? t(profileQuery.data.location)
                : t('Georgia')}
            </span>
            {adminStatus.data ? (
              <Button asChild className="mt-1" variant="outline">
                <Link to={localizedPath('/admin')}>
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  {t('Admin dashboard')}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setSearchParams(
            value === 'posts' ? {} : { tab: value },
            { replace: true },
          )
        }
      >
        <TabsList className="grid-cols-3" aria-label={t('Profile')}>
          <TabsTrigger className="min-w-0 px-2" value="posts">
            <span className="block max-w-full truncate text-center whitespace-nowrap">
              {t('My Listings')}
            </span>
          </TabsTrigger>
          <TabsTrigger className="min-w-0 px-2" value="reserved">
            <span className="block max-w-full truncate text-center whitespace-nowrap">
              {t('Reservations')}
            </span>
          </TabsTrigger>
          <TabsTrigger className="min-w-0 px-2" value="settings">
            <span className="block max-w-full truncate text-center whitespace-nowrap">
              {t('Settings')}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <LoadingState
          title={t('Loading profile')}
          description={t('Gaachuqe is loading your account.')}
          variant="account"
        />
      ) : null}

      {error ? (
        <div className="bg-card rounded-lg border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('Could not load profile')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t(getFriendlyErrorMessage(error))}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && activeTab === 'posts' ? (
        <MyPostsSection
          posts={postsQuery.data ?? []}
          onDeleted={async () => {
            await queryClient.invalidateQueries({
              queryKey: ['my-posts', user?.id],
            });
            await queryClient.invalidateQueries({ queryKey: ['feed'] });
          }}
          onError={setActionError}
        />
      ) : null}

      {!isLoading && !error && activeTab === 'reserved' ? (
        <ReservedItemsSection
          reservations={reservationsQuery.data ?? []}
          onCancelled={async () => {
            await queryClient.invalidateQueries({
              queryKey: ['reserved-items', user?.id],
            });
            await queryClient.invalidateQueries({ queryKey: ['feed'] });
          }}
        />
      ) : null}

      {!isLoading && !error && activeTab === 'settings' && user ? (
        <SettingsSection
          defaultValues={{
            displayName,
            location: profileQuery.data?.location ?? 'Georgia',
            phoneNumber: formatGeorgianPhoneNumber(
              profileQuery.data?.phoneNumber ?? user.phone ?? '',
            ),
          }}
          userId={user.id}
          onSaved={async () => {
            await queryClient.invalidateQueries({
              queryKey: ['profile-summary', user.id],
            });
          }}
          onAccountDeleted={() => {
            queryClient.clear();
            navigate(localizedPath('/'), { replace: true });
          }}
        />
      ) : null}

      {actionError ? (
        <p
          className="text-destructive rounded-md border border-current p-3 text-sm"
          role="alert"
        >
          {t(actionError)}
        </p>
      ) : null}
    </PageContainer>
  );
}

function MyPostsSection({
  onDeleted,
  onError,
  posts,
}: {
  onDeleted: () => Promise<void>;
  onError: (message: string | null) => void;
  posts: ProfilePost[];
}) {
  const { language, localizedPath, t } = useI18n();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingGivenId, setMarkingGivenId] = useState<string | null>(null);
  const [managingReservationId, setManagingReservationId] = useState<
    string | null
  >(null);
  const [statsPostId, setStatsPostId] = useState<string | null>(null);
  const [boostingPostId, setBoostingPostId] = useState<string | null>(null);
  const [boostDialogPostId, setBoostDialogPostId] = useState<string | null>(
    null,
  );
  const [boostSuccessExpiresAt, setBoostSuccessExpiresAt] = useState<
    string | null
  >(null);
  const [boostAlertExpiresAt, setBoostAlertExpiresAt] = useState<string | null>(
    null,
  );
  const [confirmation, setConfirmation] = useState<{
    id: string;
    type:
      | 'delete'
      | 'mark-given'
      | 'accept-reservation'
      | 'decline-reservation'
      | 'cancel-reservation'
      | 'complete-reservation';
  } | null>(null);

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description={t('Create a post when you have an item to give away.')}
      />
    );
  }

  async function handleDelete(postId: string) {
    setDeletingId(postId);
    onError(null);

    try {
      const details = await fetchPostDetails(postId);
      await deletePost(details);
      await onDeleted();
    } catch (error) {
      logErrorDetails('Profile post deletion failed', error);
      onError(getFriendlyErrorMessage(error, 'Could not delete post.'));
    } finally {
      setDeletingId(null);
      setConfirmation(null);
    }
  }

  async function handleMarkGiven(postId: string) {
    setMarkingGivenId(postId);
    onError(null);

    try {
      await markPostGiven(postId);
      await onDeleted();
    } catch (error) {
      logErrorDetails('Profile mark post given failed', error);
      onError(getFriendlyErrorMessage(error, 'Could not mark post as given.'));
    } finally {
      setMarkingGivenId(null);
      setConfirmation(null);
    }
  }

  async function handleReservationAction(
    reservationId: string,
    nextStatus: 'accepted' | 'declined' | 'cancelled' | 'completed',
  ) {
    setManagingReservationId(reservationId);
    onError(null);

    try {
      await manageReservation(reservationId, nextStatus);
      await onDeleted();
    } catch (error) {
      logErrorDetails('Reservation management failed', error);
      onError(getFriendlyErrorMessage(error, 'Could not update reservation.'));
    } finally {
      setManagingReservationId(null);
      setConfirmation(null);
    }
  }

  async function handleBoost(postId: string, plan: PostBoostPlan) {
    setBoostingPostId(postId);
    onError(null);

    try {
      const boostedPost = await activateDemoPostBoost(postId, plan);
      await onDeleted();
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({
        queryKey: ['unread-notifications'],
      });
      setBoostDialogPostId(null);
      setBoostSuccessExpiresAt(boostedPost.boost_expires_at);
    } catch (error) {
      logErrorDetails('Profile boost post failed', error);
      onError(getFriendlyErrorMessage(error, 'Could not boost post.'));
    } finally {
      setBoostingPostId(null);
    }
  }

  return (
    <>
      <section className="space-y-3" aria-label="My posts">
        {posts.map((post) => (
          <article className="premium-card rounded-[14px] p-4" key={post.id}>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:justify-between">
                  <h2 className="min-w-0 text-lg leading-6 font-semibold tracking-tight [overflow-wrap:anywhere] break-words">
                    {post.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {post.isBoosted ? <BoostBadge /> : null}
                    {post.status !== 'archived' ? (
                      <StatusBadge status={post.status} />
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-2 min-[420px]:grid-cols-2">
                  <PostMetaChip
                    icon={<MapPin className="size-4" aria-hidden="true" />}
                    label={t('Location')}
                    value={t(post.location)}
                  />
                  <PostMetaChip
                    icon={<Tag className="size-4" aria-hidden="true" />}
                    label={t('Category')}
                    value={formatCategory(post.category, t)}
                  />
                  <PostMetaChip
                    icon={<BarChart3 className="size-4" aria-hidden="true" />}
                    label={t('Reservations')}
                    value={`${post.reservationCount} ${t('reservations')}`}
                  />
                  <PostMetaChip
                    icon={
                      <CalendarDays className="size-4" aria-hidden="true" />
                    }
                    label={t('Expires')}
                    value={formatDate(post.expiresAt, language)}
                  />
                </div>
              </div>

              <div className="border-border flex flex-wrap items-center gap-2 border-t pt-4">
                <Button
                  className="h-10 bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-100"
                  disabled={
                    post.status !== 'available' ||
                    post.isBoosted ||
                    boostingPostId === post.id
                  }
                  type="button"
                  onClick={() => setBoostDialogPostId(post.id)}
                >
                  <Rocket className="size-4" aria-hidden="true" />
                  {post.isBoosted && post.boostExpiresAt ? (
                    <BoostActiveCountdown expiresAt={post.boostExpiresAt} />
                  ) : (
                    t('Boost post')
                  )}
                </Button>
                <Button asChild variant="outline">
                  <Link to={localizedPath(`/posts/${post.id}`)}>
                    <Eye className="size-4" aria-hidden="true" />
                    {t('View')}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={t('Action')}
                      className="ml-auto size-10 px-0"
                      type="button"
                      variant="outline"
                    >
                      <MoreHorizontal className="size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() =>
                        setStatsPostId((current) =>
                          current === post.id ? null : post.id,
                        )
                      }
                    >
                      <BarChart3 className="size-4" aria-hidden="true" />
                      {t('Statistics')}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`${localizedPath(`/posts/${post.id}`)}?edit=1`}>
                        <Pencil className="size-4" aria-hidden="true" />
                        {t('Edit')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        post.status === 'given' || markingGivenId === post.id
                      }
                      onSelect={() =>
                        setConfirmation({ id: post.id, type: 'mark-given' })
                      }
                    >
                      {post.status === 'given' ? t('Given') : t('Mark given')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      disabled={deletingId === post.id}
                      onSelect={() =>
                        setConfirmation({ id: post.id, type: 'delete' })
                      }
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      {t('Delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {statsPostId === post.id ? <PostStatistics post={post} /> : null}
            {post.reservations.length > 0 ? (
              <OwnerReservationsPanel
                managingReservationId={managingReservationId}
                reservations={post.reservations}
                onAction={(id, type) => setConfirmation({ id, type })}
              />
            ) : null}
          </article>
        ))}
      </section>

      {confirmation?.type === 'delete' ? (
        <ConfirmDialog
          danger
          confirmLabel={t('Delete post')}
          description={t(
            'Delete this post permanently? This cannot be undone.',
          )}
          isLoading={deletingId === confirmation.id}
          loadingLabel={t('Deleting...')}
          title={t('Delete post?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => void handleDelete(confirmation.id)}
        />
      ) : null}

      {boostDialogPostId ? (
        <BoostPostDialog
          isLoading={boostingPostId === boostDialogPostId}
          onCancel={() => setBoostDialogPostId(null)}
          onConfirm={(plan) => void handleBoost(boostDialogPostId, plan)}
        />
      ) : null}

      {boostSuccessExpiresAt ? (
        <BoostPaymentSuccess
          expiresAt={boostSuccessExpiresAt}
          onComplete={() => {
            setBoostAlertExpiresAt(boostSuccessExpiresAt);
            setBoostSuccessExpiresAt(null);
          }}
        />
      ) : null}

      {boostAlertExpiresAt ? (
        <BoostSuccessAlert
          expiresAt={boostAlertExpiresAt}
          onDismiss={() => setBoostAlertExpiresAt(null)}
        />
      ) : null}

      {confirmation?.type === 'mark-given' ? (
        <ConfirmDialog
          confirmLabel={t('Mark given')}
          description={t(
            'Mark this item as given? Active reservations will be completed.',
          )}
          isLoading={markingGivenId === confirmation.id}
          loadingLabel={t('Saving...')}
          title={t('Mark item as given?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => void handleMarkGiven(confirmation.id)}
        />
      ) : null}

      {confirmation?.type === 'accept-reservation' ? (
        <ConfirmDialog
          confirmLabel={t('Accept')}
          description={t('Accept this reservation request?')}
          isLoading={managingReservationId === confirmation.id}
          loadingLabel={t('Saving...')}
          title={t('Accept reservation?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() =>
            void handleReservationAction(confirmation.id, 'accepted')
          }
        />
      ) : null}

      {confirmation?.type === 'decline-reservation' ? (
        <ConfirmDialog
          danger
          confirmLabel={t('Reject')}
          description={t('Reject this reservation request?')}
          isLoading={managingReservationId === confirmation.id}
          loadingLabel={t('Saving...')}
          title={t('Reject reservation?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() =>
            void handleReservationAction(confirmation.id, 'declined')
          }
        />
      ) : null}

      {confirmation?.type === 'cancel-reservation' ? (
        <ConfirmDialog
          danger
          confirmLabel={t('Cancel reservation')}
          description={t('Cancel this accepted reservation?')}
          isLoading={managingReservationId === confirmation.id}
          loadingLabel={t('Cancelling...')}
          title={t('Cancel reservation?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() =>
            void handleReservationAction(confirmation.id, 'cancelled')
          }
        />
      ) : null}

      {confirmation?.type === 'complete-reservation' ? (
        <ConfirmDialog
          confirmLabel={t('Mark completed')}
          description={t('Mark this reservation as completed?')}
          isLoading={managingReservationId === confirmation.id}
          loadingLabel={t('Saving...')}
          title={t('Complete reservation?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() =>
            void handleReservationAction(confirmation.id, 'completed')
          }
        />
      ) : null}
    </>
  );
}

function OwnerReservationsPanel({
  managingReservationId,
  onAction,
  reservations,
}: {
  managingReservationId: string | null;
  onAction: (
    id: string,
    type:
      | 'accept-reservation'
      | 'decline-reservation'
      | 'cancel-reservation'
      | 'complete-reservation',
  ) => void;
  reservations: ProfilePost['reservations'];
}) {
  const { localizedPath, t } = useI18n();

  return (
    <section className="mt-4 space-y-3 border-t pt-4">
      <h3 className="text-sm font-semibold">{t('Reservation requests')}</h3>
      <div className="grid gap-2">
        {reservations.map((reservation) => (
          <div
            className="soft-surface flex min-w-0 flex-col gap-3 rounded-[10px] p-3 sm:flex-row sm:items-center sm:justify-between"
            key={reservation.id}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium [overflow-wrap:anywhere] break-words">
                  {reservation.requesterName}
                </p>
                <ReservationStatusBadge status={reservation.status} />
              </div>
              {reservation.requesterPhoneNumber ? (
                <a
                  className="text-muted-foreground mt-1 block text-sm underline-offset-4 hover:underline"
                  href={`tel:${reservation.requesterPhoneNumber}`}
                >
                  {reservation.requesterPhoneNumber}
                </a>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {reservation.status === 'pending' ? (
                <>
                  <Button
                    disabled={managingReservationId === reservation.id}
                    type="button"
                    onClick={() =>
                      onAction(reservation.id, 'accept-reservation')
                    }
                  >
                    {t('Accept')}
                  </Button>
                  <Button
                    className="border-destructive/40 text-destructive hover:bg-destructive hover:text-primary-foreground"
                    disabled={managingReservationId === reservation.id}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      onAction(reservation.id, 'decline-reservation')
                    }
                  >
                    {t('Reject')}
                  </Button>
                </>
              ) : null}
              {reservation.status === 'accepted' ? (
                <>
                  <Button asChild variant="outline">
                    <Link to={localizedPath(`/chat/${reservation.id}`)}>
                      <MessageCircle className="size-4" aria-hidden="true" />
                      {t('Chat')}
                    </Link>
                  </Button>
                  <Button
                    disabled={managingReservationId === reservation.id}
                    type="button"
                    onClick={() =>
                      onAction(reservation.id, 'complete-reservation')
                    }
                  >
                    {t('Mark completed')}
                  </Button>
                  <Button
                    className="border-destructive/40 text-destructive hover:bg-destructive hover:text-primary-foreground"
                    disabled={managingReservationId === reservation.id}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      onAction(reservation.id, 'cancel-reservation')
                    }
                  >
                    {t('Cancel')}
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PostMetaChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="soft-surface flex min-w-0 items-center gap-3 rounded-[10px] px-3 py-2">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs leading-4">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function PostStatistics({ post }: { post: ProfilePost }) {
  const { language, t } = useI18n();
  const statusLabel =
    post.status === 'archived' ? t('Archived') : formatCategory(post.status, t);

  return (
    <dl className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-4">
      <StatisticDetail label={t('Status')} value={statusLabel} />
      <StatisticDetail
        label={t('Reservations')}
        value={String(post.reservationCount)}
      />
      <StatisticDetail
        label={t('Created')}
        value={formatDate(post.createdAt, language)}
      />
      <StatisticDetail
        label={t('Expires')}
        value={formatDate(post.expiresAt, language)}
      />
    </dl>
  );
}

function StatisticDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <dt className="text-muted-foreground text-xs font-medium uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function ReservedItemsSection({
  onCancelled,
  reservations,
}: {
  onCancelled: () => Promise<void>;
  reservations: ReservedItem[];
}) {
  const { localizedPath, t } = useI18n();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(
    null,
  );

  if (reservations.length === 0) {
    return (
      <EmptyState
        title="No reserved items"
        description={t('Reserved items will appear here.')}
      />
    );
  }

  async function handleCancelReservation(reservationId: string) {
    setCancellingId(reservationId);
    setErrorMessage(null);

    try {
      await cancelReservation(reservationId);
      await onCancelled();
    } catch (error) {
      logErrorDetails('Profile cancel reservation failed', error);
      setErrorMessage(
        getFriendlyErrorMessage(error, 'Could not cancel reservation.'),
      );
    } finally {
      setCancellingId(null);
      setReservationToCancel(null);
    }
  }

  return (
    <>
      <section className="space-y-3" aria-label="Reserved items">
        {errorMessage ? (
          <p
            className="text-destructive rounded-md border border-current p-3 text-sm"
            role="alert"
          >
            {t(errorMessage)}
          </p>
        ) : null}
        {reservations.map((reservation) => (
          <article
            className="premium-card rounded-[14px] p-4"
            key={reservation.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">
                  {reservation.post?.title ?? t('Unavailable item')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {reservation.post?.location
                    ? t(reservation.post.location)
                    : t('Location unavailable')}
                </p>
                <div className="mt-2">
                  <ReservationStatusBadge status={reservation.status} />
                </div>
              </div>
              {reservation.post ? (
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to={localizedPath(`/posts/${reservation.post.id}`)}>
                      {t('View')}
                    </Link>
                  </Button>
                  {reservation.status === 'pending' ||
                  reservation.status === 'accepted' ? (
                    <Button
                      disabled={cancellingId === reservation.id}
                      type="button"
                      variant="outline"
                      onClick={() => setReservationToCancel(reservation.id)}
                    >
                      {cancellingId === reservation.id
                        ? t('Cancelling...')
                        : t('Unreserve')}
                    </Button>
                  ) : null}
                  {reservation.status === 'accepted' ? (
                    <Button asChild>
                      <Link to={localizedPath(`/chat/${reservation.id}`)}>
                        <MessageCircle className="size-4" aria-hidden="true" />
                        {t('Chat')}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {reservation.expiresAt &&
            (reservation.status === 'pending' ||
              reservation.status === 'accepted') ? (
              <div className="mt-3">
                <ReservationCountdown expiresAt={reservation.expiresAt} />
              </div>
            ) : null}
          </article>
        ))}
      </section>

      {reservationToCancel ? (
        <ConfirmDialog
          danger
          confirmLabel={t('Unreserve')}
          description={t('Cancel your reservation for this item?')}
          isLoading={cancellingId === reservationToCancel}
          loadingLabel={t('Cancelling...')}
          title={t('Cancel reservation?')}
          onCancel={() => setReservationToCancel(null)}
          onConfirm={() => void handleCancelReservation(reservationToCancel)}
        />
      ) : null}
    </>
  );
}

function SettingsSection({
  defaultValues,
  onAccountDeleted,
  onSaved,
  userId,
}: {
  defaultValues: ProfileSettingsValues;
  onAccountDeleted: () => void;
  onSaved: () => Promise<void>;
  userId: string;
}) {
  const { t } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    values: defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  async function onSubmit(values: ProfileSettingsValues) {
    setMessage(null);
    setErrorMessage(null);

    try {
      await updateProfileSettings({ userId, ...values });
      await onSaved();
      setMessage(t('Settings saved.'));
      toast.success(t('Settings saved.'));
    } catch (error) {
      logErrorDetails('Profile settings save failed', error);
      const message = getFriendlyErrorMessage(
        error,
        'Settings could not be saved.',
      );
      setErrorMessage(message);
      toast.error(t(message));
    }
  }

  return (
    <>
      <section className="premium-card rounded-[14px] p-5">
        <div className="mb-5 flex items-center gap-2">
          <Settings
            className="text-muted-foreground size-5"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold">{t('Account settings')}</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="space-y-2">
            <span className="text-sm font-medium">{t('Display name')}</span>
            <input
              className={inputClassName(Boolean(errors.displayName))}
              {...register('displayName')}
            />
            <FieldError message={errors.displayName?.message} />
          </label>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <label className="space-y-2">
                <span className="text-sm font-medium">{t('Phone number')}</span>
                <input
                  className={inputClassName(Boolean(errors.phoneNumber))}
                  inputMode="tel"
                  type="tel"
                  value={field.value || '(+995) '}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(
                      formatGeorgianPhoneNumber(event.target.value),
                    )
                  }
                />
                <FieldError message={errors.phoneNumber?.message} />
              </label>
            )}
          />
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <div className="space-y-2">
                <CityPicker
                  error={Boolean(errors.location)}
                  label={t('Location')}
                  options={getProfileLocationOptions(field.value)}
                  searchLabel={t('Search city')}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FieldError message={errors.location?.message} />
              </div>
            )}
          />
          {errorMessage ? (
            <p
              className="text-destructive rounded-md border border-current p-3 text-sm"
              role="alert"
            >
              {t(errorMessage)}
            </p>
          ) : null}
          {message ? (
            <p className="text-primary text-sm">{t(message)}</p>
          ) : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? t('Saving...') : t('Save settings')}
          </Button>
        </form>
      </section>

      <section className="premium-card border-destructive/40 rounded-[14px] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t('Delete account')}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t(
                'Permanently remove your profile, posts, reservations, and post images.',
              )}
            </p>
          </div>
          <Button
            className="border-destructive text-destructive hover:bg-destructive hover:text-primary-foreground"
            type="button"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('Delete account')}
          </Button>
        </div>
      </section>

      {isDeleteModalOpen ? (
        <DeleteAccountModal
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={onAccountDeleted}
        />
      ) : null}
    </>
  );
}

function DeleteAccountModal({
  onClose,
  onDeleted,
}: {
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isConfirmed = confirmation === 'DELETE';

  useDialogFocusTrap(dialogRef, {
    initialFocusRef: cancelButtonRef,
    onEscape: isDeleting ? undefined : onClose,
  });

  async function handleDelete() {
    if (!isConfirmed || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteAccount();
      onDeleted();
    } catch (error) {
      logErrorDetails('Account deletion failed', error);
      setErrorMessage(
        getFriendlyErrorMessage(error, 'Account could not be deleted.'),
      );
      setIsDeleting(false);
    }
  }

  return (
    <div
      aria-labelledby="delete-account-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-backdrop)] p-4 backdrop-blur-sm"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        className="border-border bg-card w-full max-w-md rounded-[18px] border p-5 shadow-[0_18px_54px_var(--theme-surface-shadow)]"
        ref={dialogRef}
      >
        <div className="flex items-start gap-3">
          <div className="danger-soft text-destructive flex size-10 shrink-0 items-center justify-center rounded-md">
            <Trash2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" id="delete-account-title">
              {t('Delete account permanently')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {t(
                'This removes your profile, posts, post images, and reservations. This action cannot be undone.',
              )}
            </p>
          </div>
        </div>

        <label className="mt-5 block space-y-2">
          <span className="text-sm font-medium">
            {t('Type DELETE to confirm')}
          </span>
          <input
            aria-label={t('Type DELETE to confirm')}
            className={inputClassName(false)}
            disabled={isDeleting}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>

        {errorMessage ? (
          <p
            className="text-destructive mt-4 rounded-md border border-current p-3 text-sm"
            role="alert"
          >
            {t(errorMessage)}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={isDeleting}
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('Cancel')}
          </Button>
          <Button
            className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            disabled={!isConfirmed || isDeleting}
            type="button"
            onClick={() => void handleDelete()}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            {isDeleting ? t('Deleting...') : t('Delete account')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function inputClassName(hasError: boolean) {
  return cn(
    'modern-input h-11 w-full rounded-[10px] px-3 text-base outline-none',
    hasError && 'border-destructive focus-visible:ring-destructive',
  );
}

function getProfileLocationOptions(value: string) {
  if (
    !value ||
    profileLocationBaseOptions.some((option) => option.value === value)
  ) {
    return profileLocationBaseOptions;
  }

  return [{ label: value, value }, ...profileLocationBaseOptions];
}

function FieldError({ message }: { message?: string }) {
  const { t } = useI18n();

  return message ? (
    <p className="text-destructive text-sm">{t(message)}</p>
  ) : null;
}

function formatCategory(value: string, t: (text: string) => string) {
  if (value === 'home') {
    return t('HomeCategory');
  }

  const label = value
    .replace('_', ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());

  return t(label);
}

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getProfileTab(value: string | null): ProfileTab {
  if (value === 'reserved' || value === 'settings') {
    return value;
  }

  return 'posts';
}
