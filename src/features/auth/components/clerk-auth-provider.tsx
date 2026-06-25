import { ClerkProvider } from '@clerk/clerk-react';
import { enUS, ruRU } from '@clerk/localizations';
import { dark } from '@clerk/themes';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/features/auth/context/auth-context';
import { useI18n } from '@/shared/i18n/i18n';
import { useTheme } from '@/shared/theme/theme-context';

type ClerkAuthProviderProps = {
  children: ReactNode;
};

const geLocalization = {
  ...enUS,
  locale: 'ka-GE',
  dividerText: 'ან',
  formButtonPrimary: 'გაგრძელება',
  formButtonPrimary__verify: 'დადასტურება',
  formFieldAction__forgotPassword: 'დაგავიწყდათ პაროლი?',
  formFieldHintText__optional: 'არასავალდებულო',
  formFieldInputPlaceholder__emailAddress: 'შეიყვანეთ ელფოსტა',
  formFieldInputPlaceholder__firstName: 'სახელი',
  formFieldInputPlaceholder__lastName: 'გვარი',
  formFieldInputPlaceholder__password: 'შეიყვანეთ პაროლი',
  formFieldInputPlaceholder__signUpPassword: 'შექმენით პაროლი',
  formFieldLabel__emailAddress: 'ელფოსტა',
  formFieldLabel__firstName: 'სახელი',
  formFieldLabel__lastName: 'გვარი',
  formFieldLabel__password: 'პაროლი',
  socialButtonsBlockButton: 'გაგრძელება {{provider|titleize}}-ით',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  signIn: {
    ...enUS.signIn,
    forgotPassword: {
      ...(enUS.signIn?.forgotPassword ?? {}),
      formTitle: 'პაროლის აღდგენის კოდი',
      title: 'პაროლის აღდგენა',
    },
    password: {
      ...(enUS.signIn?.password ?? {}),
      title: 'შეიყვანეთ პაროლი',
      subtitle: 'შეიყვანეთ თქვენს ანგარიშთან დაკავშირებული პაროლი',
    },
    start: {
      ...(enUS.signIn?.start ?? {}),
      actionLink: 'რეგისტრაცია',
      actionText: 'არ გაქვთ ანგარიში?',
      subtitle: 'კეთილი იყოს თქვენი მობრძანება! შეიყვანეთ მონაცემები.',
      title: 'შესვლა {{applicationName}}-ში',
      titleCombined: 'გაგრძელება {{applicationName}}-ში',
    },
  },
  signUp: {
    ...enUS.signUp,
    continue: {
      ...(enUS.signUp?.continue ?? {}),
      actionLink: 'შესვლა',
      actionText: 'უკვე გაქვთ ანგარიში?',
      subtitle: 'გასაგრძელებლად შეავსეთ დარჩენილი ველები.',
      title: 'შეავსეთ გამოტოვებული ველები',
    },
    emailCode: {
      ...(enUS.signUp?.emailCode ?? {}),
      formTitle: 'დადასტურების კოდი',
      subtitle: 'შეიყვანეთ ელფოსტაზე გამოგზავნილი კოდი',
      title: 'დაადასტურეთ ელფოსტა',
    },
    start: {
      ...(enUS.signUp?.start ?? {}),
      actionLink: 'შესვლა',
      actionLink__use_email: 'ელფოსტით გაგრძელება',
      actionText: 'უკვე გაქვთ ანგარიში?',
      subtitle: 'კეთილი იყოს თქვენი მობრძანება! შეავსეთ მონაცემები.',
      subtitleCombined: 'კეთილი იყოს თქვენი მობრძანება! შეავსეთ მონაცემები.',
      title: 'შექმენით ანგარიში',
      titleCombined: 'შექმენით ანგარიში',
    },
  },
} as typeof enUS;

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const { language } = useI18n();
  const { theme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        elements: {
          card: 'border border-border bg-card text-card-foreground shadow-none',
          cardBox: 'shadow-none',
          footer: 'bg-card',
          formButtonPrimary:
            'bg-primary text-primary-foreground hover:bg-[var(--theme-primary-hover)]',
        },
        variables: {
          borderRadius: '10px',
          colorBackground: 'var(--theme-card)',
          colorDanger: 'var(--theme-destructive)',
          colorInputBackground: 'var(--theme-card)',
          colorInputText: 'var(--theme-foreground)',
          colorPrimary: 'var(--theme-primary)',
          colorText: 'var(--theme-foreground)',
          colorTextSecondary: 'var(--theme-muted-foreground)',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        },
      }}
      localization={getClerkLocalization(language)}
      publishableKey={clerkPublishableKey ?? ''}
    >
      <AuthProvider>{children}</AuthProvider>
    </ClerkProvider>
  );
}

function getClerkLocalization(language: string) {
  if (language === 'ru') {
    return ruRU;
  }

  if (language === 'ge') {
    return geLocalization;
  }

  return enUS;
}
