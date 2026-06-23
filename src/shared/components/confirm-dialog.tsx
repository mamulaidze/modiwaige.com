import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
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

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent>
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
            <AlertDialogTitle className="text-xl font-semibold tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground mt-2 text-sm leading-6">
              {description}
            </AlertDialogDescription>
          </div>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <AlertDialogCancel asChild>
            <Button
              className="h-auto min-h-12 py-3 leading-5 whitespace-normal"
              disabled={isLoading}
              type="button"
              variant="outline"
            >
              {cancelLabel ?? t('Cancel')}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
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
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
