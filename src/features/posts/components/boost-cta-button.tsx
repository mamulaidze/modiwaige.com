import type { ButtonHTMLAttributes } from 'react';
import { Rocket } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

import { BoostActiveCountdown } from './boost-active-countdown';

type BoostCtaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  boostExpiresAt?: string | null;
  isBoosted?: boolean;
};

export function BoostCtaButton({
  boostExpiresAt,
  className,
  isBoosted,
  ...props
}: BoostCtaButtonProps) {
  const { t } = useI18n();

  return (
    <Button
      className={cn(
        'boost-cta-button h-10 px-3 font-bold disabled:opacity-80',
        className,
      )}
      type="button"
      {...props}
    >
      <Rocket className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">
        {isBoosted && boostExpiresAt ? (
          <BoostActiveCountdown expiresAt={boostExpiresAt} />
        ) : (
          t('Boost post')
        )}
      </span>
    </Button>
  );
}
