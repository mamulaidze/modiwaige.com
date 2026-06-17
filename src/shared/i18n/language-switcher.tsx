import { useEffect, useRef, useState } from 'react';
import { Check, Languages } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
  const { language } = useI18n();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [clickPulseKey, setClickPulseKey] = useState(0);
  const [badgeGlyph, setBadgeGlyph] = useState(languageGlyphs[0]);
  const switcherRef = useRef<HTMLDivElement>(null);
  const glyphTimeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (glyphTimeoutRef.current) {
        window.clearTimeout(glyphTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative" ref={switcherRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Language"
        className="glass-control group text-primary relative flex size-10 items-center justify-center overflow-hidden rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-92"
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
          setIsOpen((current) => !current);
        }}
      >
        <span
          key={clickPulseKey}
          className="bg-primary/15 pointer-events-none absolute inset-1 rounded-full opacity-0 group-active:opacity-100 group-active:animate-ping"
          aria-hidden="true"
        />
        <span className="relative flex size-5 items-center justify-center" aria-hidden="true">
          <Languages className="size-5" strokeWidth={2.2} />
          <span className="bg-background text-primary absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full text-[9px] font-black leading-none">
            <span key={clickPulseKey} className="language-glyph-swap">
              {badgeGlyph}
            </span>
          </span>
        </span>
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
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="border-border/70 bg-background/70 text-muted-foreground flex h-6 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black leading-none">
                    {option.value.toUpperCase()}
                  </span>
                  <span className="truncate">{option.label}</span>
                </span>
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
