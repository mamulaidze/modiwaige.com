import { cn } from '@/shared/lib/cn';

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={cn('block object-contain', className)}
      src="/brand-logo.svg"
    />
  );
}
