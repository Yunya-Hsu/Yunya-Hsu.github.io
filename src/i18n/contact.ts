import type { Locale } from './ui';

/** Text beside the contact form (SPEC 5.5), first person. English is final; Chinese is unpublished and unreviewed. */
export const intro: Record<Locale, {
  greeting: string;
  lead: string;
  openToLabel: string;
  openTo: string[];
  closing: string;
}> = {
  en: {
    greeting: 'Hello,',
    lead: "If you'd like to work together, or simply say hello, leave me a message here:)",
    openToLabel: "I'm open to:",
    openTo: ['Commissioned Works', 'Stockists', 'Literary Agencies'],
    closing: "I'd love to hear from you!",
  },
  zh: {
    greeting: '哈囉',
    lead: '如果想要洽詢合作、或只是想打聲招呼，歡迎在這裡留言 :)',
    openToLabel: '我目前接受：',
    openTo: ['委託創作', '店家寄賣與批發', '出版經紀'],
    closing: '期待您的來信！',
  },
};
