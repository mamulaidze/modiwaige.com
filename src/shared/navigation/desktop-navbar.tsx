import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Briefcase,
  Car,
  ChevronDown,
  Gift,
  HeartPulse,
  Home,
  Laptop,
  LogOut,
  MessageCircle,
  Moon,
  PawPrint,
  Search,
  ShieldCheck,
  Shirt,
  Sun,
  Tags,
  User,
  Wrench,
} from 'lucide-react';

import { topLevelCategoryOptions } from '@/features/categories/category-taxonomy';
import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { useUnreadNotifications } from '@/features/notifications/hooks/use-unread-notifications';
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
import { useTheme } from '@/shared/theme/theme-context';
import { navigationItems } from './navigation-items';

type DesktopNavbarProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function DesktopNavbar({ isLoggingOut, onLogout }: DesktopNavbarProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const adminStatus = useAdminStatus();
  const unreadQuery = useUnreadNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const { localizedPath, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const currentPath = normalizePath(location.pathname);
  const avatarUrl = user?.user_metadata.avatar_url;
  const displayName = user?.user_metadata.display_name ?? t('Profile');
  const unreadCount = Number(unreadQuery.data ?? 0);
  const unreadLabel = formatUnreadCount(unreadCount);
  const isDark = theme === 'dark';
  const visibleItems = navigationItems.filter((item) => {
    if (
      item.labelKey === 'Search' ||
      item.labelKey === 'Reservations' ||
      item.labelKey === 'Profile' ||
      item.labelKey === 'Admin' ||
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
    <div className="bg-background/88 border-border/70 mx-auto hidden min-h-16 w-full max-w-[1440px] items-center gap-2 rounded-2xl border px-3 py-2 shadow-sm backdrop-blur md:flex lg:gap-3 lg:px-4">
      <Link
        className="group focus-visible:ring-ring flex w-[150px] shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 lg:w-[172px] 2xl:w-[220px]"
        to={localizedPath('/')}
      >
        <div className="brand-mark flex size-9 shrink-0 items-center justify-center rounded-[10px]">
          <BrandLogo className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-base leading-none font-semibold tracking-tight">
            Gaachuqe
          </p>
          <p className="text-muted-foreground mt-0.5 hidden truncate text-xs 2xl:block">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={t('Browse')}
            className="h-10 w-11 shrink-0 justify-center px-0 whitespace-nowrap xl:w-[152px] xl:justify-between xl:px-3 2xl:w-[172px]"
            variant="outline"
          >
            <Tags className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden min-w-0 truncate xl:inline">
              {t('Browse')}
            </span>
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
        className="border-border bg-card/70 focus-within:ring-ring/30 hidden h-10 min-w-[220px] flex-1 items-center gap-2 rounded-full border px-3 focus-within:ring-4 lg:flex xl:min-w-[260px]"
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
          className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:truncate"
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
        className="ml-auto flex shrink-0 items-center gap-1"
      >
        {isAuthenticated ? (
          <Button
            asChild
            className="h-10 shrink-0 px-3 whitespace-nowrap xl:px-4"
          >
            <NavLink to={localizedPath('/create')}>
              <span className="hidden 2xl:inline">{t('Post an item')}</span>
              <span className="2xl:hidden">{t('Post')}</span>
            </NavLink>
          </Button>
        ) : null}
        {visibleItems.map((item) => {
          const isPrimary = !isAuthenticated && item.href === '/register';

          return isPrimary ? (
            <Button
              asChild
              className="ml-1 h-9 shrink-0 whitespace-nowrap"
              key={item.href}
            >
              <NavLink to={localizedPath(item.href)}>
                <item.icon className="size-4" aria-hidden="true" />
                <span className="hidden 2xl:inline">{t(item.labelKey)}</span>
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
              <span className="hidden 2xl:inline">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
        {!isLoading && isAuthenticated ? (
          <>
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={t('Profile')}
                  className="border-border bg-card text-muted-foreground hover:bg-accent relative flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors"
                  type="button"
                >
                  <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                    {avatarUrl ? (
                      <img
                        className="h-full w-full object-cover"
                        src={avatarUrl}
                        alt=""
                      />
                    ) : (
                      <User className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  {unreadCount > 0 ? (
                    <span className="bg-destructive text-primary-foreground absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-5 font-bold shadow-sm">
                      {unreadLabel}
                    </span>
                  ) : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="flex min-w-0 items-center gap-3 px-3 py-2">
                  <div className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    {avatarUrl ? (
                      <img
                        className="h-full w-full object-cover"
                        src={avatarUrl}
                        alt=""
                      />
                    ) : (
                      <User className="size-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {displayName}
                    </p>
                    {user?.email ? (
                      <p className="text-muted-foreground truncate text-xs">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <DropdownMenuItem asChild>
                  <Link to={localizedPath('/profile')}>
                    <User className="size-4" aria-hidden="true" />
                    {t('Profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    className="justify-between"
                    to={localizedPath('/notifications')}
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="size-4" aria-hidden="true" />
                      {t('Notifications')}
                    </span>
                    {unreadCount > 0 ? (
                      <span className="bg-destructive text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                        {unreadLabel}
                      </span>
                    ) : null}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={localizedPath('/chats')}>
                    <MessageCircle className="size-4" aria-hidden="true" />
                    {t('Chats')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={localizedPath('/profile?tab=reserved')}>
                    {t('Reservations')}
                  </Link>
                </DropdownMenuItem>
                {adminStatus.data ? (
                  <DropdownMenuItem asChild>
                    <Link to={localizedPath('/admin')}>
                      <ShieldCheck className="size-4" aria-hidden="true" />
                      {t('Admin')}
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    toggleTheme();
                  }}
                >
                  {isDark ? (
                    <Sun className="size-4" aria-hidden="true" />
                  ) : (
                    <Moon className="size-4" aria-hidden="true" />
                  )}
                  {isDark
                    ? t('Switch to light mode')
                    : t('Switch to dark mode')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isLoggingOut}
                  onSelect={(event) => {
                    event.preventDefault();
                    onLogout();
                  }}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {isLoggingOut ? t('Logging out...') : t('Log out')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
        {!isAuthenticated ? (
          <>
            <ThemeToggle />
            <LanguageSwitcher />
          </>
        ) : null}
      </nav>
    </div>
  );
}

function formatUnreadCount(count: number) {
  if (count > 99) {
    return '99+';
  }

  return String(count);
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
  ...topLevelCategoryOptions.map((category) => ({
    icon: getBrowseCategoryIcon(category.value),
    label: category.label,
    value: category.value,
  })),
];

function getBrowseCategoryIcon(value: string) {
  const icons = {
    beauty_health: HeartPulse,
    books: BookOpen,
    children: Gift,
    clothing: Shirt,
    construction: Wrench,
    electronics: Laptop,
    home: Home,
    office: Briefcase,
    other: Gift,
    pets: PawPrint,
    sports: Gift,
    vehicles: Car,
  };

  return icons[value as keyof typeof icons] ?? Gift;
}
