import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/i18n';

import type { FeedStatus } from '../types/feed';

const statusLabels: Record<FeedStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  given: 'Given',
};

const statusStyles: Record<FeedStatus, string> = {
  available: 'border-primary/15 bg-white/95 text-primary',
  reserved: 'border-border bg-white/95 text-foreground',
  given: 'border-border bg-white/95 text-muted-foreground',
};

type StatusBadgeProps = {
  status: FeedStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useI18n();

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        statusStyles[status],
      )}
    >
      {t(statusLabels[status])}
    </span>
  );
}
