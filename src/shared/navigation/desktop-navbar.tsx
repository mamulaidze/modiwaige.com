import { Link, NavLink, useLocation } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { BrandLogo } from '@/shared/components/brand-logo';
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
    <div className="glass-surface mx-auto hidden min-h-14 w-full max-w-[1280px] items-center justify-between gap-4 rounded-2xl px-4 py-2 md:flex lg:px-5">
      <Link
        className="group focus-visible:ring-ring flex min-w-0 items-center gap-2.5 rounded-xl transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.99]"
        to={localizedPath('/')}
      >
        <div className="brand-mark flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-[var(--theme-glass-border)] transition-transform duration-200 group-hover:scale-[1.03]">
          <BrandLogo className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-base leading-none font-semibold tracking-tight">
            Gaachuqe
          </p>
          <p className="text-muted-foreground mt-0.5 max-w-64 truncate text-xs">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>

      <nav
        aria-label={t('Primary navigation')}
        className="flex min-w-0 items-center gap-1.5"
      >
        {visibleItems.map((item) => (
          <Button
            asChild
            className="h-9 rounded-lg px-3"
            key={item.href}
            variant="outline"
          >
            <NavLink
              className={({ isActive }) =>
                cn(
                  'rounded-lg transition-transform duration-200 active:scale-[0.98]',
                  isActive && 'primary-glow bg-primary/10 text-primary',
                )
              }
              to={localizedPath(item.href)}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {t(item.labelKey)}
            </NavLink>
          </Button>
        ))}
        {!isLoading && isAuthenticated ? (
          <Button
            className="h-9 rounded-lg px-3"
            disabled={isLoggingOut}
            type="button"
            onClick={onLogout}
          >
            {isLoggingOut ? t('Logging out...') : t('Log out')}
          </Button>
        ) : null}
        <NotificationBell />
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
