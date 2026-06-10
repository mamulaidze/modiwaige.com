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
        className="group text-primary flex size-10 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-[0_8px_22px_hsl(170_20%_16%/0.09),inset_0_1px_0_hsl(0_0%_100%/0.75)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 active:translate-y-0"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Globe2 className="size-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="absolute top-12 right-0 z-50 w-40 overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-1.5 shadow-[0_18px_48px_hsl(170_24%_16%/0.16),inset_0_1px_0_hsl(0_0%_100%/0.78)] backdrop-blur-2xl"
          role="menu"
        >
          {languageOptions.map((option) => {
            const isActive = option.value === language;

            return (
              <Link
                className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-white/70'
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
