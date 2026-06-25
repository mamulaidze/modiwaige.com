import { SignIn } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { Seo } from '@/shared/components/seo';
import { useI18n } from '@/shared/i18n/i18n';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { localizedPath } = useI18n();
  const location = useLocation();
  const redirectTo =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : localizedPath('/profile');

  if (!isLoading && isAuthenticated) {
    return <Navigate to={localizedPath('/profile')} replace />;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
      <Seo
        noindex
        title="Log in"
        description="Log in to Gaachuqe to manage posts, reservations, and your profile."
      />
      <SignIn
        fallbackRedirectUrl={redirectTo}
        forceRedirectUrl={redirectTo}
        signUpUrl={localizedPath('/register')}
      />
    </main>
  );
}
