import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

import { CityPicker } from '@/shared/components/city-picker';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';
import { categoryOptions, cityOptions } from '../constants/feed-filters';
import type { FeedFilters as FeedFiltersValue } from '../types/feed';

type FeedFiltersProps = {
  filters: FeedFiltersValue;
  onChange: (filters: FeedFiltersValue) => void;
};

export function FeedFilters({ filters, onChange }: FeedFiltersProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const panelId = useId();
  const activeFilterCount = [
    filters.search.trim(),
    filters.category !== 'all',
    filters.city !== 'all',
    filters.boostedOnly,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;
  const isCollapsed = isScrolled && !isOpen;
  useEffect(() => {
    function updateScrolledState() {
      setIsScrolled(window.scrollY > 220);
    }

    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });

    return () => window.removeEventListener('scroll', updateScrolledState);
  }, []);

  function clearFilters() {
    onChange({
      ...filters,
      search: '',
      category: 'all',
      city: 'all',
      boostedOnly: false,
    });
  }

  return (
    <section
      className={`sticky top-20 z-20 transition-all duration-500 ease-out sm:top-24 ${
        isCollapsed
          ? 'ml-auto w-fit'
          : cn('filter-card-enter glass-surface overflow-visible rounded-3xl')
      }`}
      aria-label={t('Feed filters')}
    >
      {isCollapsed ? (
        <Button
          aria-controls={panelId}
          aria-expanded={isOpen}
          aria-label={t('Filters')}
          className="filter-pop-in glass-surface size-14 rounded-3xl px-0 transition-transform duration-200 hover:scale-105"
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
        >
          <SlidersHorizontal className="size-5" aria-hidden="true" />
        </Button>
      ) : null}

      {!isCollapsed ? (
        <>
          <div className="space-y-3 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  aria-label={t('Search free items')}
                  className="modern-input h-12 w-full rounded-2xl pr-3 pl-9 text-base outline-none"
                  placeholder={t('Search free items')}
                  type="search"
                  value={filters.search}
                  onChange={(event) =>
                    onChange({ ...filters, search: event.target.value })
                  }
                />
              </div>

              <Button
                aria-controls={panelId}
                aria-expanded={isOpen}
                aria-label={t('Filters')}
                className="size-12 shrink-0 rounded-2xl px-0"
                type="button"
                variant="outline"
                onClick={() => setIsOpen((current) => !current)}
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-3">
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="text-muted-foreground hover:text-foreground flex min-w-0 items-center gap-2 text-sm font-medium transition-colors"
                type="button"
                onClick={() => setIsOpen((current) => !current)}
              >
                <span className="truncate">
                  {hasActiveFilters
                    ? `${activeFilterCount} ${t('active')}`
                    : t('Search, category, and city')}
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {hasActiveFilters ? (
                <Button
                  className="h-8 shrink-0 px-2 text-xs"
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                >
                  <X className="size-3.5" aria-hidden="true" />
                  {t('Clear')}
                </Button>
              ) : null}
            </div>
          </div>

          {isOpen ? (
            <div
              id={panelId}
              className="filter-panel-enter border-t p-3 pt-4 sm:p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    {t('Category')}
                  </span>
                  <select
                    className="modern-input h-11 w-full rounded-2xl px-3 text-base outline-none"
                    value={filters.category}
                    onChange={(event) =>
                      onChange({
                        ...filters,
                        category: event.target
                          .value as FeedFiltersValue['category'],
                      })
                    }
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </select>
                </label>

                <CityPicker
                  className="[&>label]:text-muted-foreground [&>label]:text-xs [&>label]:font-medium [&>label]:uppercase"
                  label={t('City')}
                  options={cityOptions}
                  searchLabel={t('Search city')}
                  value={filters.city}
                  onChange={(city) =>
                    onChange({
                      ...filters,
                      city,
                    })
                  }
                />
                <label className="flex items-center gap-3 rounded-2xl border p-3 sm:col-span-2">
                  <input
                    checked={filters.boostedOnly}
                    className="size-4 accent-[var(--primary)]"
                    type="checkbox"
                    onChange={(event) =>
                      onChange({
                        ...filters,
                        boostedOnly: event.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-medium">
                    {t('Boosted posts only')}
                  </span>
                </label>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
