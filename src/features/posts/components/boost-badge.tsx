import { Rocket } from 'lucide-react';

import { useI18n } from '@/shared/i18n/i18n';

export function BoostBadge({
  variant = 'inline',
}: {
  variant?: 'inline' | 'overlay';
}) {
  const { t } = useI18n();

  if (variant === 'overlay') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/20 bg-white/95 px-2.5 py-1.5 text-xs font-bold text-amber-700">
        <Rocket className="size-3.5" aria-hidden="true" />
        {t('Boosted')}
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-600/20 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
      <Rocket className="size-3.5" aria-hidden="true" />
      {t('Boosted')}
    </span>
  );
}
