// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// When switching to a custom domain, change `site` and add public/CNAME.
const site = 'https://yunya-hsu.github.io';

export default defineConfig({
  site,
  trailingSlash: 'always',
  i18n: {
    locales: ['en', { path: 'zh', codes: ['zh-Hant'] }],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-Hant',
        },
      },
    }),
  ],
});
