import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_10px_24px_var(--theme-primary-shadow)] hover:-translate-y-0.5 hover:bg-[var(--theme-primary-hover)] hover:shadow-[0_14px_30px_var(--theme-primary-shadow)] active:translate-y-0 active:bg-[var(--theme-primary-active)]',
        outline:
          'glass-surface hover:-translate-y-0.5 hover:bg-[var(--theme-glass-hover)] hover:text-accent-foreground active:translate-y-0',
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
