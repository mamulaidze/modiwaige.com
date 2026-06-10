import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/i18n';

import type { FeedStatus } from '../types/feed';

const statusLabels: Record<FeedStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  given: 'Given',
};

const statusStyles: Record<FeedStatus, string> = {
  available:
    'bg-primary/10 text-primary shadow-[0_0_20px_hsl(154_54%_34%/0.16)] ring-1 ring-primary/15',
  reserved: 'bg-white/70 text-accent-foreground ring-1 ring-border',
  given: 'bg-muted/80 text-muted-foreground ring-1 ring-border',
};

type StatusBadgeProps = {
  status: FeedStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useI18n();

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur',
        statusStyles[status],
      )}
    >
      {t(statusLabels[status])}
    </span>
  );
}
