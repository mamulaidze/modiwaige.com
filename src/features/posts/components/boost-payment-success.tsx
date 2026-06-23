import { Check, Rocket, Sparkles, X } from 'lucide-react';
import { useEffect, type CSSProperties } from 'react';

import { Button } from '@/shared/components/ui/button';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';

type BoostPaymentSuccessProps = {
  expiresAt: string;
  onComplete: () => void;
};

export function BoostPaymentSuccess({
  expiresAt,
  onComplete,
}: BoostPaymentSuccessProps) {
  const { language, t } = useI18n();

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2200);

    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      aria-label={t('Demo payment completed')}
      aria-live="assertive"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[var(--theme-backdrop-strong)] p-4 backdrop-blur-md"
      role="dialog"
    >
      <div className="boost-success-card border-border bg-card relative w-full max-w-sm overflow-hidden rounded-[18px] border p-6 text-center shadow-[0_18px_54px_var(--theme-surface-shadow)] sm:p-8">
        <div className="boost-success-glow" aria-hidden="true" />
        <div className="boost-confetti" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              style={
                {
                  '--angle': `${index * 20}deg`,
                  '--delay': `${index * 24}ms`,
                  '--distance': `${92 + (index % 4) * 14}px`,
                  '--piece': index,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative">
          <div className="boost-success-icon mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="size-12 stroke-[3]" aria-hidden="true" />
          </div>
          <Sparkles
            className="boost-success-spark absolute -top-1 right-[22%] size-7 text-amber-400"
            aria-hidden="true"
          />
          <Rocket
            className="boost-success-rocket text-primary absolute top-12 left-[16%] size-6"
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight">
          {t('Demo payment completed')}
        </h2>
        <p className="text-muted-foreground mt-2 leading-6">
          {t('Your post is now at the top of the feed.')}
        </p>
        <p className="mt-4 rounded-[10px] border bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
          {t('Top placement active until')}{' '}
          {formatDateTime(expiresAt, language)}
        </p>
      </div>
    </div>
  );
}

type BoostSuccessAlertProps = {
  expiresAt: string;
  onDismiss: () => void;
};

export function BoostSuccessAlert({
  expiresAt,
  onDismiss,
}: BoostSuccessAlertProps) {
  const { language, t } = useI18n();

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 7000);

    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="boost-success-alert fixed top-20 right-3 left-3 z-50 mx-auto max-w-md rounded-[14px] border border-emerald-400/30 bg-emerald-950 p-4 text-white shadow-[0_14px_36px_var(--theme-surface-shadow)] sm:top-24 sm:right-5 sm:left-auto sm:mx-0 sm:w-full"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-emerald-400 text-emerald-950">
          <Rocket className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{t('Your post is in the top section')}</p>
          <p className="mt-1 text-sm leading-5 text-white/72">
            {t('Active until')} {formatDateTime(expiresAt, language)}
          </p>
        </div>
        <Button
          aria-label={t('Close')}
          className="size-9 shrink-0 rounded-xl border-white/15 bg-white/10 p-0 text-white shadow-none hover:bg-white/20 hover:shadow-none"
          type="button"
          onClick={onDismiss}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function formatDateTime(value: string, language: string) {
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
