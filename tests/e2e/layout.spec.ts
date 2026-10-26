import { expect, test } from '@playwright/test';
import { FIRST_WORK, allPages, neutralPaths } from './pages';

const SITE = 'https://yunya-hsu.github.io';

test.describe('header', () => {
  test('logo and Work link go to the home of the current language', async ({ page }) => {
    await page.goto('/zh/about/');
    await expect(page.getByRole('link', { name: 'Yours, Yunya', exact: true })).toHaveAttribute('href', '/zh/');
    await expect(page.getByRole('link', { name: '作品' })).toHaveAttribute('href', '/zh/');
  });

  test('marks the current section', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'page');
    await page.goto(FIRST_WORK);
    await expect(page.getByRole('link', { name: 'Work', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  for (const path of neutralPaths) {
    test(`language switch on ${path} stays on the same page`, async ({ page }) => {
      await page.goto(path);
      await page.getByRole('link', { name: '中文' }).click();
      await expect(page).toHaveURL(`/zh${path}`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');

      await page.getByRole('link', { name: 'EN English' }).click();
      await expect(page).toHaveURL(path);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });
  }
});

test('footer has the copyright and Instagram / Threads icon links', async ({ page }) => {
  await page.goto('/zh/');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Yunya Hsu`);
  const ig = footer.getByRole('link', { name: 'Instagram', exact: true });
  const threads = footer.getByRole('link', { name: 'Threads', exact: true });
  await expect(ig).toHaveAttribute('href', 'https://www.instagram.com/yours_yunya/');
  await expect(threads).toHaveAttribute('href', 'https://www.threads.com/@yours_yunya');
  for (const link of [ig, threads]) {
    await expect(link).toHaveText('');
    await expect(link.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    const box = await link.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(24);
    expect(box!.height).toBeGreaterThanOrEqual(24);
  }
  await expect(page.getByRole('banner').getByRole('link', { name: 'Instagram' })).toHaveCount(0);
});

for (const path of allPages) {
  test(`${path} has canonical and hreflang alternates`, async ({ page }) => {
    await page.goto(path);
    const neutral = path.replace(/^\/zh/, '');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', `${SITE}${neutral}`);
    await expect(page.locator('link[hreflang="zh-Hant"]')).toHaveAttribute('href', `${SITE}/zh${neutral}`);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', `${SITE}${neutral}`);
  });
}

test('every page has a title and description in its language', async ({ page }) => {
  await page.goto('/zh/about/');
  await expect(page).toHaveTitle('關於 — Yunya Hsu');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /住在台灣的插畫家/);

  await page.goto(FIRST_WORK);
  await expect(page).toHaveTitle('Placeholder Street Corner — Yunya Hsu');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Placeholder Street Corner, 2025. Digital illustration.',
  );
});

test.describe('while placeholder content exists', () => {
  test('pages are noindex', async ({ page }) => {
    for (const path of allPages) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute('content', 'noindex');
    }
  });

  test('robots.txt blocks all crawlers', async ({ request }) => {
    expect(await (await request.get('/robots.txt')).text()).toBe('User-agent: *\nDisallow: /\n');
  });
});

test('site never shows the Chinese name', async ({ page }) => {
  for (const path of allPages) {
    await page.goto(path);
    await expect(page.locator('body'), path).not.toContainText('徐');
  }
});

test.describe('404', () => {
  test('unknown URLs show a bilingual not-found page', async ({ page }) => {
    const response = await page.goto('/no-such-page/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '找不到這個頁面' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to the work' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: '回到作品牆' })).toHaveAttribute('href', '/zh/');
  });

  test('is not in the sitemap', async ({ request }) => {
    expect(await (await request.get('/sitemap-0.xml')).text()).not.toContain('404');
  });
});
