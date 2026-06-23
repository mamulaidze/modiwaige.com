import { Rocket } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

import type { PostBoostPlan } from '../api/post-boost-api';

const plans: Array<{
  duration: string;
  plan: PostBoostPlan;
  price: string;
}> = [
  { duration: '24 hours', plan: 'day', price: '₾2' },
  { duration: '3 days', plan: 'three_days', price: '₾5' },
  { duration: '7 days', plan: 'week', price: '₾10' },
];

type BoostPostDialogProps = {
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: (plan: PostBoostPlan) => void;
};

export function BoostPostDialog({
  isLoading,
  onCancel,
  onConfirm,
}: BoostPostDialogProps) {
  const { t } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<PostBoostPlan>('three_days');

  return (
    <ConfirmDialog
      confirmLabel={t('Activate demo boost')}
      description={t(
        'Boosted posts appear before regular posts until the boost expires.',
      )}
      isLoading={isLoading}
      icon={<Rocket className="size-5" aria-hidden="true" />}
      loadingLabel={t('Activating boost...')}
      title={t('Boost post')}
      onCancel={onCancel}
      onConfirm={() => onConfirm(selectedPlan)}
    >
      <div className="space-y-3">
        <div className="rounded-[10px] border border-amber-600/20 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
          <div className="flex items-start gap-2 leading-5 font-semibold">
            <Rocket className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{t('Demo only — no payment will be charged.')}</span>
          </div>
        </div>

        <div className="grid gap-2">
          {plans.map((option) => {
            const isSelected = selectedPlan === option.plan;

            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  'flex items-center justify-between rounded-[10px] border p-3 text-left transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted/60',
                )}
                disabled={isLoading}
                key={option.plan}
                type="button"
                onClick={() => setSelectedPlan(option.plan)}
              >
                <span className="font-medium">{t(option.duration)}</span>
                <span className="font-bold">{option.price}</span>
              </button>
            );
          })}
        </div>
      </div>
    </ConfirmDialog>
  );
}
