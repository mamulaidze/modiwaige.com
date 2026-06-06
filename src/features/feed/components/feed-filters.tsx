import { Search } from 'lucide-react';

import {
  categoryOptions,
  cityOptions,
  statusOptions,
} from '../constants/feed-filters';
import type { FeedFilters as FeedFiltersValue } from '../types/feed';

type FeedFiltersProps = {
  filters: FeedFiltersValue;
  onChange: (filters: FeedFiltersValue) => void;
};

export function FeedFilters({ filters, onChange }: FeedFiltersProps) {
  const selectedCity = filters.city === 'all' ? '' : filters.city;

  return (
    <section
      className="bg-card rounded-lg border p-4 shadow-sm"
      aria-label="Feed filters"
    >
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          aria-label="Search free items"
          className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border pr-3 pl-9 text-base outline-none focus-visible:ring-2"
          placeholder="Search free items"
          type="search"
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium">Category</span>
          <select
            className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
            value={filters.category}
            onChange={(event) =>
              onChange({
                ...filters,
                category: event.target.value as FeedFiltersValue['category'],
              })
            }
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">City</span>
          <input
            aria-label="Search by city"
            className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
            list="feed-city-options"
            placeholder="Search city"
            type="search"
            value={selectedCity}
            onChange={(event) =>
              onChange({
                ...filters,
                city: event.target.value.trim() || 'all',
              })
            }
          />
          <datalist id="feed-city-options">
            {cityOptions.slice(1).map((option) => (
              <option key={option.value} value={option.value} />
            ))}
          </datalist>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select
            className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as FeedFiltersValue['status'],
              })
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
