import { Link } from 'react-router-dom';

import { BrandLogo } from '@/shared/components/brand-logo';
import { useI18n } from '@/shared/i18n/i18n';

const footerLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/safety', label: 'Safety' },
  { href: '/contact', label: 'Contact' },
];

export function AppFooter() {
  const { localizedPath, t } = useI18n();

  return (
    <footer className="px-4 pb-24 sm:px-6 md:pb-8 lg:px-8">
      <div className="glass-surface mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-3xl px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="brand-mark flex size-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-[var(--theme-glass-border)]">
            <BrandLogo className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Gaachuqe</p>
            <p className="text-muted-foreground text-sm">
              {t('Legal and trust')}
            </p>
          </div>
        </div>

        <nav
          aria-label={t('Legal and trust')}
          className="flex flex-wrap gap-2 text-sm"
        >
          {footerLinks.map((link) => (
            <Link
              className="text-muted-foreground hover:text-foreground rounded-md px-1 py-1 font-medium transition-colors"
              key={link.href}
              to={localizedPath(link.href)}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
