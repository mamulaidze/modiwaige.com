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
            <InstagramIcon className="size-4" aria-hidden="true" />
            <span>@gaachuqe_</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon({
  className,
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="instagram-brand-gradient"
          x1="4"
          x2="20"
          y1="20"
          y2="4"
        >
          <stop offset="0" stopColor="#feda75" />
          <stop offset="0.25" stopColor="#fa7e1e" />
          <stop offset="0.5" stopColor="#d62976" />
          <stop offset="0.75" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect
        fill="url(#instagram-brand-gradient)"
        height="18"
        rx="5"
        width="18"
        x="3"
        y="3"
      />
      <circle cx="12" cy="12" r="3.75" stroke="white" strokeWidth="2" />
      <circle cx="17.25" cy="6.75" fill="white" r="1.25" />
    </svg>
  );
}
