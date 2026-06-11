import { useEffect, useRef, useState } from 'react';
import { Check, Globe2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { switchLanguagePath, useI18n, type Language } from './i18n';

const languageOptions: Array<{
  label: string;
  value: Language;
}> = [
  { label: 'ქართული', value: 'ge' },
  { label: 'English', value: 'en' },
];

export function LanguageSwitcher() {
  const { language } = useI18n();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown);
    }

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={switcherRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Language"
        className="glass-control group text-primary flex size-10 items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Globe2 className="size-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="glass-surface absolute top-12 right-0 z-50 w-40 overflow-hidden rounded-3xl p-1.5"
          role="menu"
        >
          {languageOptions.map((option) => {
            const isActive = option.value === language;

            return (
              <Link
                className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-[var(--theme-glass-hover)]'
                }`}
                key={option.value}
                role="menuitem"
                to={switchLanguagePath(location.pathname, option.value)}
                onClick={() => setIsOpen(false)}
              >
                <span>{option.label}</span>
                {isActive ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
