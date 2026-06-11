import { useCallback, useMemo, useState } from 'react';
import { HeartHandshake, MapPin, Sparkles } from 'lucide-react';

import { FeedFilters } from '@/features/feed/components/feed-filters';
import { PostCard } from '@/features/feed/components/post-card';
import { useFeed } from '@/features/feed/hooks/use-feed';
import type { FeedFilters as FeedFiltersValue } from '@/features/feed/types/feed';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';

const initialFilters: FeedFiltersValue = {
  search: '',
  category: 'all',
  city: 'all',
  status: 'all',
};

export function HomePage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<FeedFiltersValue>(initialFilters);
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useFeed({
    ...filters,
    search: filters.search.trim(),
  });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <PageContainer className="gap-7">
      <section className="relative isolate space-y-5 py-2">
        <div className="glass-control text-primary flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold">
          <Sparkles className="size-4" aria-hidden="true" />
          {t('Community giving')}
        </div>

        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
            {t('Free items in Georgia')}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-8">
            {t(
              'Find unwanted items people are giving away and help keep useful things out of waste.',
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="glass-control text-foreground flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium">
            <HeartHandshake
              className="text-primary size-4"
              aria-hidden="true"
            />
            {t('Local and free')}
          </span>
          <span className="glass-control text-foreground flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium">
            <MapPin className="text-primary size-4" aria-hidden="true" />
            {t('Georgia-wide')}
          </span>
        </div>
      </section>

      <FeedFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <LoadingState
          title={t('Loading free items')}
          description={t('Gaachuqe is loading the latest posts.')}
          variant="feed"
        />
      ) : null}

      {isError ? (
        <div className="bg-card rounded-lg border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('Could not load feed')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error ? error.message : t('Please try again.')}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && posts.length === 0 ? (
        <EmptyState
          title={t('No free items found')}
          description={t(
            'Try changing your search or filters to see more available items.',
          )}
        />
      ) : null}

      {posts.length > 0 ? (
        <section
          aria-label={t('Free item feed')}
          className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:grid-cols-3 lg:gap-5"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      ) : null}

      {hasNextPage ? (
        <Button
          className="self-center"
          disabled={isFetchingNextPage}
          type="button"
          variant="outline"
          onClick={loadMore}
        >
          {isFetchingNextPage ? t('Loading...') : t('Show more')}
        </Button>
      ) : null}
    </PageContainer>
  );
}
