import { ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { BoostBadge } from '@/features/posts/components/boost-badge';
import type { FeedPost } from '../types/feed';
import { StatusBadge } from './status-badge';

type PostCardProps = {
  post: FeedPost;
};

export function PostCard({ post }: PostCardProps) {
  const { language, localizedPath, t } = useI18n();
  const postUrl = localizedPath(`/posts/${post.id}`);

  return (
    <article className="group relative overflow-hidden rounded-[14px] border bg-card shadow-sm">
      {post.isBoosted ? (
        <div className="absolute top-3 left-3 z-10">
          <BoostBadge variant="overlay" />
        </div>
      ) : null}
      <div className="absolute top-3 right-3 z-10">
        <StatusBadge status={post.status} />
      </div>
      <Link
        aria-label={post.title}
        className="bg-muted focus-visible:ring-ring m-2 mb-0 block aspect-[4/3] overflow-hidden rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-inset"
        to={postUrl}
      >
        {post.imageUrl ? (
          <img
            className="h-full w-full object-cover"
            src={post.imageUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <ImageIcon className="size-9" aria-hidden="true" />
          </div>
        )}
      </Link>

      <div className="relative space-y-2 p-4">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-[17px] leading-6 font-medium tracking-tight">
            <Link
              className="focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
              to={postUrl}
            >
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>
          {post.isBoosted ? (
            <span className="mt-1 inline-flex rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              {t('VIP')}
            </span>
          ) : null}
        </div>

        <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
          <span className="truncate">{t(post.location)}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">
            {formatRelativeDate(post.createdAt, language)}
          </span>
        </div>
        <div className="text-muted-foreground flex min-w-0 items-center text-sm leading-5">
          <span className="truncate">{formatCategory(post.category, t)}</span>
        </div>
      </div>
    </article>
  );
}

function formatRelativeDate(value: string, language: string) {
  const elapsedDays = Math.round(
    (new Date(value).getTime() - Date.now()) / 86_400_000,
  );

  return new Intl.RelativeTimeFormat(getLanguageLocale(language), {
    numeric: 'auto',
  }).format(elapsedDays, 'day');
}

function formatCategory(value: string, t: (text: string) => string) {
  if (value === 'home') {
    return t('HomeCategory');
  }

  return t(value.replace(/^\w/, (letter) => letter.toUpperCase()));
}
