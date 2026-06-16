import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/i18n';

import type { ReservationStatus } from '../types/post-details';

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const statusStyles: Record<ReservationStatus, string> = {
  pending: 'bg-accent/75 text-accent-foreground ring-1 ring-border',
  accepted: 'primary-glow bg-primary/10 text-primary ring-1 ring-primary/15',
  declined: 'bg-destructive/10 text-destructive ring-1 ring-destructive/20',
  cancelled: 'bg-muted/80 text-muted-foreground ring-1 ring-border',
  completed: 'bg-muted/80 text-muted-foreground ring-1 ring-border',
};

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationStatus;
}) {
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
