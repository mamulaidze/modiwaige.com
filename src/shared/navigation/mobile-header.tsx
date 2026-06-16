import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { BrandLogo } from '@/shared/components/brand-logo';
import { Button } from '@/shared/components/ui/button';
import { LanguageSwitcher } from '@/shared/i18n/language-switcher';
import { useI18n } from '@/shared/i18n/i18n';
import { ThemeToggle } from '@/shared/theme/theme-toggle';

type MobileHeaderProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function MobileHeader({ isLoggingOut, onLogout }: MobileHeaderProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { localizedPath, t } = useI18n();

  return (
    <div className="glass-surface mx-auto flex min-h-15 w-full max-w-5xl items-center justify-between gap-2 rounded-[22px] px-3 py-2 md:hidden">
      <Link
        className="group focus-visible:ring-ring flex min-w-0 items-center gap-2.5 rounded-[18px] transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.99]"
        to={localizedPath('/')}
      >
        <div className="brand-mark flex size-10 shrink-0 items-center justify-center rounded-[17px] ring-1 ring-[var(--theme-glass-border)] transition-transform duration-200 group-hover:scale-[1.03]">
          <BrandLogo className="size-7" />
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
        <ThemeToggle />
        <LanguageSwitcher />
        {!isLoading && isAuthenticated ? (
          <Button
            aria-label={t('Log out')}
            className="glass-control text-foreground size-10 rounded-full px-0"
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
