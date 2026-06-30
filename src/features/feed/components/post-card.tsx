import { ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCategoryLabel } from '@/features/categories/category-taxonomy';
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
    <article className="glass-surface group relative overflow-hidden rounded-[14px] shadow-sm">
      <div className="absolute top-2 right-2 left-2 z-10 flex flex-col items-start gap-1.5 sm:top-3 sm:right-3 sm:left-3 sm:flex-row sm:items-start sm:justify-between">
        {post.isBoosted ? <BoostBadge variant="overlay" /> : <span />}
        <StatusBadge status={post.status} />
      </div>
      <Link
        aria-label={post.title}
        className="bg-muted focus-visible:ring-ring m-1.5 mb-0 block aspect-square overflow-hidden rounded-[12px] outline-none focus-visible:ring-2 focus-visible:ring-inset sm:m-2 sm:mb-0 sm:aspect-[4/3] sm:rounded-[14px]"
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

      <div className="relative space-y-1.5 p-2.5 sm:space-y-2 sm:p-4">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-sm leading-5 font-semibold tracking-tight sm:text-[17px] sm:leading-6 sm:font-medium">
            <Link
              className="focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
              to={postUrl}
            >
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>
          {post.isBoosted ? (
            <span className="mt-1 inline-flex rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold text-amber-700 sm:text-[11px] dark:text-amber-300">
              {t('VIP')}
            </span>
          ) : null}
        </div>

        <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
          <span className="truncate">{t(post.location)}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">
            {formatRelativeDate(post.createdAt, language)}
          </span>
        </div>
        <div className="text-muted-foreground flex min-w-0 items-center text-xs leading-5 sm:text-sm">
          <span className="truncate">{formatCategoryLabel(post.category, t)}</span>
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
