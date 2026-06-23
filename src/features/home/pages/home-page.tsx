import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Bike,
  BookOpen,
  ExternalLink,
  Gift,
  GraduationCap,
  HeartHandshake,
  Home,
  Laptop,
  MapPin,
  Search,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Rocket,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { PostCard } from '@/features/feed/components/post-card';
import { categoryOptions } from '@/features/feed/constants/feed-filters';
import { useFeed } from '@/features/feed/hooks/use-feed';
import type { FeedFilters as FeedFiltersValue } from '@/features/feed/types/feed';
import { postCityOptions } from '@/features/posts/constants/post-options';
import { CityPicker } from '@/shared/components/city-picker';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { PageContainer } from '@/shared/layouts/page-container';
import { getFriendlyErrorMessage } from '@/shared/lib/errors';

const initialFilters: FeedFiltersValue = {
  search: '',
  category: 'all',
  city: 'all',
  status: 'all',
  boostedOnly: false,
};

const featuredCities = [
  'all',
  'Tbilisi',
  'Batumi',
  'Kutaisi',
  'Rustavi',
  'Zugdidi',
  'Telavi',
];
const cityPickerOptions = [
  { label: 'All Georgia', value: 'all' },
  ...postCityOptions.map((city) => ({ label: city, value: city })),
];
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
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<FeedFiltersValue>(initialFilters);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 400);
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
    search: debouncedSearch,
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
  const activeFilters = getActiveFilterLabels(filters, t);

  useEffect(() => {
    const nextFilters = getFiltersFromSearchParams(searchParams);

    setFilters((current) => {
      if (
        current.search === nextFilters.search &&
        current.category === nextFilters.category &&
        current.city === nextFilters.city &&
        current.boostedOnly === nextFilters.boostedOnly
      ) {
        return current;
      }

      return nextFilters;
    });
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('focus') !== 'search') {
      return;
    }

    window.requestAnimationFrame(() => {
      searchInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      searchInputRef.current?.focus();
    });
  }, [searchParams]);

  useEffect(() => {
    if (!isFilterSheetOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isFilterSheetOpen]);

  return (
    <PageContainer className="max-w-[1360px] gap-10 pt-5 sm:px-5 md:pt-6 lg:px-6">
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
      <section className="space-y-3 md:hidden" aria-label={t('Feed filters')}>
        <div className="flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t('Search free items')}</span>
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              className="modern-input h-12 w-full rounded-[12px] pr-3 pl-9 text-base outline-none"
              placeholder={t('Search free items')}
              ref={searchInputRef}
              type="search"
              value={filters.search}
              onChange={(event) =>
                onChangeFilter({ search: event.target.value })
              }
            />
          </label>
          <Button
            aria-expanded={isFilterSheetOpen}
            aria-label={t('Filters')}
            className="size-12 shrink-0 px-0"
            type="button"
            variant="outline"
            onClick={() => setIsFilterSheetOpen(true)}
          >
            <SlidersHorizontal className="size-5" aria-hidden="true" />
          </Button>
        </div>

        {activeFilters.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeFilters.map((filter) => (
              <span
                className="bg-accent text-primary inline-flex shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                key={filter}
              >
                {filter}
              </span>
            ))}
            <button
              className="text-muted-foreground hover:text-foreground shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
              type="button"
              onClick={clearFilters}
            >
              {t('Clear')}
            </button>
          </div>
        ) : null}
      </section>

      <section
        className="hidden space-y-4 md:block"
        aria-label={t('Trending categories')}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl leading-7 font-bold tracking-tight">
            {t('Trending categories')}
          </h2>
          <button
            aria-pressed={filters.boostedOnly}
            className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 text-sm font-medium transition-colors ${
              filters.boostedOnly
                ? 'border-amber-400 bg-amber-400 text-amber-950'
                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-amber-400/60'
            }`}
            type="button"
            onClick={() =>
              onChangeFilter({ boostedOnly: !filters.boostedOnly })
            }
          >
            <Rocket className="size-4" aria-hidden="true" />
            {t('Boosted only')}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryOptions.map((category) => {
            const isActive = filters.category === category.value;
            const Icon = categoryIcons[category.value] ?? HeartHandshake;

            return (
              <button
                className={`flex shrink-0 items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm font-medium transition-colors ${
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
        <div className="border-border flex gap-2 overflow-x-auto border-t pt-4 pb-1">
          {featuredCities.map((city) => {
            const isActive = filters.city === city;

            return (
              <button
                className={`flex shrink-0 items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
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
          <CityPicker
            className="w-44 shrink-0 space-y-0"
            options={cityPickerOptions}
            placeholder={t('More cities')}
            searchLabel={t('Search city')}
            value={
              featuredCities.includes(filters.city) ? '' : filters.city
            }
            onChange={(city) => onChangeFilter({ city })}
          />
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                {t('Free item feed')}
              </p>
              <h2 className="text-2xl leading-7 font-bold tracking-tight">
                {t('Recently added')}
              </h2>
            </div>
            <span className="bg-accent text-primary inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold">
              {posts.length} {t('available')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {posts.map((post, index) => (
              <Fragment key={post.id}>
                <PostCard post={post} />
                {shouldShowAdAfterPost(index, posts.length) ? (
                  <SponsoredAd
                    language={language}
                    slotNumber={Math.ceil((index + 1) / 6) + 1}
                  />
                ) : null}
              </Fragment>
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

      {isFilterSheetOpen ? (
        <MobileFilterSheet
          filters={filters}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setIsFilterSheetOpen(false);
          }}
          onClear={() => {
            setFilters(initialFilters);
            setIsFilterSheetOpen(false);
          }}
          onClose={() => setIsFilterSheetOpen(false)}
        />
      ) : null}
    </PageContainer>
  );

  function onChangeFilter(nextFilters: Partial<FeedFiltersValue>) {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }

  function clearFilters() {
    setFilters(initialFilters);
  }
}

function getFiltersFromSearchParams(searchParams: URLSearchParams): FeedFiltersValue {
  const search = searchParams.get('search')?.trim() ?? '';
  const categoryParam = searchParams.get('category') ?? 'all';
  const city = searchParams.get('city')?.trim() || 'all';
  const boostedOnly = searchParams.get('boosted') === 'true';
  const category = categoryOptions.some(
    (option) => option.value === categoryParam,
  )
    ? (categoryParam as FeedFiltersValue['category'])
    : 'all';

  return {
    ...initialFilters,
    boostedOnly,
    category,
    city,
    search,
  };
}

function MobileFilterSheet({
  filters,
  onApply,
  onClear,
  onClose,
}: {
  filters: FeedFiltersValue;
  onApply: (filters: FeedFiltersValue) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [draftFilters, setDraftFilters] = useState(filters);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm md:hidden"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="glass-surface fixed inset-x-0 bottom-0 max-h-[88svh] touch-pan-y overflow-y-auto rounded-t-3xl p-4 overscroll-contain pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t('Filters')}</h2>
            <p className="text-muted-foreground text-sm">
              {t('Search, category, and city')}
            </p>
          </div>
          <button
            aria-label={t('Close')}
            className="border-border flex size-10 items-center justify-center rounded-full border"
            type="button"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5">
          <label className="space-y-2">
            <span className="text-sm font-medium">{t('Search free items')}</span>
            <input
                className="glass-control h-12 w-full rounded-[12px] px-3 text-base outline-none"
              value={draftFilters.search}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm font-medium">{t('Category')}</p>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((category) => {
                const isActive = draftFilters.category === category.value;

                return (
                  <button
                    className={`rounded-[12px] border px-3 py-3 text-sm font-semibold backdrop-blur transition-colors ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card/55 text-muted-foreground'
                    }`}
                    key={category.value}
                    type="button"
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        category: category.value,
                      }))
                    }
                  >
                    {t(category.label)}
                  </button>
                );
              })}
            </div>
          </div>

          <CityPicker
            label={t('City')}
            options={cityPickerOptions}
            searchLabel={t('Search city')}
            value={draftFilters.city}
            onChange={(city) =>
              setDraftFilters((current) => ({
                ...current,
                city,
              }))
            }
          />

          <label className="glass-control flex items-center justify-between gap-3 rounded-[12px] p-4">
            <span className="font-medium">{t('Boosted posts only')}</span>
            <input
              checked={draftFilters.boostedOnly}
              className="size-5 accent-[var(--primary)]"
              type="checkbox"
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  boostedOnly: event.target.checked,
                }))
              }
            />
          </label>
        </div>

        <div className="sticky bottom-0 -mx-4 mt-6 grid grid-cols-[0.9fr_1.1fr] gap-2 border-t border-white/10 bg-background/55 px-4 pt-3 backdrop-blur-xl">
          <Button
            className="h-11 px-3 text-xs leading-tight sm:px-4 sm:text-sm"
            type="button"
            variant="outline"
            onClick={onClear}
          >
            {t('Clear filters')}
          </Button>
          <Button
            className="h-11 px-2 text-sm leading-tight"
            type="button"
            onClick={() => onApply(draftFilters)}
          >
            {t('Apply')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getActiveFilterLabels(
  filters: FeedFiltersValue,
  t: (text: string) => string,
) {
  const labels: string[] = [];

  if (filters.search.trim()) {
    labels.push(filters.search.trim());
  }

  if (filters.category !== 'all') {
    const category = categoryOptions.find(
      (option) => option.value === filters.category,
    );
    labels.push(t(category?.label ?? filters.category));
  }

  if (filters.city !== 'all') {
    labels.push(t(filters.city));
  }

  if (filters.boostedOnly) {
    labels.push(t('Boosted only'));
  }

  return labels;
}

function shouldShowAdAfterPost(index: number, totalPosts: number) {
  const postPosition = index + 1;

  return postPosition % 8 === 0 && index < totalPosts - 1;
}

function SponsoredAd({
  language,
  slotNumber,
}: {
  language: 'ge' | 'en' | 'ru';
  slotNumber: number;
}) {
  const copy = {
    ge: {
      label: '\u10E0\u10D4\u10D9\u10DA\u10D0\u10DB\u10D0',
      headline:
        '\u10D2\u10D0\u10DC\u10D0\u10D7\u10DA\u10D4\u10D1\u10D0, \u10E0\u10DD\u10DB\u10D4\u10DA\u10D8\u10EA \u10E8\u10D4\u10DC\u10D7\u10D0\u10DC \u10D4\u10E0\u10D7\u10D0\u10D3 \u10D8\u10D6\u10E0\u10D3\u10D4\u10D1\u10D0',
      description:
        '\u10D0\u10E6\u10DB\u10DD\u10D0\u10E9\u10D8\u10DC\u10D4 \u10E1\u10D0\u10E1\u10EC\u10D0\u10D5\u10DA\u10DD \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10D2\u10D0\u10DC\u10D0\u10D5\u10D8\u10D7\u10D0\u10E0\u10D4 \u10E8\u10D4\u10DC\u10D8 \u10E8\u10D4\u10E1\u10D0\u10EB\u10DA\u10D4\u10D1\u10DA\u10DD\u10D1\u10D4\u10D1\u10D8.',
      action:
        '\u10D0\u10EE\u10DA\u10D0\u10D5\u10D4 \u10D3\u10D0\u10D8\u10EC\u10E7\u10D4',
    },
    en: {
      label: 'Advertisement',
      headline: 'Education that grows with you',
      description:
        'Discover learning resources and develop skills that move you forward.',
      action: 'Start learning',
    },
    ru: {
      label: '\u0420\u0435\u043A\u043B\u0430\u043C\u0430',
      headline:
        '\u041E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0440\u0430\u0441\u0442\u0435\u0442 \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u0432\u0430\u043C\u0438',
      description:
        '\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u0439\u0442\u0435 \u0443\u0447\u0435\u0431\u043D\u044B\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u0438 \u0440\u0430\u0437\u0432\u0438\u0432\u0430\u0439\u0442\u0435 \u043D\u0430\u0432\u044B\u043A\u0438 \u0434\u043B\u044F \u0431\u0443\u0434\u0443\u0449\u0435\u0433\u043E.',
      action:
        '\u041D\u0430\u0447\u0430\u0442\u044C \u0443\u0447\u0438\u0442\u044C\u0441\u044F',
    },
  }[language];

  return (
    <aside
      aria-label={`Sponsored placement ${slotNumber}`}
      className="sponsored-campaign col-span-2 overflow-hidden rounded-[14px] xl:col-span-4"
    >
      <a
        className="sponsored-campaign-link group relative isolate flex min-h-36 overflow-hidden p-4 sm:p-5"
        href="https://kartserluxi.com"
        rel="noopener noreferrer sponsored"
        target="_blank"
      >
        <img
          alt=""
          aria-hidden="true"
          className="sponsored-campaign-image absolute -z-20 object-cover transition-transform duration-700 group-hover:scale-[1.025]"
          src="/kartser-luxi-campaign.png"
        />
        <div
          className="sponsored-campaign-overlay absolute inset-0 -z-10"
          aria-hidden="true"
        />

        <div className="sponsored-campaign-copy flex w-full max-w-2xl flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="sponsored-campaign-logo flex size-11 items-center justify-center rounded-xl text-sm font-black">
                KL
              </span>
              <div>
                <p className="sponsored-campaign-label text-xs font-bold tracking-[0.16em] uppercase">
                  {copy.label}
                </p>
                <p className="mt-0.5 text-lg font-semibold">Kartser Luxi</p>
              </div>
            </div>

            <h3 className="mt-3 max-w-lg text-xl leading-7 font-bold text-balance">
              {copy.headline}
            </h3>
            <p className="sponsored-campaign-description mt-2 max-w-md text-sm leading-6">
              {copy.description}
            </p>
          </div>

          <span className="sponsored-campaign-action flex w-fit items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-bold">
            <GraduationCap className="size-4" aria-hidden="true" />
            {copy.action}
            <ExternalLink className="size-4" aria-hidden="true" />
          </span>
        </div>
      </a>
    </aside>
  );
}
