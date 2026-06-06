import { NavLink } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { useUnreadReservationNotifications } from '@/features/notifications/hooks/use-unread-reservation-notifications';
import { cn } from '@/shared/lib/cn';
import { navigationItems } from './navigation-items';

export function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const adminStatus = useAdminStatus();
  const unreadReservations = useUnreadReservationNotifications();
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

  return (
    <nav
      aria-label="Mobile navigation"
      className="bg-background/95 fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur md:hidden items-center"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2  ">
        {visibleItems.slice(0, 4).map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'text-muted-foreground flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-xs font-medium',
                isActive && 'bg-accent text-accent-foreground',
              )
            }
            key={item.href}
            to={item.href}
          >
            <span className="relative ">
              <item.icon className="size-5" aria-hidden="true" />
              {item.href === '/profile' &&
              Number(unreadReservations.data ?? 0) > 0 ? (
                <span
                  aria-label="New reservation activity"
                  className="bg-destructive absolute -top-1 -right-1 size-2.5 rounded-full"
                />
              ) : null}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
