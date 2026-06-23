import { Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/shared/i18n/i18n';

export function BoostActiveCountdown({ expiresAt }: { expiresAt: string }) {
  const { t } = useI18n();
  const expiresAtMs = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

  if (remainingSeconds === 0) {
    return <span>{t('VIP placement expired')}</span>;
  }

  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
      <span>{t('VIP active')}</span>
      <span className="inline-flex items-center gap-1 text-[11px] font-bold opacity-80">
        <Clock3 className="size-3" aria-hidden="true" />
        {days > 0 ? `${days}${t('d')} ` : ''}
        {hours}
        {t('h')} {minutes}
        {t('m')} {seconds}
        {t('s')}
      </span>
    </span>
  );
}
