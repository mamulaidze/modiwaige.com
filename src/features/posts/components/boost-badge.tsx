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
      <span className="inline-flex items-center overflow-hidden rounded-xl border border-white/70 bg-white/95 text-xs font-extrabold text-slate-950 shadow-[0_10px_28px_hsl(24_80%_18%/.28)] backdrop-blur-md">
        <span className="flex items-center self-stretch bg-orange-500 px-2.5 text-white">
          <Rocket className="size-4" aria-hidden="true" />
        </span>
        <span className="px-3 py-2">{t('Boosted')}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-orange-300/70 bg-orange-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-[0_6px_18px_hsl(24_90%_35%/.25)]">
      <Rocket className="size-3.5 fill-current" aria-hidden="true" />
      {t('Boosted')}
    </span>
  );
}
