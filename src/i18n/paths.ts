import { defaultLocale, locales, type Locale } from './ui';

/**
 * Prefix a locale-neutral path ("/", "/about/", "/works/x/") for a locale.
 * English lives at the root, Chinese under /zh/.
 */
export function localizePath(locale: Locale, path: string): string {
  if (!path.startsWith('/')) throw new Error(`Path must start with "/": ${path}`);
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

/** Split a site pathname into its locale and the locale-neutral path. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { locale, path: pathname.slice(prefix.length) || '/' };
    }
  }
  return { locale: defaultLocale, path: pathname };
}
