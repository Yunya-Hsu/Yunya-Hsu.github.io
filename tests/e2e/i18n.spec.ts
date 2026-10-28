import { expect, test } from '@playwright/test';
import { allPages } from './pages';

// Only English is published for now; Chinese is translated but switched off (SPEC 4).

test('English home is at / with lang="en"', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('the Chinese pages are not built', async ({ request }) => {
  for (const path of ['/zh/', '/zh/about/', '/zh/works/placeholder-1/']) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test('no page offers a language switch or hreflang alternates', async ({ page }) => {
  for (const path of [...allPages, '/404.html']) {
    await page.goto(path);
    await expect(page.getByRole('navigation', { name: 'Language' }), path).toHaveCount(0);
    await expect(page.locator('link[hreflang]'), path).toHaveCount(0);
  }
});

test('the sitemap lists the English pages only', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.ok()).toBe(true);

  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain('<loc>https://yunya-hsu.github.io/</loc>');
  expect(sitemap).not.toContain('/zh/');
  expect(sitemap).not.toContain('hreflang');
});
