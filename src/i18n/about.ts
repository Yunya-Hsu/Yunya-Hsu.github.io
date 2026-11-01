import type { Locale } from './ui';

/** Bio (SPEC 5.4), one string per paragraph. */
export const bio: Record<Locale, string[]> = {
  en: [
    "I'm Yunya Hsu, an illustrator and software engineer based in Taiwan, where I live with my husband and our two cats. (I love cats so much that I'm hoping for a third 🐈‍⬛.)",
    "Art wasn't really my thing growing up. But sometime after I turned 30, I got the urge to pick up a brush, and... ta-da! If I can do it, so can you :)",
    "My drawings come from daily life and travel, and I love using vivid colors. Procreate is my main tool, though I've also started trying watercolor, crayons and colored pencils.",
  ],
  zh: [
    '我是 Yunya Hsu，住在台灣的插畫家，也是軟體工程師。我和先生、兩隻貓住在一起。（我非常喜歡貓咪，希望能再養第三隻 🐈‍⬛。）',
    '小時候我對藝術沒什麼感覺，過了 30 歲卻突然很想拿起畫筆，然後……噹噹！我可以，你一定也可以 :)',
    '我的畫來自生活和旅行，也喜歡使用鮮豔的色彩。Procreate 是我主要的創作工具，最近也開始嘗試水彩、蠟筆和彩色鉛筆。',
  ],
};
