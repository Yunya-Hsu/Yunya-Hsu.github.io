import { describe, expect, it } from 'vitest';
import { localizePath, splitLocale } from '../../src/i18n/paths';

describe('localizePath', () => {
  it('keeps English at the root and prefixes Chinese with /zh', () => {
    expect(localizePath('en', '/')).toBe('/');
    expect(localizePath('en', '/works/a/')).toBe('/works/a/');
    expect(localizePath('zh', '/')).toBe('/zh/');
    expect(localizePath('zh', '/about/')).toBe('/zh/about/');
  });

  it('rejects relative paths', () => {
    expect(() => localizePath('en', 'about/')).toThrow();
  });
});

describe('splitLocale', () => {
  it.each([
    ['/', 'en', '/'],
    ['/about/', 'en', '/about/'],
    ['/works/a/', 'en', '/works/a/'],
    ['/zh/', 'zh', '/'],
    ['/zh', 'zh', '/'],
    ['/zh/works/a/', 'zh', '/works/a/'],
    ['/zhuhai/', 'en', '/zhuhai/'],
  ])('%s → %s %s', (pathname, locale, path) => {
    expect(splitLocale(pathname)).toEqual({ locale, path });
  });

  it('round-trips with localizePath', () => {
    for (const locale of ['en', 'zh'] as const) {
      expect(splitLocale(localizePath(locale, '/works/a/'))).toEqual({ locale, path: '/works/a/' });
    }
  });
});
