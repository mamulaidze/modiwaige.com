import { Gift, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { Button } from '@/shared/components/ui/button';
import { LanguageSwitcher } from '@/shared/i18n/language-switcher';
import { useI18n } from '@/shared/i18n/i18n';

type MobileHeaderProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function MobileHeader({ isLoggingOut, onLogout }: MobileHeaderProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { localizedPath, t } = useI18n();

  return (
    <div className="mx-auto flex min-h-15 w-full max-w-5xl items-center justify-between gap-2 rounded-[22px] border border-white/65 bg-white/68 px-3 py-2 shadow-[0_14px_40px_hsl(170_28%_16%/0.11),inset_0_1px_0_hsl(0_0%_100%/0.78)] backdrop-blur-2xl md:hidden">
      <Link
        className="group focus-visible:ring-ring flex min-w-0 items-center gap-2.5 rounded-[18px] transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.99]"
        to={localizedPath('/')}
      >
        <div className="text-primary-foreground via-primary flex size-10 shrink-0 items-center justify-center rounded-[17px] bg-gradient-to-br from-emerald-700 to-emerald-400 shadow-[0_12px_26px_hsl(154_54%_30%/0.26)] ring-1 ring-white/35 transition-transform duration-200 group-hover:scale-[1.03]">
          <Gift className="size-[18px]" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-base leading-none font-semibold tracking-tight">
            Gaachuqe
          </p>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs leading-4">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <LanguageSwitcher />
        {!isLoading && isAuthenticated ? (
          <Button
            aria-label={t('Log out')}
            className="text-foreground size-10 rounded-full border-white/70 bg-white/55 px-0 shadow-[0_8px_22px_hsl(170_20%_16%/0.09),inset_0_1px_0_hsl(0_0%_100%/0.75)] backdrop-blur-xl hover:bg-white/70"
            disabled={isLoggingOut}
            type="button"
            variant="outline"
            onClick={onLogout}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
