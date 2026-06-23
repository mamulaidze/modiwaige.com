/* eslint-disable react-refresh/only-export-components */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  children,
  className,
  closeLabel = 'Close',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { closeLabel?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="data-[state=closed]:animate-out data-[state=open]:animate-in fixed inset-0 z-50 bg-[var(--theme-backdrop)] backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'border-border bg-card fixed top-1/2 left-1/2 z-50 max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] border p-5 shadow-[0_18px_54px_var(--theme-surface-shadow)] outline-none',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="focus-visible:ring-ring absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl outline-none hover:bg-[var(--theme-glass-hover)] focus-visible:ring-2">
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogHeader = (props: ComponentProps<'div'>) => (
  <div className={cn('space-y-2', props.className)} {...props} />
);
export const DialogFooter = (props: ComponentProps<'div'>) => (
  <div
    className={cn(
      'mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      props.className,
    )}
    {...props}
  />
);
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
