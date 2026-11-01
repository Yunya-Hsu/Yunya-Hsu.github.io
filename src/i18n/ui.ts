export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/**
 * Locales the site is built in (SPEC 4). Chinese is translated but not published yet. To publish it, add 'zh' here
 * and rename src/pages/_zh back to src/pages/zh: the language switch, hreflang links and the bilingual 404 follow.
 */
export const publishedLocales: readonly Locale[] = ['en'];

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
  'nav.contact': 'Contact',
  'lang.label': 'Language',
  'category.prints': 'Limited Edition Prints',
  'category.postcards': 'Postcards',
  'work.back': 'Back to {wall}',
  'about.title': 'About',
  'contact.title': 'Contact',
  'contact.firstName': 'First name',
  'contact.lastName': 'Last name',
  'contact.email': 'Email',
  'contact.message': 'Message',
  'contact.required': '(required)',
  'contact.send': 'Send',
  'contact.sending': 'Sending…',
  'contact.sent': "Thank you — your message has been sent. I'll get back to you soon.",
  'contact.failed': "Sorry, your message couldn't be sent. Please try again in a moment, or message me on Instagram.",
  'meta.home.title': 'Yunya Hsu — Illustration',
  'meta.postcards.title': 'Postcards — Yunya Hsu',
  'meta.about.title': 'About — Yunya Hsu',
  'meta.contact.title': 'Contact — Yunya Hsu',
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
  'nav.contact': '聯絡',
  'lang.label': '語言',
  'category.prints': '限量版畫',
  'category.postcards': '明信片',
  'work.back': '回到{wall}',
  'about.title': '關於',
  'contact.title': '聯絡',
  'contact.firstName': '名字',
  'contact.lastName': '姓氏',
  'contact.email': 'Email',
  'contact.message': '訊息',
  'contact.required': '（必填）',
  'contact.send': '送出',
  'contact.sending': '傳送中…',
  'contact.sent': '謝謝你，訊息已經送出，我會盡快回覆。',
  'contact.failed': '抱歉，訊息沒有送出。請稍後再試一次，或在 Instagram 上傳訊息給我。',
  'meta.home.title': 'Yunya Hsu — 插畫',
  'meta.postcards.title': '明信片 — Yunya Hsu',
  'meta.about.title': '關於 — Yunya Hsu',
  'meta.contact.title': '聯絡 — Yunya Hsu',
  'meta.description': '住在台灣的插畫家。鬆鬆的墨線與層疊的色彩質地，畫旅行、咖啡館、樂手與花。',
};

export const ui: Record<Locale, Record<UiKey, string>> = { en, zh };

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}
