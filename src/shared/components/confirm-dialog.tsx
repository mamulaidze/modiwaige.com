import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';
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
  onCancel: () => void;
  onConfirm: () => void;
};

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function ConfirmDialog({
  cancelLabel,
  children,
  confirmLabel,
  danger = false,
  description,
  isLoading = false,
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

  useEffect(() => {
    const previousActiveElement = document.activeElement;
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!isLoading) {
          onCancel();
        }
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [isLoading, onCancel]);

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
            <AlertTriangle className="size-5" aria-hidden="true" />
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

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
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
