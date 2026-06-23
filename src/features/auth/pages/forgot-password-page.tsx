import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { sendPasswordResetEmail } from '@/features/auth/api/auth-api';
import { AuthFormField } from '@/features/auth/components/auth-form-field';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/validation/auth-schemas';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { getFriendlyErrorMessage, logErrorDetails } from '@/shared/lib/errors';

export function ForgotPasswordPage() {
  const { language, localizedPath, t } = useI18n();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null);
    setIsSent(false);

    try {
      await sendPasswordResetEmail({
        email: values.email,
        redirectTo: `${window.location.origin}${localizedPath('/reset-password')}`,
      });
      setIsSent(true);
      toast.success(
        t('If an account exists for this email, a reset link was sent.'),
      );
    } catch (error) {
      logErrorDetails('Password reset email failed', error);
      const message = getFriendlyErrorMessage(
        error,
        'Password reset email could not be sent.',
      );
      setFormError(message);
      toast.error(t(message));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
      <Seo
        noindex
        title={language === 'ge' ? 'პაროლის აღდგენა' : 'Reset password'}
        description={
          language === 'ge'
            ? 'მიიღეთ Gaachuqe-ის პაროლის აღდგენის ბმული ელფოსტაზე.'
            : 'Request a Gaachuqe password reset link by email.'
        }
      />
      <div className="premium-card rounded-[14px] p-5 sm:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl leading-[30px] font-bold tracking-tight">
            {t('Reset password')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('Enter your email and we will send a password reset link.')}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthFormField
            autoComplete="email"
            error={errors.email}
            id="email"
            inputMode="email"
            label={t('Email')}
            placeholder="name@example.com"
            registration={register('email')}
            type="email"
          />

          {isSent ? (
            <p
              className="border-primary/50 bg-primary/10 rounded-md border p-3 text-sm"
              role="status"
            >
              {t('If an account exists for this email, a reset link was sent.')}
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
            <Mail className="size-4" aria-hidden="true" />
            {isSubmitting ? t('Sending...') : t('Send reset link')}
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
