export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Value for <html lang> and hreflang. */
export const htmlLang: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-Hant',
};

const en = {
  'site.name': 'Yunya Hsu',
  'skip': 'Skip to content',
  'nav.label': 'Main',
  'nav.work': 'Work',
  'nav.about': 'About',
  'lang.label': 'Language',
  'category.prints': 'Limited Edition Prints',
  'category.postcards': 'Postcards',
  'work.back': 'Back to work',
  'about.title': 'About',
  'meta.home.title': 'Yunya Hsu — Illustration',
  'meta.postcards.title': 'Postcards — Yunya Hsu',
  'meta.about.title': 'About — Yunya Hsu',
  'meta.description':
    'Illustrator based in Taiwan. Loose ink lines and textured color — travel, cafés, musicians and flowers.',
} as const;

export type UiKey = keyof typeof en;

const zh: Record<UiKey, string> = {
  'site.name': 'Yunya Hsu',
  'skip': '跳到主要內容',
  'nav.label': '主選單',
  'nav.work': '作品',
  'nav.about': '關於',
  'lang.label': '語言',
  'category.prints': '限量版畫',
  'category.postcards': '明信片',
  'work.back': '回到作品牆',
  'about.title': '關於',
  'meta.home.title': 'Yunya Hsu — 插畫',
  'meta.postcards.title': '明信片 — Yunya Hsu',
  'meta.about.title': '關於 — Yunya Hsu',
  'meta.description': '住在台灣的插畫家。鬆鬆的墨線與層疊的色彩質地，畫旅行、咖啡館、樂手與花。',
};

export const ui: Record<Locale, Record<UiKey, string>> = { en, zh };

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}
