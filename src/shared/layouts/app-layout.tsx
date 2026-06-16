import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { logout } from '@/features/auth/api/auth-api';
import { AnalyticsTracker } from '@/shared/components/analytics-tracker';
import { AppFooter } from '@/shared/components/app-footer';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { I18nProvider, useI18n } from '@/shared/i18n/i18n';
import { getFriendlyErrorMessage, logErrorDetails } from '@/shared/lib/errors';
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
      logErrorDetails('Logout failed', error);
      setLogoutError(getFriendlyErrorMessage(error, 'Logout failed.'));
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
            {t(logoutError)}
          </p>
        ) : null}
      </header>
      <Outlet />
      <AppFooter />
      <MobileBottomNav />

      {isLogoutConfirmOpen ? (
        <ConfirmDialog
          confirmLabel={t('Log out')}
          description={t('Do you really want to log out of your account?')}
          isLoading={isLoggingOut}
          loadingLabel={t('Logging out...')}
          title={t('Log out?')}
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => void handleLogout()}
        />
      ) : null}
    </div>
  );
}
