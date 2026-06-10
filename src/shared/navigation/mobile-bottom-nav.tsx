import { NavLink } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { useUnreadReservationNotifications } from '@/features/notifications/hooks/use-unread-reservation-notifications';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';
import { navigationItems } from './navigation-items';

export function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const adminStatus = useAdminStatus();
  const unreadReservations = useUnreadReservationNotifications();
  const { localizedPath, t } = useI18n();
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

  const mobileItems = visibleItems.slice(0, 4);

  return (
    <nav
      aria-label={t('Mobile navigation')}
      className="fixed inset-x-0 bottom-0 z-20 px-4 pb-2 md:hidden"
    >
      <div
        className="glass-surface mx-auto grid max-w-md gap-1 rounded-3xl px-2 py-1.5"
        style={{
          gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))`,
        }}
      >
        {mobileItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'text-muted-foreground flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-[11px] leading-none font-medium',
                isActive &&
                  'bg-primary/10 text-primary shadow-[0_0_24px_hsl(154_54%_34%/0.18)]',
              )
            }
            key={item.href}
            to={localizedPath(item.href)}
          >
            <span className="relative">
              <item.icon className="size-[18px]" aria-hidden="true" />
              {item.href === '/profile' &&
              Number(unreadReservations.data ?? 0) > 0 ? (
                <span
                  aria-label={t('New reservation activity')}
                  className="bg-destructive absolute -top-1 -right-1 size-2.5 rounded-full"
                />
              ) : null}
            </span>
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
