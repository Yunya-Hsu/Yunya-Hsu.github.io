import type { Locale } from './ui';

/** Final bio (SPEC 5.4), one string per paragraph. */
export const bio: Record<Locale, string[]> = {
  en: [
    "I'm Yunya Hsu, an illustrator based in Taiwan. I draw the quiet moments of everyday life and travel — street corners, café tables, musicians mid-song, flowers by the window — with loose ink lines and layered, textured color.",
    'By day I work as a software engineer. Drawing is how I slow down and pay attention.',
  ],
  zh: [
    '我是 Yunya Hsu，住在台灣的插畫家。我畫日常與旅途中安靜的片刻：街角、咖啡館的桌邊、正在演奏的樂手、窗邊的花。用鬆鬆的墨線，和一層層疊上的色彩質地。',
    '白天我是軟體工程師；畫畫，是我放慢腳步、好好觀察世界的方式。',
  ],
};
