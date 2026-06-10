import type { InputHTMLAttributes } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

type AuthFormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
};

export function AuthFormField({
  className,
  error,
  id,
  label,
  registration,
  ...props
}: AuthFormFieldProps) {
  const { t } = useI18n();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {t(label)}
      </label>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn(
          'modern-input h-11 w-full rounded-2xl bg-white/70 px-3 text-base outline-none disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        id={id}
        {...registration}
        {...props}
      />
      {error ? (
        <p className="text-destructive text-sm" id={errorId}>
          {t(error.message ?? '')}
        </p>
      ) : null}
    </div>
  );
}
