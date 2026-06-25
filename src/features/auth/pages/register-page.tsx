import { SignUp } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/use-auth';
import { Seo } from '@/shared/components/seo';
import { useI18n } from '@/shared/i18n/i18n';

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { localizedPath } = useI18n();

  if (!isLoading && isAuthenticated) {
    return <Navigate to={localizedPath('/profile')} replace />;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
      <Seo
        noindex
        title="Create account"
        description="Create a Gaachuqe account to give away useful items and reserve free local finds."
      />
      <SignUp
        fallbackRedirectUrl={localizedPath('/profile')}
        forceRedirectUrl={localizedPath('/profile')}
        signInUrl={localizedPath('/login')}
      />
    </main>
  );
}
