import {
  Check,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

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
  const { language, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const cityPickerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const allCitiesLabel = language === 'ge' ? 'ყველა ქალაქი' : 'All cities';
  const selectedCityLabel =
    filters.city === 'all' ? allCitiesLabel : t(filters.city);
  const activeFilterCount = [
    filters.search.trim(),
    filters.category !== 'all',
    filters.city !== 'all',
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;
  const isCollapsed = isScrolled && !isOpen;
  const filteredCities = useMemo(() => {
    const normalizedSearch = citySearch.trim().toLocaleLowerCase();

    if (!normalizedSearch) {
      return cityOptions;
    }

    return cityOptions.filter((option) =>
      `${option.value} ${t(option.label)}`
        .toLocaleLowerCase()
        .includes(normalizedSearch),
    );
  }, [citySearch, t]);

  useEffect(() => {
    function updateScrolledState() {
      setIsScrolled(window.scrollY > 220);
    }

    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });

    return () => window.removeEventListener('scroll', updateScrolledState);
  }, []);

  useEffect(() => {
    if (!isCityPickerOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !cityPickerRef.current?.contains(event.target)
      ) {
        setIsCityPickerOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isCityPickerOpen]);

  function clearFilters() {
    onChange({
      ...filters,
      search: '',
      category: 'all',
      city: 'all',
    });
    setCitySearch('');
    setIsCityPickerOpen(false);
  }

  return (
    <section
      className={`sticky top-20 z-20 transition-all duration-500 ease-out sm:top-24 ${
        isCollapsed
          ? 'ml-auto w-fit'
          : cn(
              'filter-card-enter glass-surface rounded-3xl',
              isCityPickerOpen ? 'overflow-visible' : 'overflow-hidden',
            )
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

                <div className="space-y-2" ref={cityPickerRef}>
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    {t('City')}
                  </span>
                  <div className="relative">
                    <button
                      aria-controls={`${panelId}-city-list`}
                      aria-expanded={isCityPickerOpen}
                      aria-label={t('Search by city')}
                      className="modern-input flex h-11 w-full items-center justify-between gap-3 rounded-2xl px-3 text-left text-base outline-none"
                      type="button"
                      onClick={() =>
                        setIsCityPickerOpen((current) => !current)
                      }
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <MapPin
                          className="text-muted-foreground size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{selectedCityLabel}</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          'text-muted-foreground size-4 shrink-0 transition-transform',
                          isCityPickerOpen && 'rotate-180',
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {isCityPickerOpen ? (
                      <div className="city-picker-popover filter-panel-enter absolute top-13 right-0 left-0 z-30 overflow-hidden rounded-3xl p-2 shadow-[0_22px_58px_var(--theme-surface-shadow)]">
                        <div className="relative">
                          <Search
                            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            aria-hidden="true"
                          />
                          <input
                            autoFocus
                            aria-label={t('Search city')}
                            className="modern-input h-11 w-full rounded-2xl pr-3 pl-9 text-base outline-none"
                            placeholder={t('Search city')}
                            type="search"
                            value={citySearch}
                            onChange={(event) =>
                              setCitySearch(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Escape') {
                                setIsCityPickerOpen(false);
                              }
                            }}
                          />
                        </div>

                        <div
                          className="mt-2 max-h-72 overflow-y-auto pr-1"
                          id={`${panelId}-city-list`}
                        >
                          {filteredCities.length > 0 ? (
                            filteredCities.map((option) => {
                              const isSelected = filters.city === option.value;

                              return (
                                <button
                                  className={cn(
                                    'flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                                    isSelected
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-foreground hover:bg-[var(--theme-glass-hover)]',
                                  )}
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    onChange({
                                      ...filters,
                                      city: option.value,
                                    });
                                    setCitySearch('');
                                    setIsCityPickerOpen(false);
                                  }}
                                >
                                  <span className="min-w-0 truncate">
                                    {option.value === 'all'
                                      ? allCitiesLabel
                                      : t(option.label)}
                                  </span>
                                  {isSelected ? (
                                    <Check
                                      className="size-4 shrink-0"
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-muted-foreground px-3 py-4 text-sm">
                              {t('No matching city')}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
