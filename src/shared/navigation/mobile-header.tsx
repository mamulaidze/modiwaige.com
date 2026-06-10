import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

import { LanguageSwitcher } from '@/shared/i18n/language-switcher';
import { useI18n } from '@/shared/i18n/i18n';

export function MobileHeader() {
  const { localizedPath, t } = useI18n();

  return (
    <div className="mx-auto flex min-h-18 w-full max-w-5xl items-center justify-between gap-3 rounded-[24px] border border-white/65 bg-white/68 px-4 py-3 shadow-[0_18px_50px_hsl(170_28%_16%/0.12),inset_0_1px_0_hsl(0_0%_100%/0.78)] backdrop-blur-2xl md:hidden">
      <Link
        className="group focus-visible:ring-ring flex min-w-0 items-center gap-3 rounded-[20px] transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.99]"
        to={localizedPath('/')}
      >
        <div className="text-primary-foreground via-primary flex size-12 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-emerald-700 to-emerald-400 shadow-[0_16px_34px_hsl(154_54%_30%/0.3)] ring-1 ring-white/35 transition-transform duration-200 group-hover:scale-[1.03]">
          <Gift className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-lg leading-none font-semibold tracking-tight">
            Gaachuqe
          </p>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-4">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>
      <LanguageSwitcher />
    </div>
  );
}
