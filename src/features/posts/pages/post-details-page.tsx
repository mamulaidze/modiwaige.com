import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileWarning,
  ImageIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Rocket,
  X,
  Trash2,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Controller,
  useForm,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';

import { fetchProfileSummary } from '@/features/account/api/profile-api';
import { useAuth } from '@/features/auth/context/use-auth';
import { StatusBadge } from '@/features/feed/components/status-badge';
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
import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { cn } from '@/shared/lib/cn';
import { getFriendlyErrorMessage, logErrorDetails } from '@/shared/lib/errors';

import {
  createPostReport,
  cancelReservation,
  deletePost,
  fetchPostDetails,
  manageReservation,
  markPostGiven,
  reservePost,
  updatePostDetails,
} from '../api/post-details-api';
import {
  activateDemoPostBoost,
  type PostBoostPlan,
} from '../api/post-boost-api';
import {
  postCategoryOptions,
  postCityOptions,
} from '../constants/post-options';
import { ReservationCountdown } from '../components/reservation-countdown';
import { ReservationStatusBadge } from '../components/reservation-status-badge';
import { BoostBadge } from '../components/boost-badge';
import { BoostActiveCountdown } from '../components/boost-active-countdown';
import {
  BoostPaymentSuccess,
  BoostSuccessAlert,
} from '../components/boost-payment-success';
import { BoostPostDialog } from '../components/boost-post-dialog';
import { createPostSchema } from '../validation/create-post-schema';
import type { PostReservation } from '../types/post-details';

const editPostSchema = createPostSchema.omit({ photos: true });
type EditPostInput = z.input<typeof editPostSchema>;
type EditPostValues = z.output<typeof editPostSchema>;
const postCityPickerOptions = postCityOptions.map((city) => ({
  label: city,
  value: city,
}));

export function PostDetailsPage() {
  const { postId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isEditingManually, setIsEditingManually] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBoostDialogOpen, setIsBoostDialogOpen] = useState(false);
  const [boostSuccessExpiresAt, setBoostSuccessExpiresAt] = useState<
    string | null
  >(null);
  const [boostAlertExpiresAt, setBoostAlertExpiresAt] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<
    'mark-given' | 'delete' | 'cancel-reservation' | 'reserve' | null
  >(null);
  const [reservationConfirmation, setReservationConfirmation] = useState<{
    id: string;
    status: 'accepted' | 'declined' | 'cancelled' | 'completed';
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  }, [postId]);

  const {
    data: post,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPostDetails(postId ?? ''),
    enabled: Boolean(postId),
  });

  const profileQuery = useQuery({
    queryKey: ['profile-summary', user?.id],
    queryFn: () => fetchProfileSummary(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const editForm = useForm<EditPostInput, unknown, EditPostValues>({
    resolver: zodResolver(editPostSchema),
    values: post
      ? {
          title: post.title,
          description: post.description,
          category: post.category,
          city: normalizeCity(post.location),
        }
      : undefined,
  });

  const reserveMutation = useMutation({
    mutationFn: async () => {
      if (!post || !user) {
        throw new Error('Log in to reserve this item.');
      }

      await reservePost(post.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      setActionError(null);
      setConfirmation(null);
    },
    onError: (mutationError) => {
      logErrorDetails('Reserve post failed', mutationError);
      setActionError(
        getFriendlyErrorMessage(mutationError, 'Could not reserve item.'),
      );
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async () => {
      if (!post?.activeReservation) {
        throw new Error('Reservation was not found.');
      }

      await cancelReservation(post.activeReservation.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      await queryClient.invalidateQueries({ queryKey: ['reserved-items'] });
      setActionError(null);
      setConfirmation(null);
    },
    onError: (mutationError) => {
      logErrorDetails('Cancel reservation failed', mutationError);
      setActionError(
        getFriendlyErrorMessage(mutationError, 'Could not cancel reservation.'),
      );
    },
  });

  const markGivenMutation = useMutation({
    mutationFn: async () => {
      if (!post) {
        throw new Error('Post was not found.');
      }

      await markPostGiven(post.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      await queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({
        queryKey: ['unread-notifications'],
      });
      setActionError(null);
      setConfirmation(null);
    },
    onError: (mutationError) => {
      logErrorDetails('Mark post given failed', mutationError);
      setActionError(
        getFriendlyErrorMessage(mutationError, 'Could not mark item as given.'),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!post) {
        throw new Error('Post was not found.');
      }

      await deletePost(post);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      setConfirmation(null);
      navigate(localizedPath('/'), { replace: true });
    },
    onError: (mutationError) => {
      logErrorDetails('Delete post failed', mutationError);
      setActionError(
        getFriendlyErrorMessage(mutationError, 'Could not delete item.'),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: EditPostValues) => {
      if (!post) {
        throw new Error('Post was not found.');
      }

      return updatePostDetails(post.id, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      setIsEditingManually(false);
      setSearchParams({}, { replace: true });
      setActionError(null);
    },
    onError: (mutationError) => {
      logErrorDetails('Update post failed', mutationError);
      setActionError(
        getFriendlyErrorMessage(mutationError, 'Could not update item.'),
      );
    },
  });

  const reportMutation = useMutation({
    mutationFn: (values: { body: string; subject: string }) => {
      if (!post || !user) {
        throw new Error('Log in to report this item.');
      }

      return createPostReport({
        body: values.body,
        postId: post.id,
        reporterId: user.id,
        subject: values.subject,
      });
    },
    onSuccess: () => {
      setIsReportOpen(false);
      setActionError(null);
      toast.success(t('Report submitted.'));
    },
    onError: (mutationError) => {
      logErrorDetails('Submit report failed', mutationError);
      setActionError(
        getFriendlyErrorMessage(mutationError, 'Could not submit report.'),
      );
    },
  });

  const manageReservationMutation = useMutation({
    mutationFn: (input: {
      reservationId: string;
      nextStatus: 'accepted' | 'declined' | 'cancelled' | 'completed';
    }) => manageReservation(input.reservationId, input.nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      await queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      setReservationConfirmation(null);
      setActionError(null);
    },
    onError: (mutationError) => {
      logErrorDetails('Manage reservation failed', mutationError);
      setActionError(
        getFriendlyErrorMessage(mutationError, 'Could not update reservation.'),
      );
    },
  });

  const boostMutation = useMutation({
    mutationFn: (plan: PostBoostPlan) => {
      if (!post) {
        throw new Error('Post was not found.');
      }

      return activateDemoPostBoost(post.id, plan);
    },
    onSuccess: async (boostedPost) => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      await queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      setIsBoostDialogOpen(false);
      setActionError(null);
      setBoostSuccessExpiresAt(boostedPost.boost_expires_at);
    },
    onError: (mutationError) => {
      logErrorDetails('Boost post failed', mutationError);
      setActionError(
        getFriendlyErrorMessage(mutationError, 'Could not boost post.'),
      );
    },
  });

  if (!postId) {
    return <Navigate replace to={localizedPath('/')} />;
  }

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState
          title={t('Loading item')}
          description={t('Gaachuqe is loading item details.')}
          variant="details"
        />
      </PageContainer>
    );
  }

  if (isError || !post) {
    return (
      <PageContainer>
        <EmptyState
          title={t('Item not found')}
          description={t(
            getFriendlyErrorMessage(error, 'This item could not be loaded.'),
          )}
        />
      </PageContainer>
    );
  }

  const isOwner = user?.id === post.ownerId;
  const isEditing =
    isOwner && (isEditingManually || searchParams.get('edit') === '1');
  const activeImage = post.images[activeImageIndex];
  const postDescription = post.description.replace(/\s+/g, ' ').trim();
  const viewerActiveReservation =
    !isOwner && post.activeReservation?.requesterId === user?.id
      ? post.activeReservation
      : null;
  const hasProfilePhone = Boolean(profileQuery.data?.phoneNumber?.trim());

  function handleReserveRequest() {
    if (!hasProfilePhone) {
      const message =
        'You need to add your mobile phone number before this action.';
      setActionError(message);
      toast.error(t(message));
      navigate(localizedPath('/profile?tab=settings'));
      return;
    }

    setConfirmation('reserve');
  }

  return (
    <PageContainer className="gap-6 pb-28 md:pb-0">
      <Seo
        title={post.title}
        description={
          postDescription.length > 155
            ? `${postDescription.slice(0, 152)}...`
            : postDescription
        }
        type="article"
      />

      <Button asChild className="w-fit" variant="outline">
        <Link to={localizedPath('/')}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('Back')}
        </Link>
      </Button>

      <section className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <div className="min-w-0 space-y-3">
          <div className="bg-muted flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[18px] border shadow-sm lg:aspect-[16/10]">
            {activeImage?.url ? (
              <button
                aria-label="Open full image"
                className="focus-visible:ring-ring h-full w-full cursor-zoom-in focus-visible:ring-2 focus-visible:outline-none"
                type="button"
                onClick={() => setIsImageViewerOpen(true)}
              >
                <img
                  className="h-full w-full object-cover"
                  src={activeImage.url}
                  alt=""
                />
              </button>
            ) : (
              <ImageIcon
                className="text-muted-foreground size-12"
                aria-hidden="true"
              />
            )}
          </div>

          {post.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {post.images.map((image, index) => (
                <button
                  aria-label={`Show image ${index + 1}`}
                  className={cn(
                    'focus-visible:ring-ring bg-card overflow-hidden rounded-[10px] border transition-colors focus-visible:ring-2',
                    activeImageIndex === index
                      ? 'border-primary'
                      : 'border-border hover:border-primary/30',
                  )}
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                >
                  {image.url ? (
                    <img
                      className="aspect-square w-full object-cover"
                      src={image.url}
                      alt=""
                    />
                  ) : (
                    <span className="bg-muted flex aspect-square items-center justify-center">
                      <ImageIcon
                        className="text-muted-foreground size-5"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="premium-card min-w-0 space-y-5 rounded-[18px] p-4 sm:p-5 lg:sticky lg:top-24 lg:self-start">
          {isEditing ? (
            <form
              className="space-y-4"
              onSubmit={editForm.handleSubmit((values) =>
                updateMutation.mutate(values),
              )}
            >
              <EditField
                error={editForm.formState.errors.title?.message}
                label={t('Title')}
                registration={editForm.register('title')}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="description">
                  {t('Description')}
                </label>
                <textarea
                  className="modern-input min-h-32 w-full rounded-[10px] px-3 py-3 text-base outline-none"
                  id="description"
                  {...editForm.register('description')}
                />
                <FieldError
                  message={editForm.formState.errors.description?.message}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">{t('Category')}</span>
                  <select
                    className="modern-input h-11 w-full rounded-[10px] px-3 text-base outline-none"
                    {...editForm.register('category')}
                  >
                    {postCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </select>
                </label>
                <Controller
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <CityPicker
                        error={Boolean(editForm.formState.errors.city)}
                        label={t('City')}
                        options={postCityPickerOptions}
                        searchLabel={t('Search city')}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FieldError
                        message={editForm.formState.errors.city?.message}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="grid gap-2 sm:flex">
                <Button
                  className="w-full sm:w-auto"
                  disabled={updateMutation.isPending}
                  type="submit"
                >
                  {updateMutation.isPending ? t('Saving...') : t('Save')}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditingManually(false);
                    setSearchParams({}, { replace: true });
                  }}
                >
                  {t('Cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-3">
                <div className="min-w-0 space-y-3">
                  <h1 className="min-w-0 text-xl leading-7 font-semibold [overflow-wrap:anywhere] break-words sm:text-2xl sm:leading-tight lg:text-3xl">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {post.isBoosted ? <BoostBadge /> : null}
                    <StatusBadge status={post.status} />
                    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                      <MapPin className="size-4" aria-hidden="true" />
                      {t(post.location)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatCategory(post.category, t)}
                    </span>
                  </div>
                </div>
              </div>

              {post.activeReservation?.expiresAt ? (
                <ReservationCountdown
                  expiresAt={post.activeReservation.expiresAt}
                />
              ) : null}

              <ReservationLifecycle
                activeReservation={post.activeReservation}
                isOwner={isOwner}
                status={post.status}
              />

              {isOwner && post.reservations.length > 0 ? (
                <OwnerReservationRequests
                  isPending={manageReservationMutation.isPending}
                  pendingReservationId={
                    manageReservationMutation.variables?.reservationId ?? null
                  }
                  reservations={post.reservations}
                  onAction={(id, status) =>
                    setReservationConfirmation({ id, status })
                  }
                />
              ) : null}

              <section className="soft-surface rounded-[14px] p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-accent text-primary flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    {post.owner?.avatarUrl ? (
                      <img
                        className="h-full w-full object-cover"
                        src={post.owner.avatarUrl}
                        alt=""
                      />
                    ) : (
                      <User
                        className="text-muted-foreground size-5"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold [overflow-wrap:anywhere] break-words">
                      {post.owner?.displayName ?? t('Gaachuqe member')}
                    </h2>
                    <p className="text-muted-foreground text-sm [overflow-wrap:anywhere] break-words">
                      {post.owner?.location
                        ? t(post.owner.location)
                        : t('Owner information is limited')}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <TrustMetric
                    label={t('Verification')}
                    value={
                      post.owner?.phoneNumber ? t('Phone verified') : t('Basic')
                    }
                  />
                  <TrustMetric
                    label={t('Completed giveaways')}
                    value={t('Community member')}
                  />
                </div>
              </section>

              <details className="rounded-[14px] border p-4" open>
                <summary className="cursor-pointer list-none font-semibold">
                  {t('Description')}
                </summary>
                <p className="text-muted-foreground mt-3 leading-7 [overflow-wrap:anywhere] break-words whitespace-pre-line">
                  {post.description}
                </p>
              </details>

              <details className="rounded-[14px] border p-4">
                <summary className="cursor-pointer list-none font-semibold">
                  {t('Details')}
                </summary>
                <dl className="mt-3 grid gap-3 border-t pt-4 text-sm">
                  <DetailRow
                    label={t('Condition')}
                    value={formatCategory(post.condition, t)}
                  />
                  <DetailRow
                    label={t('Pickup area')}
                    value={t(post.location)}
                  />
                  <DetailRow
                    label={t('Listed')}
                    value={formatDate(post.createdAt, language)}
                  />
                  {post.isBoosted && post.boostExpiresAt ? (
                    <DetailRow
                      label={t('Boost expires')}
                      value={formatDateTime(post.boostExpiresAt, language)}
                    />
                  ) : null}
                </dl>
              </details>

              {viewerActiveReservation ? (
                <section className="border-primary/20 bg-accent rounded-[14px] border p-4">
                  <h2 className="font-semibold">{t('Reservation active')}</h2>
                  <div className="mt-2">
                    <ReservationStatusBadge
                      status={viewerActiveReservation.status}
                    />
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {t('Contact the owner to arrange pickup.')}
                  </p>
                  {viewerActiveReservation.status === 'accepted' ? (
                    <Button asChild className="mt-3 w-full">
                      <Link
                        to={localizedPath(
                          `/chat/${viewerActiveReservation.id}`,
                        )}
                      >
                        <MessageCircle className="size-4" aria-hidden="true" />
                        {t('Chat with owner')}
                      </Link>
                    </Button>
                  ) : null}
                  {post.owner?.phoneNumber ? (
                    <Button asChild className="mt-3 w-full">
                      <a href={`tel:${post.owner.phoneNumber}`}>
                        {t('Call')} {post.owner.phoneNumber}
                      </a>
                    </Button>
                  ) : null}
                </section>
              ) : null}

              {actionError ? (
                <p
                  className="text-destructive rounded-md border border-current p-3 text-sm"
                  role="alert"
                >
                  {t(actionError)}
                </p>
              ) : null}

              {isOwner ? (
                <div className="border-border flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button
                    className="h-10"
                    type="button"
                    onClick={() => {
                      setIsEditingManually(true);
                      setSearchParams({ edit: '1' }, { replace: true });
                    }}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    {t('Edit')}
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
                        disabled={
                          post.status !== 'available' ||
                          post.isBoosted ||
                          boostMutation.isPending
                        }
                        onSelect={() => setIsBoostDialogOpen(true)}
                      >
                        <Rocket className="size-4" aria-hidden="true" />
                        {post.isBoosted && post.boostExpiresAt ? (
                          <BoostActiveCountdown
                            expiresAt={post.boostExpiresAt}
                          />
                        ) : (
                          t('Boost post')
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={
                          post.status === 'given' || markGivenMutation.isPending
                        }
                        onSelect={() => setConfirmation('mark-given')}
                      >
                        {post.status === 'given' ? t('Given') : t('Mark given')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={deleteMutation.isPending}
                        onSelect={() => setConfirmation('delete')}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        {t('Delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden space-y-2 md:block">
                  <VisitorAction
                    disabled={
                      post.status !== 'available' ||
                      reserveMutation.isPending ||
                      profileQuery.isLoading
                    }
                    isAuthenticated={isAuthenticated}
                    isPending={reserveMutation.isPending}
                    isReservedByViewer={
                      post.activeReservation?.requesterId === user?.id
                    }
                    isCancelling={cancelReservationMutation.isPending}
                    onCancel={() => setConfirmation('cancel-reservation')}
                    onReserve={handleReserveRequest}
                  />
                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      type="button"
                      variant="outline"
                      onClick={() => setIsReportOpen(true)}
                    >
                      <FileWarning className="size-4" aria-hidden="true" />
                      {t('Report')}
                    </Button>
                  ) : null}
                  <p className="text-muted-foreground text-xs leading-5">
                    {t('Meet in a public place. Never pay cash to strangers.')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {!isOwner && !isEditing ? (
        <div className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-2xl backdrop-blur md:hidden">
          <div className="mx-auto max-w-md space-y-2">
            <VisitorAction
              disabled={
                post.status !== 'available' ||
                reserveMutation.isPending ||
                profileQuery.isLoading
              }
              isAuthenticated={isAuthenticated}
              isPending={reserveMutation.isPending}
              isReservedByViewer={
                post.activeReservation?.requesterId === user?.id
              }
              isCancelling={cancelReservationMutation.isPending}
              onCancel={() => setConfirmation('cancel-reservation')}
              onReserve={handleReserveRequest}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-xs leading-5">
                {t('Meet in a public place. Never pay cash to strangers.')}
              </p>
              {isAuthenticated ? (
                <button
                  className="text-destructive shrink-0 text-xs font-semibold"
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                >
                  {t('Report')}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isReportOpen ? (
        <ReportPostModal
          isSubmitting={reportMutation.isPending}
          onClose={() => setIsReportOpen(false)}
          onSubmit={(values) => reportMutation.mutate(values)}
        />
      ) : null}

      {isBoostDialogOpen ? (
        <BoostPostDialog
          isLoading={boostMutation.isPending}
          onCancel={() => setIsBoostDialogOpen(false)}
          onConfirm={(plan) => boostMutation.mutate(plan)}
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

      {confirmation === 'mark-given' ? (
        <ConfirmDialog
          confirmLabel={t('Mark given')}
          description={t(
            'Mark this item as given? Active reservations will be completed.',
          )}
          isLoading={markGivenMutation.isPending}
          loadingLabel={t('Saving...')}
          title={t('Mark item as given?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => markGivenMutation.mutate()}
        />
      ) : null}

      {confirmation === 'delete' ? (
        <ConfirmDialog
          danger
          confirmLabel={t('Delete post')}
          description={t(
            'Delete this post permanently? This cannot be undone.',
          )}
          isLoading={deleteMutation.isPending}
          loadingLabel={t('Deleting...')}
          title={t('Delete post?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => deleteMutation.mutate()}
        />
      ) : null}

      {confirmation === 'cancel-reservation' ? (
        <ConfirmDialog
          danger
          confirmLabel={t('Unreserve')}
          description={t('Cancel your reservation for this item?')}
          isLoading={cancelReservationMutation.isPending}
          loadingLabel={t('Cancelling...')}
          title={t('Cancel reservation?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => cancelReservationMutation.mutate()}
        />
      ) : null}

      {confirmation === 'reserve' ? (
        <ConfirmDialog
          confirmLabel={t('Reserve')}
          description={t('Reserve this item? The owner will be notified.')}
          isLoading={reserveMutation.isPending}
          loadingLabel={t('Reserving...')}
          title={t('Reserve item?')}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => reserveMutation.mutate()}
        />
      ) : null}

      {reservationConfirmation ? (
        <ConfirmDialog
          danger={
            reservationConfirmation.status === 'declined' ||
            reservationConfirmation.status === 'cancelled'
          }
          confirmLabel={getReservationActionLabel(
            reservationConfirmation.status,
            t,
          )}
          description={getReservationActionDescription(
            reservationConfirmation.status,
            t,
          )}
          isLoading={manageReservationMutation.isPending}
          loadingLabel={t('Saving...')}
          title={getReservationActionTitle(reservationConfirmation.status, t)}
          onCancel={() => setReservationConfirmation(null)}
          onConfirm={() =>
            manageReservationMutation.mutate({
              reservationId: reservationConfirmation.id,
              nextStatus: reservationConfirmation.status,
            })
          }
        />
      ) : null}

      {isImageViewerOpen && activeImage?.url ? (
        <ImageViewerModal
          imageUrl={activeImage.url}
          title={post.title}
          onClose={() => setIsImageViewerOpen(false)}
        />
      ) : null}
    </PageContainer>
  );
}

function OwnerReservationRequests({
  isPending,
  onAction,
  pendingReservationId,
  reservations,
}: {
  isPending: boolean;
  pendingReservationId: string | null;
  onAction: (
    id: string,
    status: 'accepted' | 'declined' | 'cancelled' | 'completed',
  ) => void;
  reservations: PostReservation[];
}) {
  const { t } = useI18n();

  return (
    <section className="soft-surface rounded-[14px] p-4">
      <h2 className="font-semibold">{t('Reservation requests')}</h2>
      <div className="mt-3 grid gap-2">
        {reservations.map((reservation) => (
          <div className="rounded-[10px] border p-3" key={reservation.id}>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

              <ReservationOwnerActions
                disabled={isPending && pendingReservationId === reservation.id}
                reservation={reservation}
                onAction={onAction}
              />
            </div>
            {reservation.expiresAt &&
            (reservation.status === 'pending' ||
              reservation.status === 'accepted') ? (
              <div className="mt-3">
                <ReservationCountdown expiresAt={reservation.expiresAt} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function ReservationLifecycle({
  activeReservation,
  isOwner,
  status,
}: {
  activeReservation: PostReservation | null;
  isOwner: boolean;
  status: string;
}) {
  const { t } = useI18n();
  const steps = activeReservation
    ? [
        { label: t('Requested'), active: true },
        {
          label:
            activeReservation.status === 'accepted'
              ? t('Accepted')
              : t('Waiting'),
          active:
            activeReservation.status === 'accepted' ||
            activeReservation.status === 'completed',
        },
        {
          label: t('Pickup'),
          active: activeReservation.status === 'completed',
        },
      ]
    : [
        { label: t('Available'), active: status === 'available' },
        { label: t('Requested'), active: false },
        { label: t('Pickup'), active: false },
      ];

  return (
    <section className="rounded-[14px] border p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{t('Reservation status')}</h2>
        {activeReservation ? (
          <ReservationStatusBadge status={activeReservation.status} />
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {steps.map((step, index) => (
          <div className="min-w-0" key={`${step.label}-${index}`}>
            <div
              className={cn(
                'h-1.5 rounded-full',
                step.active ? 'bg-primary' : 'bg-muted',
              )}
            />
            <p
              className={cn(
                'mt-2 truncate text-xs font-medium',
                step.active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        {activeReservation
          ? activeReservation.status === 'accepted'
            ? t('Next step: arrange pickup in chat.')
            : isOwner
              ? t('Next step: review the reservation request.')
              : t('Next step: waiting for seller acceptance.')
          : t('Next step: request this item to start a reservation.')}
      </p>
    </section>
  );
}

function TrustMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/70 rounded-[10px] border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ReservationOwnerActions({
  disabled,
  onAction,
  reservation,
}: {
  disabled: boolean;
  onAction: (
    id: string,
    status: 'accepted' | 'declined' | 'cancelled' | 'completed',
  ) => void;
  reservation: PostReservation;
}) {
  const { localizedPath, t } = useI18n();

  if (reservation.status === 'pending') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={disabled}
          type="button"
          onClick={() => onAction(reservation.id, 'accepted')}
        >
          {t('Accept')}
        </Button>
        <Button
          className="border-destructive/40 text-destructive hover:bg-destructive hover:text-primary-foreground"
          disabled={disabled}
          type="button"
          variant="outline"
          onClick={() => onAction(reservation.id, 'declined')}
        >
          {t('Reject')}
        </Button>
      </div>
    );
  }

  if (reservation.status === 'accepted') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to={localizedPath(`/chat/${reservation.id}`)}>
            <MessageCircle className="size-4" aria-hidden="true" />
            {t('Chat')}
          </Link>
        </Button>
        <Button
          disabled={disabled}
          type="button"
          onClick={() => onAction(reservation.id, 'completed')}
        >
          {t('Mark completed')}
        </Button>
        <Button
          className="border-destructive/40 text-destructive hover:bg-destructive hover:text-primary-foreground"
          disabled={disabled}
          type="button"
          variant="outline"
          onClick={() => onAction(reservation.id, 'cancelled')}
        >
          {t('Cancel')}
        </Button>
      </div>
    );
  }

  return null;
}

function ImageViewerModal({
  imageUrl,
  onClose,
  title,
}: {
  imageUrl: string;
  onClose: () => void;
  title: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useDialogFocusTrap(dialogRef, {
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  return (
    <div
      aria-label="Full image viewer"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-backdrop-strong)] p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      onClick={onClose}
      ref={dialogRef}
    >
      <button
        aria-label="Close image"
        className="glass-control text-foreground focus-visible:ring-ring absolute top-3 right-3 flex size-10 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
      >
        <X className="size-5" aria-hidden="true" />
      </button>
      <img
        className="max-h-full max-w-full object-contain"
        src={imageUrl}
        alt={title}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground flex min-w-0 items-center gap-2">
        {icon}
        <span className="[overflow-wrap:anywhere] break-words">{label}</span>
      </dt>
      <dd className="min-w-0 font-medium [overflow-wrap:anywhere] break-words sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function VisitorAction({
  disabled,
  isAuthenticated,
  isCancelling,
  isPending,
  isReservedByViewer,
  onCancel,
  onReserve,
}: {
  disabled: boolean;
  isAuthenticated: boolean;
  isCancelling: boolean;
  isPending: boolean;
  isReservedByViewer: boolean;
  onCancel: () => void;
  onReserve: () => void;
}) {
  const { localizedPath, t } = useI18n();

  if (!isAuthenticated) {
    return (
      <Button asChild className="w-full">
        <Link to={localizedPath('/login')}>{t('Log in to reserve')}</Link>
      </Button>
    );
  }

  if (isReservedByViewer) {
    return (
      <Button
        className="w-full"
        disabled={isCancelling}
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        {isCancelling ? t('Cancelling...') : t('Unreserve')}
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={disabled}
      type="button"
      onClick={onReserve}
    >
      {isPending ? t('Reserving...') : t('Reserve')}
    </Button>
  );
}

function ReportPostModal({
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: { body: string; subject: string }) => void;
}) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const canSubmit =
    subject.trim().length >= 2 &&
    subject.trim().length <= 120 &&
    body.trim().length >= 2 &&
    body.trim().length <= 1000;

  useDialogFocusTrap(dialogRef, {
    initialFocusRef: cancelButtonRef,
    onEscape: isSubmitting ? undefined : onClose,
  });

  return (
    <div
      aria-describedby="report-post-description"
      aria-labelledby="report-post-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-backdrop)] p-4 backdrop-blur-sm"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="border-border bg-card max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-[18px] border p-4 shadow-[0_18px_54px_var(--theme-surface-shadow)] sm:p-5"
        ref={dialogRef}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-md">
            <FileWarning className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold" id="report-post-title">
              {t('Report item')}
            </h2>
            <p
              className="text-muted-foreground mt-2 text-sm leading-6 [overflow-wrap:anywhere] break-words"
              id="report-post-description"
            >
              {t(
                'Reports are reviewed by admins and help keep the marketplace safe.',
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">{t('Subject')}</span>
            <input
              className="modern-input h-11 w-full rounded-[10px] px-3 text-base outline-none"
              disabled={isSubmitting}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">{t('Details')}</span>
            <textarea
              className="modern-input min-h-28 w-full rounded-[10px] px-3 py-3 text-base outline-none"
              disabled={isSubmitting}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={isSubmitting}
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('Cancel')}
          </Button>
          <Button
            disabled={!canSubmit || isSubmitting}
            type="button"
            onClick={() =>
              onSubmit({ body: body.trim(), subject: subject.trim() })
            }
          >
            {isSubmitting ? t('Submitting...') : t('Submit report')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditField({
  error,
  label,
  registration,
}: {
  error?: string;
  label: string;
  registration: UseFormRegisterReturn;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={registration.name}>
        {label}
      </label>
      <input
        className="modern-input h-11 w-full rounded-[10px] px-3 text-base outline-none"
        id={registration.name}
        type="text"
        {...registration}
      />
      <FieldError message={t(error ?? '')} />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-sm">{message}</p>;
}

function formatDate(value: string, language: string) {
  if (language === 'ge') {
    const date = new Date(value);
    const months = [
      'იანვარი',
      'თებერვალი',
      'მარტი',
      'აპრილი',
      'მაისი',
      'ივნისი',
      'ივლისი',
      'აგვისტო',
      'სექტემბერი',
      'ოქტომბერი',
      'ნოემბერი',
      'დეკემბერი',
    ];

    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  }

  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value: string, language: string) {
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
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

function getReservationActionLabel(
  status: 'accepted' | 'declined' | 'cancelled' | 'completed',
  t: (text: string) => string,
) {
  const labels = {
    accepted: 'Accept',
    declined: 'Reject',
    cancelled: 'Cancel reservation',
    completed: 'Mark completed',
  };

  return t(labels[status]);
}

function getReservationActionTitle(
  status: 'accepted' | 'declined' | 'cancelled' | 'completed',
  t: (text: string) => string,
) {
  const labels = {
    accepted: 'Accept reservation?',
    declined: 'Reject reservation?',
    cancelled: 'Cancel reservation?',
    completed: 'Complete reservation?',
  };

  return t(labels[status]);
}

function getReservationActionDescription(
  status: 'accepted' | 'declined' | 'cancelled' | 'completed',
  t: (text: string) => string,
) {
  const labels = {
    accepted: 'Accept this reservation request?',
    declined: 'Reject this reservation request?',
    cancelled: 'Cancel this accepted reservation?',
    completed: 'Mark this reservation as completed?',
  };

  return t(labels[status]);
}

function normalizeCity(value: string): EditPostValues['city'] {
  return postCityOptions.includes(value as EditPostValues['city'])
    ? (value as EditPostValues['city'])
    : 'Tbilisi';
}
