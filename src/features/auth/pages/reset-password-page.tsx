import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { updatePassword } from '@/features/auth/api/auth-api';
import { AuthFormField } from '@/features/auth/components/auth-form-field';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/validation/auth-schemas';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { getFriendlyErrorMessage, logErrorDetails } from '@/shared/lib/errors';

export function ResetPasswordPage() {
  const { language, localizedPath, t } = useI18n();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null);
    setIsUpdated(false);

    try {
      await updatePassword({ password: values.password });
      setIsUpdated(true);
      window.setTimeout(() => navigate(localizedPath('/login')), 1200);
    } catch (error) {
      logErrorDetails('Password update failed', error);
      setFormError(
        getFriendlyErrorMessage(error, 'Password could not be updated.'),
      );
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
      <Seo
        noindex
        title={language === 'ge' ? 'ახალი პაროლი' : 'Set new password'}
        description={
          language === 'ge'
            ? 'დააყენეთ ახალი პაროლი Gaachuqe-ის ანგარიშისთვის.'
            : 'Set a new password for your Gaachuqe account.'
        }
      />
      <div className="glass-surface rounded-[28px] p-5 sm:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('Set new password')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('Enter a new password for your account.')}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthFormField
            autoComplete="new-password"
            error={errors.password}
            id="password"
            label={t('New password')}
            registration={register('password')}
            type="password"
          />
          <AuthFormField
            autoComplete="new-password"
            error={errors.confirmPassword}
            id="confirmPassword"
            label={t('Confirm password')}
            registration={register('confirmPassword')}
            type="password"
          />

          {isUpdated ? (
            <p
              className="rounded-md border border-primary/50 bg-primary/10 p-3 text-sm"
              role="status"
            >
              {t('Password updated. You can now log in.')}
            </p>
          ) : null}

          {formError ? (
            <p
              className="text-destructive rounded-md border border-current p-3 text-sm"
              role="alert"
            >
              {t(formError)}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            <KeyRound className="size-4" aria-hidden="true" />
            {isSubmitting ? t('Saving...') : t('Save new password')}
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to={localizedPath('/login')}
          >
            {t('Back to login')}
          </Link>
        </p>
      </div>
    </main>
  );
}
