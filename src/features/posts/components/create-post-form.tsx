import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  ClipboardCheck,
  ImagePlus,
  MapPin,
  Package,
  Tag,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

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

export function CreatePostForm() {
  const { user } = useAuth();
  const { localizedPath, t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

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
      navigate(localizedPath('/'), { replace: true });
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

  return (
    <form
      className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="min-w-0 space-y-4">
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
