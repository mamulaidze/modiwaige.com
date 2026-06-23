import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { Input } from '@/shared/components/ui/input';
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const errorId = error ? `${id}-error` : undefined;
  const isPassword = props.type === 'password';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {t(label)}
      </label>
      <div className="relative">
        <Input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className={cn(
            isPassword && 'pr-11',
            error && 'border-destructive focus-visible:ring-destructive',
            className,
          )}
          id={id}
          {...registration}
          {...props}
          type={
            isPassword ? (isPasswordVisible ? 'text' : 'password') : props.type
          }
        />
        {isPassword ? (
          <button
            aria-label={
              isPasswordVisible ? t('Hide password') : t('Show password')
            }
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-xl outline-none focus-visible:ring-2"
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
          >
            {isPasswordVisible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-destructive text-sm" id={errorId}>
          {t(error.message ?? '')}
        </p>
      ) : null}
    </div>
  );
}
