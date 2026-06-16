import { Check, ChevronDown, MapPin, Search, X } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

export type CityPickerOption = {
  label: string;
  value: string;
};

type CityPickerProps = {
  value: string;
  options: readonly CityPickerOption[];
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchLabel?: string;
  noResultsLabel?: string;
  clearLabel?: string;
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
  error?: boolean;
};

export function CityPicker({
  allowClear = false,
  className,
  clearLabel,
  disabled = false,
  error = false,
  label,
  noResultsLabel,
  onChange,
  options,
  placeholder,
  searchLabel,
  value,
}: CityPickerProps) {
  const { t } = useI18n();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel = selectedOption ? t(selectedOption.label) : placeholder;
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredOptions = useMemo(() => {
    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      `${option.value} ${t(option.label)}`
        .toLocaleLowerCase()
        .includes(normalizedSearch),
    );
  }, [normalizedSearch, options, t]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        closePicker();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selectedIndex = filteredOptions.findIndex(
      (option) => option.value === value,
    );
    setActiveIndex(Math.max(0, selectedIndex));
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [filteredOptions, isOpen, value]);

  useEffect(() => {
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function closePicker() {
    setIsOpen(false);
    setSearch('');
    setActiveIndex(0);
  }

  function selectOption(nextValue: string) {
    onChange(nextValue);
    closePicker();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (
      !isOpen &&
      (event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === ' ')
    ) {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closePicker();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (filteredOptions.length === 0) {
        return;
      }

      setActiveIndex((current) =>
        Math.min(current + 1, filteredOptions.length - 1),
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const activeOption = filteredOptions[activeIndex];

      if (activeOption) {
        selectOption(activeOption.value);
      }
    }
  }

  return (
    <div className={cn('space-y-2', className)} ref={rootRef}>
      {label ? (
        <label
          className="text-sm font-medium"
          htmlFor={`${id}-trigger`}
          id={`${id}-label`}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          aria-controls={`${id}-listbox`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={error || undefined}
          aria-labelledby={label ? `${id}-label ${id}-trigger` : undefined}
          className={cn(
            'modern-input flex h-11 w-full items-center justify-between gap-3 rounded-2xl px-3 text-left text-base outline-none disabled:cursor-not-allowed disabled:opacity-60',
            allowClear && value && 'pr-16',
            error && 'border-destructive focus-visible:ring-destructive',
          )}
          disabled={disabled}
          id={`${id}-trigger`}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          onKeyDown={handleKeyDown}
        >
          <span className="flex min-w-0 items-center gap-2">
            <MapPin
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden="true"
            />
            <span
              className={cn(
                'truncate',
                !selectedOption && 'text-muted-foreground',
              )}
            >
              {selectedLabel}
            </span>
          </span>
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 shrink-0 transition-transform',
              isOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>

        {allowClear && value ? (
          <button
            aria-label={clearLabel ?? t('Clear')}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-8 flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            disabled={disabled}
            type="button"
            onClick={() => {
              onChange('');
              closePicker();
            }}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}

        {isOpen ? (
          <div className="city-picker-popover filter-panel-enter absolute top-13 right-0 left-0 z-30 overflow-hidden rounded-3xl p-2 shadow-[0_22px_58px_var(--theme-surface-shadow)]">
            <div className="relative">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                aria-activedescendant={
                  filteredOptions[activeIndex]
                    ? `${id}-option-${filteredOptions[activeIndex].value}`
                    : undefined
                }
                aria-controls={`${id}-listbox`}
                aria-label={searchLabel ?? t('Search city')}
                autoComplete="off"
                className="modern-input h-11 w-full rounded-2xl pr-3 pl-9 text-base outline-none"
                placeholder={searchLabel ?? t('Search city')}
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div
              className="mt-2 max-h-72 overflow-y-auto pr-1"
              id={`${id}-listbox`}
              role="listbox"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = value === option.value;
                  const isActive = activeIndex === index;

                  return (
                    <button
                      aria-selected={isSelected}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-[var(--theme-glass-hover)]',
                        isActive &&
                          !isSelected &&
                          'bg-[var(--theme-glass-hover)]',
                      )}
                      id={`${id}-option-${option.value}`}
                      key={option.value}
                      ref={(node) => {
                        optionRefs.current[index] = node;
                      }}
                      role="option"
                      type="button"
                      onClick={() => selectOption(option.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span className="min-w-0 truncate">
                        {t(option.label)}
                      </span>
                      {isSelected ? (
                        <Check className="size-4 shrink-0" aria-hidden="true" />
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <p className="text-muted-foreground px-3 py-4 text-sm">
                  {noResultsLabel ?? t('No matching city')}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
