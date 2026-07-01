import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  ClipboardCheck,
  ImagePlus,
  MapPin,
  Package,
  Rocket,
  Tag,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import type { FeedPage } from '@/features/feed/api/feed-api';
import { useAuth } from '@/features/auth/context/use-auth';
import {
  categoryGroups,
  formatCategoryLabel,
  getCategoryGroupForValue,
} from '@/features/categories/category-taxonomy';
import { CityPicker } from '@/shared/components/city-picker';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';
import { getFriendlyErrorMessage, logErrorDetails } from '@/shared/lib/errors';

import { createPost } from '../api/create-post-api';
import type { PostBoostPlan } from '../api/post-boost-api';
import {
  boostPlanOptions,
  defaultBoostPlan,
  getBoostPlanOption,
} from '../constants/boost-plans';
import { postCityOptions } from '../constants/post-options';
import { compressImage } from '../utils/compress-image';
import {
  type CreatePostFormInput,
  createPostSchema,
  type CreatePostFormValues,
} from '../validation/create-post-schema';

type PhotoPreview = {
  file: File;
  url: string;
};
type CreateListingPlan = PostBoostPlan | 'free';

export function CreatePostForm() {
  const { user } = useAuth();
  const { localizedPath, t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const adminStatus = useAdminStatus();
  const canUseDemoPayments = Boolean(adminStatus.data);
  const [selectedPlan, setSelectedPlan] = useState<CreateListingPlan | null>(
    null,
  );
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const selectedBoostPlan =
    selectedPlan && selectedPlan !== 'free' ? selectedPlan : null;

  const {
    formState: { errors },
    handleSubmit,
    control,
    register,
    setValue,
  } = useForm<CreatePostFormInput, unknown, CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      city: 'Tbilisi',
      photos: [],
    },
  });

  const photos = useWatch({ control, name: 'photos' });
  const title = useWatch({ control, name: 'title' });
  const description = useWatch({ control, name: 'description' });
  const selectedCategory = useWatch({ control, name: 'category' });
  const selectedCity = useWatch({ control, name: 'city' });

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.setQueriesData<{ pages: FeedPage[]; pageParams: number[] }>(
        { queryKey: ['feed'] },
        (current) => {
          if (!current?.pages[0]) {
            return current;
          }

          return {
            ...current,
            pages: [
              {
                ...current.pages[0],
                items: [post, ...current.pages[0].items],
              },
              ...current.pages.slice(1),
            ],
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      navigate(
        localizedPath(
          `/posts/${post.id}${
            selectedBoostPlan && canUseDemoPayments
              ? `?boost=${selectedBoostPlan}`
              : ''
          }`,
        ),
        { replace: true },
      );
    },
    onError: (error) => {
      logErrorDetails('Post creation failed', error);
      setFormError(
        getFriendlyErrorMessage(error, 'Post could not be created.'),
      );
    },
  });

  useEffect(() => {
    return () => {
      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [photoPreviews]);

  const isSubmitting = mutation.isPending;
  const photoError = errors.photos?.message;
  const remainingPhotoSlots = useMemo(
    () => Math.max(0, 5 - photos.length),
    [photos.length],
  );
  const cityOptions = useMemo(
    () => postCityOptions.map((city) => ({ label: city, value: city })),
    [],
  );
  const selectedCategoryGroup = getCategoryGroupForValue(selectedCategory);
  const completionItems = [
    { complete: photos.length > 0, label: t('Photo') },
    { complete: title.trim().length >= 3, label: t('Title') },
    { complete: description.trim().length >= 10, label: t('Description') },
    { complete: Boolean(selectedCategory), label: t('Category') },
    { complete: Boolean(selectedCity), label: t('City') },
  ];
  const completedCount = completionItems.filter((item) => item.complete).length;

  async function handlePhotoSelection(files: FileList | null) {
    setFormError(null);

    if (!files) {
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingPhotoSlots);

    try {
      const compressedPhotos = await Promise.all(
        selectedFiles.map((file) => compressImage(file)),
      );
      const nextPhotos = [...photos, ...compressedPhotos];

      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setValue('photos', nextPhotos, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPhotoPreviews(
        nextPhotos.map((file) => ({ file, url: URL.createObjectURL(file) })),
      );
    } catch (error) {
      logErrorDetails('Photo processing failed', error);
      setFormError(
        getFriendlyErrorMessage(error, 'Photos could not be processed.'),
      );
    }
  }

  function removePhoto(index: number) {
    const nextPhotos = photos.filter((_, photoIndex) => photoIndex !== index);

    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setValue('photos', nextPhotos, { shouldDirty: true, shouldValidate: true });
    setPhotoPreviews(
      nextPhotos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    );
  }

  function onSubmit(values: CreatePostFormValues) {
    setFormError(null);

    if (!user) {
      setFormError('You must be logged in to create a post.');
      return;
    }

    mutation.mutate({
      ...values,
      ownerId: user.id,
    });
  }

  function choosePlan(plan: CreateListingPlan) {
    setSelectedPlan(plan);
    window.requestAnimationFrame(() => {
      window.scrollTo({ behavior: 'smooth', top: 0 });
    });
  }

  if (!selectedPlan) {
    return (
      <CreatePostPlanChooser
        canUseDemoPayments={canUseDemoPayments}
        isCheckingVip={adminStatus.isLoading}
        onSelect={choosePlan}
      />
    );
  }

  return (
    <form
      className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="min-w-0 space-y-4">
        <SelectedPlanSummary
          className="lg:hidden"
          selectedPlan={selectedPlan}
          onChangePlan={() => setSelectedPlan(null)}
        />

        <FormCard>
          <SectionTitle
            icon={<ImagePlus className="size-4" aria-hidden="true" />}
            title={t('Photos')}
            description={t(
              'Add 1 to 5 photos. Images are compressed before upload.',
            )}
          />

          <div className="mt-4 grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className={cn(
                  'h-1.5 rounded-full transition-colors',
                  index < photos.length ? 'bg-primary' : 'bg-muted',
                )}
                key={index}
              />
            ))}
          </div>

          {photoPreviews.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-5">
              {photoPreviews.map((preview, index) => (
                <div
                  className="group relative overflow-hidden rounded-[10px] border"
                  key={preview.url}
                >
                  <img
                    className="aspect-square w-full object-cover"
                    src={preview.url}
                    alt=""
                  />
                  <Button
                    aria-label={`${t('Remove photo')} ${index + 1}`}
                    className="absolute top-2 right-2 size-9 p-0"
                    type="button"
                    variant="outline"
                    onClick={() => removePhoto(index)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          {remainingPhotoSlots > 0 ? (
            <label className="border-border bg-background hover:border-primary/30 hover:bg-accent mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed p-5 text-center transition-colors">
              <span className="bg-accent text-primary flex size-12 items-center justify-center rounded-[12px]">
                <ImagePlus className="size-6" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold [overflow-wrap:anywhere] break-words">
                {t('Choose photos')}
              </span>
              <span className="text-muted-foreground text-xs">
                {remainingPhotoSlots} {t('slots left')}
              </span>
              <input
                aria-describedby={photoError ? 'photos-error' : undefined}
                aria-invalid={Boolean(photoError)}
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                multiple
                type="file"
                onChange={(event) =>
                  void handlePhotoSelection(event.target.files)
                }
              />
            </label>
          ) : null}

          {photoError ? (
            <div className="mt-3">
              <FieldError id="photos-error" message={t(photoError)} />
            </div>
          ) : null}
        </FormCard>

        <FormCard>
          <SectionTitle
            icon={<Package className="size-4" aria-hidden="true" />}
            title={t('Item details')}
            description={t('Use a clear title and honest condition details.')}
          />

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium" htmlFor="title">
                  {t('Title')}
                </label>
                <span className="text-muted-foreground text-xs">
                  {title.length}/120
                </span>
              </div>
              <input
                aria-describedby={errors.title ? 'title-error' : undefined}
                aria-invalid={Boolean(errors.title)}
                className={inputClassName(Boolean(errors.title))}
                id="title"
                placeholder={t('Example: Wooden chair in good condition')}
                type="text"
                {...register('title')}
              />
              {errors.title ? (
                <FieldError
                  id="title-error"
                  message={t(errors.title.message ?? '')}
                />
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium" htmlFor="description">
                  {t('Description')}
                </label>
                <span className="text-muted-foreground text-xs">
                  {description.length}/2000
                </span>
              </div>
              <textarea
                aria-describedby={
                  errors.description ? 'description-error' : undefined
                }
                aria-invalid={Boolean(errors.description)}
                className={cn(
                  inputClassName(Boolean(errors.description)),
                  'min-h-36 resize-y py-3 leading-6',
                )}
                id="description"
                placeholder={t(
                  'Describe condition, pickup details, and what is included.',
                )}
                {...register('description')}
              />
              <p className="text-muted-foreground text-xs">
                {t(
                  'Do not add your phone number here. People can contact you through the post.',
                )}
              </p>
              {errors.description ? (
                <FieldError
                  id="description-error"
                  message={t(errors.description.message ?? '')}
                />
              ) : null}
            </div>
          </div>
        </FormCard>

        <FormCard>
          <SectionTitle
            icon={<Tag className="size-4" aria-hidden="true" />}
            title={t('Category')}
            description={t(
              'Choose the closest category so people can find it.',
            )}
          />

          <input type="hidden" {...register('category')} />
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categoryGroups.map((group) => {
                const isSelected = selectedCategoryGroup.value === group.value;
                const firstOption = group.options[0];

                return (
                  <button
                    aria-pressed={isSelected}
                    className={cn(
                      'rounded-[10px] border px-3 py-3 text-left text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground hover:border-primary/30 hover:bg-accent',
                    )}
                    key={group.value}
                    type="button"
                    onClick={() =>
                      setValue('category', firstOption.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate">{t(group.label)}</span>
                      {isSelected ? (
                        <Check className="size-4 shrink-0" aria-hidden="true" />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="soft-surface rounded-[12px] p-3">
              <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
                {t('Subcategory')}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {selectedCategoryGroup.options.map((option) => {
                  const isSelected = selectedCategory === option.value;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        'rounded-[10px] border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                        isSelected
                          ? 'border-primary bg-background text-primary'
                          : 'border-border bg-card text-foreground hover:border-primary/30',
                      )}
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setValue('category', option.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate">{t(option.label)}</span>
                        {isSelected ? (
                          <Check
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              {formatCategoryLabel(selectedCategory, t)}
            </p>
          </div>
          {errors.category ? (
            <div className="mt-3">
              <FieldError
                id="category-error"
                message={t(errors.category.message ?? '')}
              />
            </div>
          ) : null}
        </FormCard>

        <FormCard>
          <SectionTitle
            icon={<MapPin className="size-4" aria-hidden="true" />}
            title={t('Pickup city')}
            description={t('Pick the city where the item can be collected.')}
          />

          <div className="mt-4">
            <input type="hidden" {...register('city')} />
            <CityPicker
              errorMessageId={errors.city ? 'city-error' : undefined}
              error={Boolean(errors.city)}
              options={cityOptions}
              searchLabel={t('Search city')}
              value={selectedCity}
              onChange={(city) =>
                setValue('city', city, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            {errors.city ? (
              <div className="mt-3">
                <FieldError
                  id="city-error"
                  message={t(errors.city.message ?? '')}
                />
              </div>
            ) : null}
          </div>
        </FormCard>

        {formError ? (
          <p
            className="text-destructive rounded-md border border-current p-3 text-sm"
            role="alert"
          >
            {t(formError)}
          </p>
        ) : null}
      </div>

      <aside className="lg:sticky lg:top-24">
        <div className="border-border bg-card hidden rounded-[16px] border p-4 lg:block">
          <SectionTitle
            icon={<ClipboardCheck className="size-4" aria-hidden="true" />}
            title={t('Post summary')}
            description={t('Review the basics before publishing.')}
          />
          <div className="mt-4 space-y-3">
            <SummaryRow label={t('Progress')} value={`${completedCount}/5`} />
            <SummaryRow label={t('Photos')} value={`${photos.length}/5`} />
            <SummaryRow
              label={t('Category')}
              value={formatCategoryLabel(selectedCategory, t)}
            />
            <SummaryRow label={t('City')} value={t(selectedCity)} />
          </div>
          <div className="mt-4 grid gap-2">
            {completionItems.map((item) => (
              <div
                className="text-muted-foreground flex items-center gap-2 text-sm"
                key={item.label}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border',
                    item.complete
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border',
                  )}
                >
                  {item.complete ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : null}
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <SelectedPlanSummary
            className="mt-4"
            selectedPlan={selectedPlan}
            onChangePlan={() => setSelectedPlan(null)}
          />
          <Button
            className="mt-5 h-12 w-full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? t('Creating post...') : t('Create post')}
          </Button>
        </div>

        <div className="bg-card/95 fixed inset-x-0 bottom-20 z-20 border-t p-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t('Post summary')}</p>
              <p className="text-muted-foreground truncate text-xs">
                {completedCount}/5 - {photos.length}/5 {t('Photos')} -{' '}
                {t(selectedCity)}
              </p>
            </div>
            <Button
              className="h-11 shrink-0 px-4"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? t('Creating...') : t('Publish')}
            </Button>
          </div>
        </div>
      </aside>
    </form>
  );
}

function CreatePostPlanChooser({
  canUseDemoPayments,
  isCheckingVip,
  onSelect,
}: {
  canUseDemoPayments: boolean;
  isCheckingVip: boolean;
  onSelect: (plan: CreateListingPlan) => void;
}) {
  const { t } = useI18n();
  const isVipDisabled = isCheckingVip || !canUseDemoPayments;

  return (
    <section className="space-y-4">
      <div className="boost-priority-card rounded-[16px] p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="boost-cta-button flex size-11 shrink-0 items-center justify-center rounded-[12px]">
            <Rocket className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl leading-7 font-bold">
              {t('Choose listing plan')}
            </h2>
            <p className="mt-1 text-sm leading-6 opacity-85">
              {t('Pick how your item should appear before writing the post.')}
            </p>
          </div>
        </div>
      </div>

      <button
        className="solid-surface border-primary/40 hover:border-primary/70 hover:bg-accent/60 flex w-full flex-col gap-4 rounded-[16px] border p-4 text-left transition-colors sm:p-5"
        type="button"
        onClick={() => onSelect('free')}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-primary text-xs font-bold tracking-[0.12em] uppercase">
                {t('Free plan')}
              </p>
            </div>
            <h3 className="mt-1 text-lg font-bold">{t('Standard listing')}</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-5">
              {t(
                'Post for free now. You can still boost this item later from the post page.',
              )}
            </p>
          </div>
          <span className="bg-primary text-primary-foreground flex min-h-11 shrink-0 items-center justify-center rounded-[10px] px-4 text-sm font-bold">
            {t('Continue free')}
          </span>
        </div>
      </button>

      <div className="space-y-3">
        <div className="flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold">{t('VIP priority')}</p>
            <p className="text-muted-foreground text-sm leading-5">
              {t('Publish, then boost your item to the top of the feed.')}
            </p>
          </div>
          {!canUseDemoPayments ? (
            <p className="text-muted-foreground text-xs font-semibold">
              {t('Admin demo only')}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {boostPlanOptions.map((option) => {
            const isRecommended = option.plan === defaultBoostPlan;

            return (
              <button
                className={cn(
                  'boost-priority-card flex min-h-44 flex-col rounded-[16px] p-4 text-left transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0 sm:p-5',
                  isRecommended && 'shadow-lg ring-2 ring-amber-300/75',
                )}
                disabled={isVipDisabled}
                key={option.plan}
                type="button"
                onClick={() => onSelect(option.plan)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold tracking-[0.12em] uppercase">
                        {t('VIP priority')}
                      </p>
                      {isRecommended ? (
                        <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-black text-amber-800 dark:bg-white/15 dark:text-amber-100">
                          {t('Recommended')}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-1 text-lg font-bold">
                      {t(option.title)}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white/60 px-2 py-1 text-sm font-black text-amber-800 dark:bg-white/10 dark:text-amber-100">
                    {option.price}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold">
                  {t(option.duration)}
                </p>
                <p className="mt-1 text-sm leading-5 opacity-80">
                  {t(option.description)}
                </p>
                <span className="boost-cta-button mt-auto flex min-h-11 items-center justify-center rounded-[10px] px-3 py-2 text-sm font-bold">
                  {isCheckingVip
                    ? t('Checking VIP availability...')
                    : canUseDemoPayments
                      ? t('Continue with VIP')
                      : t('Admin demo only')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SelectedPlanSummary({
  className,
  onChangePlan,
  selectedPlan,
}: {
  className?: string;
  onChangePlan: () => void;
  selectedPlan: CreateListingPlan;
}) {
  const { t } = useI18n();
  const boostOption =
    selectedPlan === 'free' ? null : getBoostPlanOption(selectedPlan);

  return (
    <div
      className={cn(
        boostOption ? 'boost-priority-card' : 'soft-surface',
        'rounded-[14px] p-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-[10px]',
            boostOption ? 'boost-cta-button' : 'bg-accent text-primary',
          )}
        >
          {boostOption ? (
            <Rocket className="size-5" aria-hidden="true" />
          ) : (
            <Check className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-[0.12em] uppercase opacity-75">
            {t('Selected plan')}
          </p>
          <p className="mt-1 font-bold">
            {boostOption
              ? `${t(boostOption.title)} - ${boostOption.price}`
              : t('Free plan')}
          </p>
          <p className="mt-1 text-sm leading-5 opacity-80">
            {boostOption
              ? t('VIP boost opens after publishing.')
              : t('Standard free listing.')}
          </p>
        </div>
        <Button
          className="h-9 shrink-0 px-3"
          type="button"
          variant="outline"
          onClick={onChangePlan}
        >
          {t('Change')}
        </Button>
      </div>
    </div>
  );
}

function FormCard({ children }: { children: ReactNode }) {
  return (
    <section className="border-border bg-card min-w-0 rounded-[16px] border p-4 sm:p-5">
      {children}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-[10px] border px-3 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 truncate font-semibold">{value}</span>
    </div>
  );
}

function SectionTitle({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-accent text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[10px]">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-base leading-6 font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-5">
          {description}
        </p>
      </div>
    </div>
  );
}

function inputClassName(hasError: boolean) {
  return cn(
    'modern-input h-11 w-full rounded-[10px] px-3 text-base outline-none disabled:cursor-not-allowed disabled:opacity-60',
    hasError && 'border-destructive focus-visible:ring-destructive',
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-destructive text-sm" id={id}>
      {message}
    </p>
  );
}
