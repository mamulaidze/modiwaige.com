import {
  Bell,
  Check,
  Languages,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { useUnreadNotifications } from '@/features/notifications/hooks/use-unread-notifications';
import { BrandLogo } from '@/shared/components/brand-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/shared/i18n/language-switcher';
import { switchLanguagePath, useI18n, type Language } from '@/shared/i18n/i18n';
import { ThemeToggle } from '@/shared/theme/theme-toggle';
import { useTheme } from '@/shared/theme/theme-context';

type MobileHeaderProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function MobileHeader({ isLoggingOut, onLogout }: MobileHeaderProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const adminStatus = useAdminStatus();
  const unreadQuery = useUnreadNotifications();
  const { language, localizedPath, t } = useI18n();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const avatarUrl = user?.user_metadata.avatar_url;
  const displayName = user?.user_metadata.display_name ?? t('Profile');
  const unreadCount = Number(unreadQuery.data ?? 0);
  const isDark = theme === 'dark';

  return (
    <div className="bg-background/90 border-border/70 mx-auto flex min-h-14 w-full max-w-5xl items-center justify-between gap-2 rounded-2xl border px-3 py-2 shadow-sm backdrop-blur md:hidden">
      <Link
        className="group focus-visible:ring-ring flex min-w-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2"
        to={localizedPath('/')}
      >
        <div className="brand-mark flex size-9 shrink-0 items-center justify-center rounded-[10px]">
          <BrandLogo className="size-6" />
        </div>
        <div className="max-w-[170px] min-w-0">
          <p className="text-foreground truncate text-base leading-none font-semibold tracking-tight">
            Gaachuqe
          </p>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs leading-4">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        {!isLoading && isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={t('Profile')}
                className="border-border bg-card text-muted-foreground relative flex size-10 items-center justify-center overflow-hidden rounded-full border"
                type="button"
              >
                {avatarUrl ? (
                  <img
                    className="h-full w-full object-cover"
                    src={avatarUrl}
                    alt=""
                  />
                ) : (
                  <User className="size-4" aria-hidden="true" />
                )}
                {unreadCount > 0 ? (
                  <span className="bg-destructive text-primary-foreground absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
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
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
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
                {isDark ? t('Switch to light mode') : t('Switch to dark mode')}
              </DropdownMenuItem>
              <div className="text-muted-foreground px-3 pt-2 pb-1 text-xs font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Languages className="size-3.5" aria-hidden="true" />
                  {t('Language')}
                </span>
              </div>
              {languageOptions.map((option) => {
                const isActive = option.value === language;

                return (
                  <DropdownMenuItem asChild key={option.value}>
                    <Link
                      className="justify-between"
                      to={switchLanguagePath(location.pathname, option.value)}
                    >
                      <span>{option.label}</span>
                      {isActive ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : null}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
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
        ) : (
          <>
            <LanguageSwitcher />
            <ThemeToggle />
          </>
        )}
      </div>
    </div>
  );
}

const languageOptions: Array<{
  label: string;
  value: Language;
}> = [
  { label: 'ქართული', value: 'ge' },
  { label: 'English', value: 'en' },
  { label: 'Русский', value: 'ru' },
];
