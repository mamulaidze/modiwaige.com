import { Gift } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { useUnreadReservationNotifications } from '@/features/notifications/hooks/use-unread-reservation-notifications';
import { Button } from '@/shared/components/ui/button';
import { LanguageSwitcher } from '@/shared/i18n/language-switcher';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';
import { ThemeToggle } from '@/shared/theme/theme-toggle';
import { navigationItems } from './navigation-items';

type DesktopNavbarProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function DesktopNavbar({ isLoggingOut, onLogout }: DesktopNavbarProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const adminStatus = useAdminStatus();
  const unreadReservations = useUnreadReservationNotifications();
  const location = useLocation();
  const { localizedPath, t } = useI18n();
  const currentPath = normalizePath(location.pathname);
  const visibleItems = navigationItems
    .filter((item) => {
      if (item.adminOnly) {
        return isAuthenticated && Boolean(adminStatus.data);
      }

      if (item.requiresAuth) {
        return isAuthenticated;
      }

      if (item.guestOnly) {
        return !isAuthenticated;
      }

      return true;
    })
    .filter(
      (item) => !isCurrentDesktopItem(item.href, currentPath, localizedPath),
    );

  return (
    <div className="glass-surface mx-auto hidden min-h-18 w-full max-w-5xl items-center justify-between gap-6 rounded-[24px] px-5 py-3 md:flex lg:px-6">
      <Link
        className="group focus-visible:ring-ring flex min-w-0 items-center gap-3 rounded-[20px] transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.99]"
        to={localizedPath('/')}
      >
        <div className="brand-mark text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-[20px] ring-1 ring-[var(--theme-glass-border)] transition-transform duration-200 group-hover:scale-[1.03]">
          <Gift className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-lg leading-none font-semibold tracking-tight">
            Gaachuqe
          </p>
          <p className="text-muted-foreground mt-1 max-w-56 truncate text-xs">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>

      <nav
        aria-label={t('Primary navigation')}
        className="flex min-w-0 items-center gap-1.5"
      >
        {visibleItems.map((item) => (
          <Button asChild key={item.href} variant="outline">
            <NavLink
              className={({ isActive }) =>
                cn(
                  'rounded-xl transition-transform duration-200 active:scale-[0.98]',
                  isActive && 'primary-glow bg-primary/10 text-primary',
                )
              }
              to={localizedPath(item.href)}
            >
              <span className="relative">
                <item.icon className="size-4" aria-hidden="true" />
                {item.href === '/profile' &&
                Number(unreadReservations.data ?? 0) > 0 ? (
                  <span
                    aria-label={t('New reservation activity')}
                    className="bg-destructive absolute -top-1 -right-1 size-2 rounded-full"
                  />
                ) : null}
              </span>
              {t(item.labelKey)}
            </NavLink>
          </Button>
        ))}
        {!isLoading && isAuthenticated ? (
          <Button disabled={isLoggingOut} type="button" onClick={onLogout}>
            {isLoggingOut ? t('Logging out...') : t('Log out')}
          </Button>
        ) : null}
        <ThemeToggle variant="segmented" />
        <LanguageSwitcher />
      </nav>
    </div>
  );
}

function normalizePath(path: string) {
  if (path.length <= 1) {
    return path;
  }

  return path.replace(/\/+$/, '');
}

function isCurrentDesktopItem(
  href: string,
  currentPath: string,
  localizedPath: (path: string) => string,
) {
  const targetPath = normalizePath(localizedPath(href));

  if (href === '/') {
    return (
      currentPath === targetPath ||
      currentPath === normalizePath(localizedPath('/homepage'))
    );
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}
