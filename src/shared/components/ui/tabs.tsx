/* eslint-disable react-refresh/only-export-components */
import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'border-border bg-card grid gap-1 rounded-xl border p-1',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-primary focus-visible:ring-ring rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus-visible:ring-2',
        className,
      )}
      {...props}
    />
  );
}
