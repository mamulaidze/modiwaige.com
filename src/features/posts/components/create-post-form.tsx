import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ImagePlus, MapPin, Package, Tag, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import type { FeedPage } from '@/features/feed/api/feed-api';
import { useAuth } from '@/features/auth/context/use-auth';
import { CityPicker } from '@/shared/components/city-picker';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';
import { getFriendlyErrorMessage, logErrorDetails } from '@/shared/lib/errors';

import { createPost } from '../api/create-post-api';
import {
  postCategoryOptions,
  postCityOptions,
} from '../constants/post-options';
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
      className="border-border bg-card min-w-0 space-y-8 rounded-[14px] border p-4 sm:p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <section className="space-y-4">
        <SectionTitle
          icon={<Package className="size-4" aria-hidden="true" />}
          title={t('Item details')}
          description={t('Use a clear title and honest condition details.')}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">
            {t('Title')}
          </label>
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
          <label className="text-sm font-medium" htmlFor="description">
            {t('Description')}
          </label>
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
      </section>

      <section className="space-y-4">
        <SectionTitle
          icon={<Tag className="size-4" aria-hidden="true" />}
          title={t('Category')}
          description={t('Choose the closest category so people can find it.')}
        />

        <input type="hidden" {...register('category')} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {postCategoryOptions.map((option) => {
            const isSelected = selectedCategory === option.value;

            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  'rounded-[10px] border px-3 py-3 text-left text-sm font-medium transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground hover:border-primary/30 hover:bg-accent',
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
                  {t(option.label)}
                  {isSelected ? (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        {errors.category ? (
          <FieldError
            id="category-error"
            message={t(errors.category.message ?? '')}
          />
        ) : null}
      </section>

      <section className="space-y-4">
        <SectionTitle
          icon={<MapPin className="size-4" aria-hidden="true" />}
          title={t('Pickup city')}
          description={t('Pick the city where the item can be collected.')}
        />

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
          <FieldError id="city-error" message={t(errors.city.message ?? '')} />
        ) : null}
      </section>

      <section className="space-y-3">
        <SectionTitle
          icon={<ImagePlus className="size-4" aria-hidden="true" />}
          title={t('Photos')}
          description={t(
            'Add 1 to 5 photos. Images are compressed before upload.',
          )}
        />

        <div className="grid grid-cols-5 gap-2">
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
          <div className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-5">
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
          <label className="border-border bg-background hover:border-primary/30 hover:bg-accent flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed p-5 text-center transition-colors">
            <span className="bg-accent text-primary flex size-12 items-center justify-center rounded-[10px]">
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
          <FieldError id="photos-error" message={t(photoError)} />
        ) : null}
      </section>

      {formError ? (
        <p
          className="text-destructive rounded-md border border-current p-3 text-sm"
          role="alert"
        >
          {t(formError)}
        </p>
      ) : null}

      <div className="bg-card/90 sticky bottom-20 z-10 -mx-4 border-t p-4 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Button className="h-12 w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? t('Creating post...') : t('Create post')}
        </Button>
      </div>
    </form>
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
