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
  Briefcase,
  Car,
  ChevronDown,
  ExternalLink,
  Gift,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Home,
  Laptop,
  MapPin,
  PawPrint,
  Search,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Rocket,
  Wrench,
  X,
} from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';

import { PostCard } from '@/features/feed/components/post-card';
import {
  categoryOptions,
  topLevelFeedCategoryOptions,
} from '@/features/feed/constants/feed-filters';
import { useFeed } from '@/features/feed/hooks/use-feed';
import type { FeedFilters as FeedFiltersValue } from '@/features/feed/types/feed';
import {
  categoryGroups,
  formatCategoryLabel,
  getCategoryGroupForValue,
} from '@/features/categories/category-taxonomy';
import { postCityOptions } from '@/features/posts/constants/post-options';
import { CityPicker } from '@/shared/components/city-picker';
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
const primaryParentCategories = [
  'all',
  'clothing',
  'home',
  'electronics',
  'books',
  'children',
] as const;
type SortMode = 'recommended' | 'newest';
const categoryIcons: Record<string, typeof Sparkles> = {
  all: Sparkles,
  books: BookOpen,
  clothing: Shirt,
  construction: Wrench,
  electronics: Laptop,
  home: Home,
  beauty_health: HeartPulse,
  other: Gift,
  office: Briefcase,
  pets: PawPrint,
  sports: Bike,
  vehicles: Car,
};

export function HomePage() {
  const location = useLocation();

  return <HomePageContent key={location.search} />;
}

function HomePageContent() {
  const { language, t } = useI18n();
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<FeedFiltersValue>(() =>
    getFiltersFromSearchParams(searchParams),
  );
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
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

  const posts = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.items) ?? [];

    if (sortMode === 'newest') {
      return [...items].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      );
    }

    return items;
  }, [data, sortMode]);
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const activeFilters = getActiveFilterLabels(filters, t);
  const selectedCategoryGroup =
    filters.category === 'all'
      ? null
      : getCategoryGroupForValue(filters.category);
  const primaryCategoryOptions = topLevelFeedCategoryOptions.filter(
    (category) =>
      primaryParentCategories.includes(
        category.value as (typeof primaryParentCategories)[number],
      ),
  );
  const moreCategoryOptions = topLevelFeedCategoryOptions.filter(
    (category) =>
      category.value !== 'all' &&
      !primaryParentCategories.includes(
        category.value as (typeof primaryParentCategories)[number],
      ),
  );
  const isMoreCategoryActive =
    selectedCategoryGroup &&
    moreCategoryOptions.some(
      (category) => category.value === selectedCategoryGroup.value,
    );

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
        <div className="flex flex-wrap gap-2">
          {primaryCategoryOptions.map((category) => {
            const isActive =
              filters.category === category.value ||
              selectedCategoryGroup?.value === category.value;
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm font-medium transition-colors ${
                  isMoreCategoryActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
                type="button"
              >
                {isMoreCategoryActive
                  ? t(selectedCategoryGroup.label)
                  : t('More')}
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {moreCategoryOptions.map((category) => {
                const Icon = categoryIcons[category.value] ?? HeartHandshake;

                return (
                  <DropdownMenuItem
                    key={category.value}
                    onSelect={() =>
                      onChangeFilter({ category: category.value })
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {t(category.label)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {selectedCategoryGroup ? (
          <div
            aria-label={t('Subcategory')}
            className="space-y-2 border-t pt-4"
          >
            <p className="text-muted-foreground text-sm font-semibold">
              {t(selectedCategoryGroup.label)}
            </p>
            <div className="flex flex-wrap gap-2">
              <SubcategoryButton
                active={filters.category === selectedCategoryGroup.value}
                label={getAllSubcategoriesLabel(selectedCategoryGroup.label)}
                onClick={() =>
                  onChangeFilter({ category: selectedCategoryGroup.value })
                }
              />
              {selectedCategoryGroup.options
                .filter(
                  (subcategory) =>
                    subcategory.value !== selectedCategoryGroup.value,
                )
                .map((subcategory) => (
                  <SubcategoryButton
                    active={filters.category === subcategory.value}
                    key={subcategory.value}
                    label={subcategory.label}
                    onClick={() =>
                      onChangeFilter({ category: subcategory.value })
                    }
                  />
                ))}
            </div>
          </div>
        ) : null}
        <div className="border-border space-y-3 border-t pt-4">
          <p className="text-sm font-semibold">{t('Location')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <CityPicker
              className="w-52 space-y-0"
              options={cityPickerOptions}
              placeholder={t('All Georgia')}
              searchLabel={t('Search city')}
              value={filters.city}
              onChange={(city) => onChangeFilter({ city })}
            />
            {featuredCities
              .filter((city) => city !== 'all')
              .slice(0, 4)
              .map((city) => {
                const isActive = filters.city === city;

                return (
                  <button
                    className={`flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-primary'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                    key={city}
                    type="button"
                    onClick={() => onChangeFilter({ city })}
                  >
                    <MapPin className="size-4" aria-hidden="true" />
                    {t(city)}
                  </button>
                );
              })}
          </div>
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
          sortMode={sortMode}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setIsFilterSheetOpen(false);
          }}
          onApplySort={setSortMode}
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

function getFiltersFromSearchParams(
  searchParams: URLSearchParams,
): FeedFiltersValue {
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
  sortMode,
  onApplySort,
  onApply,
  onClear,
  onClose,
}: {
  filters: FeedFiltersValue;
  sortMode: SortMode;
  onApplySort: (sortMode: SortMode) => void;
  onApply: (filters: FeedFiltersValue) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [draftFilters, setDraftFilters] = useState(filters);
  const [draftSortMode, setDraftSortMode] = useState(sortMode);

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
      <div className="glass-surface fixed inset-x-0 bottom-0 max-h-[88svh] touch-pan-y overflow-y-auto overscroll-contain rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl">
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
            <span className="text-sm font-medium">
              {t('Search free items')}
            </span>
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

          <MobileCategoryPicker
            value={draftFilters.category}
            onChange={(category) =>
              setDraftFilters((current) => ({
                ...current,
                category,
              }))
            }
          />

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

          <SegmentedChoice
            label={t('Sort')}
            options={[
              { label: t('Recommended'), value: 'recommended' },
              { label: t('Newest'), value: 'newest' },
            ]}
            value={draftSortMode}
            onChange={(value) => setDraftSortMode(value as SortMode)}
          />

          <SegmentedChoice
            label={t('Availability')}
            options={[
              { label: t('All available'), value: 'all' },
              { label: t('VIP only'), value: 'boosted' },
            ]}
            value={draftFilters.boostedOnly ? 'boosted' : 'all'}
            onChange={(value) =>
              setDraftFilters((current) => ({
                ...current,
                boostedOnly: value === 'boosted',
              }))
            }
          />
        </div>

        <div className="bg-background/55 sticky bottom-0 -mx-4 mt-6 grid grid-cols-[0.9fr_1.1fr] gap-2 border-t border-white/10 px-4 pt-3 backdrop-blur-xl">
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
            onClick={() => {
              onApplySort(draftSortMode);
              onApply(draftFilters);
            }}
          >
            {t('Apply')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubcategoryButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const { t } = useI18n();

  return (
    <button
      className={`rounded-[10px] border px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-primary bg-primary/12 text-primary'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
      type="button"
      onClick={onClick}
    >
      {t(label)}
    </button>
  );
}

function SegmentedChoice({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              aria-pressed={isActive}
              className={`rounded-[12px] border px-3 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card/65 text-muted-foreground'
              }`}
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileCategoryPicker({
  onChange,
  value,
}: {
  onChange: (category: FeedFiltersValue['category']) => void;
  value: FeedFiltersValue['category'];
}) {
  const { t } = useI18n();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const selectedGroup =
    value === 'all' ? null : getCategoryGroupForValue(value);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">{t('Category')}</p>
        <button
          aria-expanded={isCategoryOpen}
          className="glass-control flex min-h-12 w-full items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm font-semibold"
          type="button"
          onClick={() => setIsCategoryOpen((current) => !current)}
        >
          <span>
            {selectedGroup ? t(selectedGroup.label) : t('All categories')}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 transition-transform ${
              isCategoryOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
        {isCategoryOpen ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <MobileParentCategoryButton
              active={value === 'all'}
              icon={Sparkles}
              label={t('All categories')}
              onClick={() => {
                onChange('all');
                setIsCategoryOpen(false);
              }}
            />
            {categoryGroups.map((group) => {
              const Icon = categoryIcons[group.value] ?? HeartHandshake;

              return (
                <MobileParentCategoryButton
                  active={selectedGroup?.value === group.value}
                  icon={Icon}
                  key={group.value}
                  label={t(group.label)}
                  onClick={() => {
                    onChange(group.value);
                    setIsCategoryOpen(false);
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </div>

      {selectedGroup ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('Subcategory')}</p>
          <div className="grid gap-2">
            <button
              aria-pressed={value === selectedGroup.value}
              className={`rounded-[10px] border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                value === selectedGroup.value
                  ? 'border-primary bg-background text-primary'
                  : 'border-border bg-card/70 text-muted-foreground'
              }`}
              type="button"
              onClick={() => onChange(selectedGroup.value)}
            >
              {t('All subcategories')}
            </button>
            {selectedGroup.options
              .filter((option) => option.value !== selectedGroup.value)
              .map((option) => {
                const isActive = value === option.value;

                return (
                  <button
                    aria-pressed={isActive}
                    className={`rounded-[10px] border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-primary bg-background text-primary'
                        : 'border-border bg-card/70 text-foreground'
                    }`}
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MobileParentCategoryButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Sparkles;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`flex min-h-12 items-center gap-2 rounded-[12px] border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card/65 text-muted-foreground hover:text-foreground'
      }`}
      type="button"
      onClick={onClick}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
    </button>
  );
}

function getAllSubcategoriesLabel(groupLabel: string) {
  if (groupLabel === 'Clothing') {
    return 'All clothing';
  }

  if (groupLabel === 'HomeCategory') {
    return 'All home';
  }

  if (groupLabel === 'Construction materials') {
    return 'All construction';
  }

  if (groupLabel === 'Vehicles and parts') {
    return 'All vehicle items';
  }

  return 'All subcategories';
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
    labels.push(formatCategoryLabel(filters.category, t));
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
