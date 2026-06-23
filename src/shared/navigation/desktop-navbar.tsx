import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronDown,
  Gift,
  Home,
  Laptop,
  Search,
  Shirt,
  User,
} from 'lucide-react';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { BrandLogo } from '@/shared/components/brand-logo';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
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
  const navigate = useNavigate();
  const { localizedPath, t } = useI18n();
  const currentPath = normalizePath(location.pathname);
  const visibleItems = navigationItems.filter((item) => {
    if (
      item.labelKey === 'Search' ||
      item.labelKey === 'Reservations' ||
      item.href === '/create'
    ) {
      return false;
    }

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
    <div className="bg-background/88 border-border/70 mx-auto hidden min-h-16 w-full max-w-[1280px] items-center justify-between gap-3 rounded-2xl border px-4 py-2 shadow-sm backdrop-blur md:flex lg:gap-4 lg:px-5">
      <Link
        className="group focus-visible:ring-ring flex min-w-[150px] max-w-[220px] items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 xl:min-w-[180px]"
        to={localizedPath('/')}
      >
        <div className="brand-mark flex size-9 shrink-0 items-center justify-center rounded-[10px]">
          <BrandLogo className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-base leading-none font-semibold tracking-tight">
            Gaachuqe
          </p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="h-10 shrink-0 px-3 whitespace-nowrap xl:min-w-[132px]"
            variant="outline"
          >
            <span className="hidden xl:inline">{t('Browse')}</span>
            <span className="xl:hidden">{t('All')}</span>
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {browseCategories.map((category) => (
            <DropdownMenuItem
              key={category.label}
              onSelect={() =>
                navigate(
                  `${localizedPath('/homepage')}?category=${encodeURIComponent(category.value)}`,
                )
              }
            >
              <category.icon className="size-4" aria-hidden="true" />
              {t(category.label)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <form
        className="border-border bg-card/70 focus-within:ring-ring/30 hidden h-10 min-w-[150px] max-w-sm flex-1 items-center gap-2 rounded-full border px-3 focus-within:ring-4 lg:flex 2xl:max-w-md"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const query = String(formData.get('q') ?? '').trim();

          navigate(
            query
              ? `${localizedPath('/homepage')}?search=${encodeURIComponent(query)}`
              : localizedPath('/homepage'),
          );
        }}
      >
        <Search className="text-muted-foreground size-4" aria-hidden="true" />
        <input
          className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
          name="q"
          placeholder={t('Search free items near you...')}
          type="search"
        />
        <span className="text-muted-foreground hidden border-l pl-2 text-xs 2xl:inline">
          {t('All Georgia')}
        </span>
      </form>

      <nav
        aria-label={t('Primary navigation')}
        className="flex shrink-0 items-center gap-1"
      >
        {isAuthenticated ? (
          <Button asChild className="h-10 shrink-0 px-3 whitespace-nowrap xl:px-4">
            <NavLink to={localizedPath('/create')}>
              <span className="hidden xl:inline">{t('Post an item')}</span>
              <span className="xl:hidden">{t('Post')}</span>
            </NavLink>
          </Button>
        ) : null}
        {visibleItems.map((item) => {
          const isPrimary =
            !isAuthenticated && item.href === '/register';

          return isPrimary ? (
            <Button asChild className="ml-1 h-9 shrink-0 whitespace-nowrap" key={item.href}>
              <NavLink to={localizedPath(item.href)}>
                <item.icon className="size-4" aria-hidden="true" />
                {t(item.labelKey)}
              </NavLink>
            </Button>
          ) : (
            <NavLink
              className={() =>
                cn(
                  'text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 items-center gap-2 rounded-[10px] px-2 text-sm font-medium whitespace-nowrap transition-colors xl:px-3',
                  isCurrentDesktopItem(item.href, currentPath, localizedPath) &&
                    'bg-accent text-primary',
                )
              }
              key={item.href}
              to={localizedPath(item.href)}
            >
              <item.icon className="size-4" aria-hidden="true" />
              <span className="hidden xl:inline">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
        {!isLoading && isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={t('Profile')}
                className="size-9 rounded-full px-0"
                variant="outline"
              >
                <User className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={localizedPath('/profile')}>{t('Profile')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={localizedPath('/profile?tab=reserved')}>
                  {t('Reservations')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isLoggingOut}
                onSelect={(event) => {
                  event.preventDefault();
                  onLogout();
                }}
              >
                {isLoggingOut ? t('Logging out...') : t('Log out')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <NotificationBell />
        <ThemeToggle />
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

const browseCategories = [
  { icon: Gift, label: 'All', value: 'all' },
  { icon: Home, label: 'HomeCategory', value: 'home' },
  { icon: Shirt, label: 'Clothing', value: 'clothing' },
  { icon: Laptop, label: 'Electronics', value: 'electronics' },
  { icon: BookOpen, label: 'Books', value: 'books' },
];
