import { NavLink } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';
import { navigationItems } from './navigation-items';

export function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const adminStatus = useAdminStatus();
  const { localizedPath, t } = useI18n();
  void adminStatus;
  const mobileItems = navigationItems
    .filter((item) => {
      if (item.guestOnly || item.adminOnly) {
        return false;
      }

      return ['Home', 'Search', 'Post', 'Reservations', 'Profile'].includes(
        item.labelKey,
      );
    })
    .map((item) => {
      if (!isAuthenticated && item.requiresAuth) {
        return { ...item, href: '/login' };
      }

      return item;
    });

  /*
   * Desktop uses capability-based filtering. Mobile intentionally keeps the
   * five marketplace destinations stable and sends guests to login for
   * authenticated destinations.
   */
  const visibleItems = navigationItems.filter((item) => {
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
  });

  void visibleItems;

  return (
    <nav
      aria-label={t('Mobile navigation')}
      className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden"
    >
      <div className="bg-background/95 border-border mx-auto grid max-w-md grid-cols-5 gap-1 overflow-visible rounded-2xl border px-1.5 pt-2 pb-1.5 shadow-lg backdrop-blur">
        {mobileItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'text-muted-foreground flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] leading-none font-medium transition-colors',
                item.labelKey === 'Post' &&
                  'bg-primary text-primary-foreground -mt-4 min-h-[60px] gap-1.5 rounded-2xl px-2 pt-2 pb-1 text-[10px] leading-tight shadow-md',
                isActive &&
                  item.labelKey !== 'Post' &&
                  'bg-accent text-primary',
              )
            }
            key={item.labelKey}
            to={localizedPath(item.href)}
          >
            <item.icon
              className={cn(
                'size-[18px] shrink-0',
                item.labelKey === 'Post' && 'size-5',
              )}
              aria-hidden="true"
            />
            <span className="block max-w-full truncate text-center">
              {t(item.labelKey)}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
