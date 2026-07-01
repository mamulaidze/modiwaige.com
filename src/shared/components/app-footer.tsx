import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '@/shared/components/brand-logo';
import { instagramUrl } from '@/shared/config/contact';
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
    <footer className="border-border bg-card mt-12 border-t px-4 pt-6 pb-28 sm:px-6 md:pb-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="brand-mark flex size-8 shrink-0 items-center justify-center rounded-[10px]">
            <BrandLogo className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-none font-semibold">Gaachuqe</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('Legal and trust')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <nav
            aria-label={t('Legal and trust')}
            className="flex flex-wrap gap-x-3 gap-y-1 text-sm"
          >
            {footerLinks.map((link) => (
              <Link
                className="text-muted-foreground hover:text-foreground rounded-md py-1 font-medium transition-colors"
                key={link.href}
                to={localizedPath(link.href)}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>

          <a
            aria-label="Gaachuqe Instagram"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-semibold transition-colors"
            href={instagramUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Camera className="size-4" aria-hidden="true" />
            <span>@gaachuqe_</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
