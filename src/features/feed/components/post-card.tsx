import { CalendarDays, ImageIcon, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import type { FeedPost } from '../types/feed';
import { StatusBadge } from './status-badge';

type PostCardProps = {
  post: FeedPost;
};

export function PostCard({ post }: PostCardProps) {
  const { language, localizedPath, t } = useI18n();
  const postUrl = localizedPath(`/posts/${post.id}`);

  return (
    <article className="premium-card premium-card-hover group overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1">
      <Link
        aria-label={post.title}
        className="bg-muted focus-visible:ring-ring block aspect-[4/3] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset"
        to={postUrl}
      >
        {post.imageUrl ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
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

      <div className="relative space-y-3 p-4">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="line-clamp-2 text-base leading-6 font-semibold tracking-tight">
            <Link
              className="focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
              to={postUrl}
            >
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>
          <StatusBadge status={post.status} />
        </div>

        <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
          {post.description}
        </p>

        <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin
              className="size-3.5 shrink-0 sm:size-4"
              aria-hidden="true"
            />
            <span className="truncate">{t(post.location)}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <CalendarDays
              className="size-3.5 shrink-0 sm:size-4"
              aria-hidden="true"
            />
            <span className="truncate">
              {formatDate(post.createdAt, language)}
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <CalendarDays
              className="size-3.5 shrink-0 sm:size-4"
              aria-hidden="true"
            />
            <span className="truncate">
              {t('Expires')} {formatDate(post.expiresAt, language)}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
