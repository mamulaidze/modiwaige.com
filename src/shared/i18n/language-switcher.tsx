import { useEffect, useRef, useState } from 'react';
import { Check, Languages } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { switchLanguagePath, useI18n, type Language } from './i18n';

const languageOptions: Array<{
  label: string;
  value: Language;
}> = [
  { label: 'ქართული', value: 'ge' },
  { label: 'English', value: 'en' },
  { label: 'Русский', value: 'ru' },
];

const languageGlyphs = ['\u6587', '\u10D0', 'A', '\u042F'];

export function LanguageSwitcher() {
  const { language, t } = useI18n();
  const location = useLocation();
  const [clickPulseKey, setClickPulseKey] = useState(0);
  const [badgeGlyph, setBadgeGlyph] = useState(languageGlyphs[0]);
  const glyphTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (glyphTimeoutRef.current) {
        window.clearTimeout(glyphTimeoutRef.current);
      }
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t('Language')}
          className="glass-control group text-primary relative flex size-9 items-center justify-center overflow-hidden rounded-full transition-colors duration-160"
          data-testid="language-switcher"
          type="button"
          onClick={() => {
            setClickPulseKey((current) => {
              const next = current + 1;
              setBadgeGlyph(languageGlyphs[next % languageGlyphs.length]);
              return next;
            });
            if (glyphTimeoutRef.current) {
              window.clearTimeout(glyphTimeoutRef.current);
            }
            glyphTimeoutRef.current = window.setTimeout(() => {
              setBadgeGlyph(languageGlyphs[0]);
            }, 520);
          }}
        >
          <span
            key={clickPulseKey}
            className="bg-primary/15 pointer-events-none absolute inset-1 rounded-full opacity-0 group-active:animate-ping group-active:opacity-100"
            aria-hidden="true"
          />
          <span
            className="relative flex size-5 items-center justify-center"
            aria-hidden="true"
          >
            <Languages className="size-5" strokeWidth={2.2} />
            <span className="bg-background text-primary absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full text-[9px] leading-none font-black">
              <span key={clickPulseKey} className="language-glyph-swap">
                {badgeGlyph}
              </span>
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languageOptions.map((option) => {
          const isActive = option.value === language;

          return (
            <DropdownMenuItem asChild key={option.value}>
              <Link
                className={`flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-[var(--theme-glass-hover)]'
                }`}
                to={switchLanguagePath(location.pathname, option.value)}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="border-border/70 bg-background/70 text-muted-foreground flex h-6 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] leading-none font-black">
                    {option.value.toUpperCase()}
                  </span>
                  <span className="truncate">{option.label}</span>
                </span>
                {isActive ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : null}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
