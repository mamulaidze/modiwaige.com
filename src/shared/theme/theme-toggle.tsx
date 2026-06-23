import { Moon, Sun } from 'lucide-react';

import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';
import { useTheme } from './theme-context';

type ThemeToggleProps = {
  className?: string;
  variant?: 'icon' | 'segmented';
};

export function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === 'dark';
  const label = isDark ? t('Switch to light mode') : t('Switch to dark mode');

  if (variant === 'segmented') {
    return (
      <button
        aria-label={label}
        aria-pressed={isDark}
        className={cn(
          'glass-control relative grid h-9 w-[78px] shrink-0 grid-cols-2 overflow-hidden rounded-full p-1 transition-colors duration-160',
          className,
        )}
        type="button"
        onClick={toggleTheme}
      >
        <span
          className={cn(
            'bg-primary absolute top-1 bottom-1 left-1 w-[31px] rounded-full transition-transform duration-160 ease-out',
            isDark && 'translate-x-[38px]',
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'relative z-10 flex items-center justify-center rounded-full transition-colors duration-200',
            isDark ? 'text-muted-foreground' : 'text-primary-foreground',
          )}
        >
          <Sun className="size-4" aria-hidden="true" />
        </span>
        <span
          className={cn(
            'relative z-10 flex items-center justify-center rounded-full transition-colors duration-200',
            isDark ? 'text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          <Moon className="size-4" aria-hidden="true" />
        </span>
      </button>
    );
  }

  return (
    <button
      aria-label={label}
      aria-pressed={isDark}
      className={cn(
        'glass-control text-primary relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-160',
        className,
      )}
      type="button"
      onClick={toggleTheme}
    >
      <Sun
        className={cn(
          'absolute size-4 transition-all duration-200',
          isDark
            ? 'scale-0 rotate-90 opacity-0'
            : 'scale-100 rotate-0 opacity-100',
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          'absolute size-4 transition-all duration-200',
          isDark
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 -rotate-90 opacity-0',
        )}
        aria-hidden="true"
      />
    </button>
  );
}
