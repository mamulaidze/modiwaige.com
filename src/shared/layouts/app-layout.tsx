import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { logout } from '@/features/auth/api/auth-api';
import { AnalyticsTracker } from '@/shared/components/analytics-tracker';
import { Button } from '@/shared/components/ui/button';
import { I18nProvider, useI18n } from '@/shared/i18n/i18n';
import { DesktopNavbar } from '@/shared/navigation/desktop-navbar';
import { MobileBottomNav } from '@/shared/navigation/mobile-bottom-nav';
import { MobileHeader } from '@/shared/navigation/mobile-header';

export function AppLayout() {
  return (
    <I18nProvider>
      <LocalizedAppLayout />
    </I18nProvider>
  );
}

function LocalizedAppLayout() {
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { localizedPath, t } = useI18n();

  async function handleLogout() {
    setIsLogoutConfirmOpen(false);
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      navigate(localizedPath('/'), { replace: true });
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Logout failed.');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="text-foreground flex min-h-svh flex-col">
      <AnalyticsTracker />
      <a className="skip-link" href="#main-content">
        {t('Skip to content')}
      </a>
      <header className="sticky top-0 z-30 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-4">
        <DesktopNavbar
          isLoggingOut={isLoggingOut}
          onLogout={() => setIsLogoutConfirmOpen(true)}
        />
        <MobileHeader
          isLoggingOut={isLoggingOut}
          onLogout={() => setIsLogoutConfirmOpen(true)}
        />
        {logoutError ? (
          <p
            className="glass-surface text-destructive mx-auto mt-2 w-full max-w-5xl rounded-2xl px-4 py-3 text-sm"
            role="alert"
          >
            {logoutError}
          </p>
        ) : null}
      </header>
      <Outlet />
      <MobileBottomNav />

      {isLogoutConfirmOpen ? (
        <LogoutConfirmModal
          isLoggingOut={isLoggingOut}
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => void handleLogout()}
        />
      ) : null}
    </div>
  );
}

function LogoutConfirmModal({
  isLoggingOut,
  onCancel,
  onConfirm,
}: {
  isLoggingOut: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();

  return (
    <div
      aria-labelledby="logout-confirm-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-backdrop)] p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="glass-surface w-full max-w-sm rounded-3xl p-5">
        <h2
          className="text-xl font-semibold tracking-tight"
          id="logout-confirm-title"
        >
          {t('Log out?')}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {t('Do you really want to log out of your account?')}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            disabled={isLoggingOut}
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {t('Cancel')}
          </Button>
          <Button disabled={isLoggingOut} type="button" onClick={onConfirm}>
            {isLoggingOut ? t('Logging out...') : t('Log out')}
          </Button>
        </div>
      </div>
    </div>
  );
}
