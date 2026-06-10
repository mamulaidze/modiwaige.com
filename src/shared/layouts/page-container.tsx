import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type PageContainerProps = HTMLAttributes<HTMLElement>;

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <main
      id={props.id ?? 'main-content'}
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-8 pb-20 sm:px-6 md:pt-10 md:pb-8 lg:px-8',
        className,
      )}
      {...props}
    />
  );
}
