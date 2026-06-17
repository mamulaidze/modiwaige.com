import { useCallback, useMemo, useState } from 'react';
import {
  Bike,
  BookOpen,
  Gift,
  Globe2,
  HeartHandshake,
  Home,
  Laptop,
  Leaf,
  MapPin,
  Search,
  Shirt,
  Sparkles,
  Users,
} from 'lucide-react';

import { PostCard } from '@/features/feed/components/post-card';
import { categoryOptions, cityOptions } from '@/features/feed/constants/feed-filters';
import { useFeed } from '@/features/feed/hooks/use-feed';
import type { FeedFilters as FeedFiltersValue } from '@/features/feed/types/feed';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { getFriendlyErrorMessage } from '@/shared/lib/errors';

const initialFilters: FeedFiltersValue = {
  search: '',
  category: 'all',
  city: 'all',
  status: 'all',
};

const featuredCities = ['all', 'Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Zugdidi', 'Telavi'];
const categoryIcons: Record<string, typeof Sparkles> = {
  all: Sparkles,
  books: BookOpen,
  clothing: Shirt,
  electronics: Laptop,
  home: Home,
  other: Gift,
  sports: Bike,
};

export function HomePage() {
  const { language, t } = useI18n();
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
  const visibleCityCount = cityOptions.filter((city) => city.value !== 'all').length;
  const visibleCategoryCount = categoryOptions.filter(
    (category) => category.value !== 'all',
  ).length;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <PageContainer className="max-w-[1360px] gap-8 pt-5 sm:px-5 md:pt-6 lg:px-6">
      <Seo
        title={
          language === 'ge'
            ? 'უფასო ნივთები საქართველოში'
            : 'Free items in Georgia'
        }
        description={
          language === 'ge'
            ? 'იპოვეთ უფასო ნივთები საქართველოში, დაჯავშნეთ ახლომდებარე განცხადებები და გააჩუქეთ ნივთები, რომლებიც სხვას გამოადგება.'
            : 'Find free items in Georgia, reserve nearby giveaways, and give useful things a second life with Gaachuqe.'
        }
      />
      <section className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#07140f] px-5 py-12 text-white shadow-[0_28px_80px_hsl(160_30%_4%/.42)] sm:px-8 md:px-14 md:py-16">
        <img
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70"
          src="/home-hero-landscape.png"
          alt=""
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(160_30%_5%/.9),hsl(160_30%_6%/.62)_44%,hsl(160_30%_7%/.18)),linear-gradient(180deg,hsl(160_30%_5%/.18),hsl(160_30%_5%/.72))]" />

        <div className="max-w-3xl">
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-primary">
            <Leaf className="size-4" aria-hidden="true" />
            {t('Give freely. Build community.')}
          </div>

          <h1 className="max-w-2xl text-5xl leading-[0.96] font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl">
            {t('Free things, shared kindly.')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
            {t(
              'A community marketplace for giving away what you no longer need across Georgia.',
            )}
          </p>

          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t('Search free items')}</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-white/58"
                aria-hidden="true"
              />
              <input
                className="h-14 w-full rounded-full border border-white/10 bg-[#0d2018]/90 pr-5 pl-14 text-base text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/.08)] outline-none placeholder:text-white/50 focus:border-primary focus:ring-4 focus:ring-primary/20"
                placeholder={t('Search free items near you...')}
                type="search"
                value={filters.search}
                onChange={(event) =>
                  onChangeFilter({ search: event.target.value })
                }
              />
            </label>
            <Button className="h-14 rounded-full px-8 text-base" type="submit">
              {t('Search')}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {featuredCities.map((city) => {
              const isActive = filters.city === city;

              return (
                <button
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-white/10 bg-[#0c1d16]/86 text-white/72 hover:border-primary/50 hover:text-white'
                  }`}
                  key={city}
                  type="button"
                  onClick={() => onChangeFilter({ city })}
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  {city === 'all' ? t('All Georgia') : t(city)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        aria-label={t('Home statistics')}
        className="grid gap-4 md:grid-cols-3"
      >
        <HomeStat
          icon={<Gift className="size-5" aria-hidden="true" />}
          label={t('items currently showing')}
          value={posts.length.toLocaleString(language === 'ge' ? 'ka-GE' : 'en')}
        />
        <HomeStat
          icon={<Users className="size-5" aria-hidden="true" />}
          label={t('ways to give')}
          value={visibleCategoryCount.toLocaleString(language === 'ge' ? 'ka-GE' : 'en')}
        />
        <HomeStat
          icon={<Globe2 className="size-5" aria-hidden="true" />}
          label={t('cities across Georgia')}
          value={visibleCityCount.toLocaleString(language === 'ge' ? 'ka-GE' : 'en')}
        />
      </section>

      <section className="space-y-4" aria-label={t('Trending categories')}>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('Trending categories')}
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryOptions.map((category) => {
            const isActive = filters.category === category.value;
            const Icon = categoryIcons[category.value] ?? HeartHandshake;

            return (
              <button
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
                key={category.value}
                type="button"
                onClick={() => onChangeFilter({ category: category.value })}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t(category.label)}
              </button>
            );
          })}
        </div>
      </section>

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
            {t(getFriendlyErrorMessage(error))}
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
        <section aria-label={t('Free item feed')} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('Recently added')}
            </h2>
            <span className="text-primary text-sm font-semibold">
              {posts.length} {t('available')}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:grid-cols-3 lg:gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
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

  function onChangeFilter(nextFilters: Partial<FeedFiltersValue>) {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }
}

function HomeStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_44px_var(--theme-card-shadow)]">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-3xl font-semibold leading-none tracking-tight">
            {value}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">{label}</p>
        </div>
      </div>
    </div>
  );
}
