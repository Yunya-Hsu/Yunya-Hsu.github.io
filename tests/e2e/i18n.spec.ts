import { expect, test } from '@playwright/test';

test('English home is at / with lang="en"', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('Chinese home is at /zh/ with lang="zh-Hant"', async ({ page }) => {
  await page.goto('/zh/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
});

test('sitemap lists both languages with hreflang alternates', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.ok()).toBe(true);

  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain('<loc>https://yunya-hsu.github.io/</loc>');
  expect(sitemap).toContain('<loc>https://yunya-hsu.github.io/zh/</loc>');
  expect(sitemap).toContain('hreflang="en"');
  expect(sitemap).toContain('hreflang="zh-Hant"');
});
