import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { BrandLogo } from '@/shared/components/brand-logo';
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
  void isLoggingOut;
  void onLogout;

  return (
    <div className="bg-background/90 border-border/70 mx-auto flex min-h-14 w-full max-w-5xl items-center justify-between gap-2 rounded-2xl border px-3 py-2 shadow-sm backdrop-blur md:hidden">
      <Link
        className="group focus-visible:ring-ring flex min-w-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2"
        to={localizedPath('/')}
      >
        <div className="brand-mark flex size-9 shrink-0 items-center justify-center rounded-[10px]">
          <BrandLogo className="size-6" />
        </div>
        <div className="min-w-0 max-w-[170px]">
          <p className="text-foreground truncate text-base leading-none font-semibold tracking-tight">
            Gaachuqe
          </p>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs leading-4">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
        {!isLoading && isAuthenticated ? (
          <Link
            aria-label={t('Profile')}
            className="border-border bg-card text-muted-foreground flex size-9 items-center justify-center rounded-full border"
            to={localizedPath('/profile')}
          >
            <User className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
