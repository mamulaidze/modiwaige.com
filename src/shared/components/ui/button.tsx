import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_10px_24px_hsl(154_54%_30%/0.22)] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_14px_30px_hsl(154_54%_30%/0.28)] active:translate-y-0',
        outline:
          'glass-surface hover:-translate-y-0.5 hover:bg-white/80 hover:text-accent-foreground active:translate-y-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  asChild = false,
  className,
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp className={cn(buttonVariants({ variant, className }))} {...props} />
  );
}
