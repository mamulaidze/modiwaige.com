import { AlertTriangle } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  children?: ReactNode;
  icon?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  cancelLabel,
  children,
  confirmLabel,
  danger = false,
  description,
  isLoading = false,
  icon,
  loadingLabel,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = 'confirm-dialog-title';
  const descriptionId = 'confirm-dialog-description';

  useDialogFocusTrap(dialogRef, {
    initialFocusRef: cancelButtonRef,
    onEscape: isLoading ? undefined : onCancel,
  });

  return (
    <div
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-backdrop)] p-4 backdrop-blur-sm"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        className="glass-surface max-h-[calc(100svh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl p-5"
        ref={dialogRef}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-md',
              danger
                ? 'danger-soft text-destructive'
                : 'bg-primary/10 text-primary',
            )}
          >
            {icon ?? <AlertTriangle className="size-5" aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight" id={titleId}>
              {title}
            </h2>
            <p
              className="text-muted-foreground mt-2 text-sm leading-6"
              id={descriptionId}
            >
              {description}
            </p>
          </div>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button
            className="h-auto min-h-12 py-3 leading-5 whitespace-normal"
            disabled={isLoading}
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {cancelLabel ?? t('Cancel')}
          </Button>
          <Button
            className={cn(
              'h-auto min-h-12 py-3 text-center leading-5 whitespace-normal',
              danger &&
                'bg-destructive text-primary-foreground hover:bg-destructive/90 shadow-none hover:shadow-none',
            )}
            disabled={isLoading}
            type="button"
            onClick={onConfirm}
          >
            {isLoading ? (loadingLabel ?? t('Saving...')) : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
