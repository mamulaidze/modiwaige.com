/* eslint-disable react-refresh/only-export-components */
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

export function Avatar({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'bg-muted relative flex size-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  );
}

export const AvatarImage = AvatarPrimitive.Image;

export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'text-muted-foreground flex size-full items-center justify-center text-sm font-semibold',
        className,
      )}
      {...props}
    />
  );
}
