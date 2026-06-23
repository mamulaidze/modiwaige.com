import { Rocket } from 'lucide-react';

import { useI18n } from '@/shared/i18n/i18n';

export function BoostBadge() {
  const { t } = useI18n();

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-sm">
      <Rocket className="size-3.5" aria-hidden="true" />
      {t('Boosted')}
    </span>
  );
}
