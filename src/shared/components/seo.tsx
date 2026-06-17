import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useI18n, type Language } from '@/shared/i18n/i18n';

type SeoProps = {
  title: string;
  description: string;
  imagePath?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
};

const siteName = 'Gaachuqe';
const defaultImagePath = '/og-image.png';
const siteUrl = normalizeSiteUrl(
  import.meta.env.VITE_SITE_URL ?? import.meta.env.VITE_PUBLIC_SITE_URL,
);

export function Seo({
  description,
  imagePath = defaultImagePath,
  noindex = false,
  title,
  type = 'website',
}: SeoProps) {
  const { language } = useI18n();
  const location = useLocation();
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const canonicalUrl = siteUrl
    ? `${siteUrl}${location.pathname}${location.search}`
    : null;
  const imageUrl = siteUrl ? `${siteUrl}${imagePath}` : imagePath;

  useEffect(() => {
    document.documentElement.lang = languageToHtmlLang(language);
    document.title = fullTitle;

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:image:type', 'image/png');
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:locale', language === 'ge' ? 'ka_GE' : 'en_US');
    setMeta(
      'property',
      'og:locale:alternate',
      language === 'ge' ? 'en_US' : 'ka_GE',
    );
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);

    setLink('canonical', canonicalUrl);

    if (canonicalUrl) {
      setMeta('property', 'og:url', canonicalUrl);
      setAlternateLinks(location.pathname, location.search);
    } else {
      removeMeta('property', 'og:url');
      removeAlternateLinks();
    }
  }, [
    canonicalUrl,
    description,
    fullTitle,
    imageUrl,
    language,
    location.pathname,
    location.search,
    noindex,
    type,
  ]);

  return null;
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function removeMeta(attribute: 'name' | 'property', key: string) {
  document.head
    .querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    ?.remove();
}

function setLink(rel: string, href: string | null) {
  const selector = `link[rel="${rel}"]`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!href) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

function setAlternateLinks(pathname: string, search: string) {
  if (!siteUrl) {
    return;
  }

  removeAlternateLinks();

  const normalizedPath = pathname.replace(/^\/(ge|en)(?=\/|$)/, '') || '/';
  const alternates: Array<{ hrefLang: string; path: string }> = [
    {
      hrefLang: 'ka-GE',
      path: `/ge${normalizedPath === '/' ? '' : normalizedPath}`,
    },
    {
      hrefLang: 'en',
      path: `/en${normalizedPath === '/' ? '' : normalizedPath}`,
    },
    {
      hrefLang: 'x-default',
      path: `/ge${normalizedPath === '/' ? '' : normalizedPath}`,
    },
  ];

  alternates.forEach((alternate) => {
    const element = document.createElement('link');
    element.rel = 'alternate';
    element.hreflang = alternate.hrefLang;
    element.href = `${siteUrl}${alternate.path}${search}`;
    element.dataset.gaachuqeSeo = 'alternate';
    document.head.appendChild(element);
  });
}

function removeAlternateLinks() {
  document.head
    .querySelectorAll('link[data-gaachuqe-seo="alternate"]')
    .forEach((element) => element.remove());
}

function normalizeSiteUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  return value.trim().replace(/\/+$/, '');
}

function languageToHtmlLang(language: Language) {
  return language === 'ge' ? 'ka-GE' : 'en';
}
