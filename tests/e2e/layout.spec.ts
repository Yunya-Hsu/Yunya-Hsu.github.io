import { expect, test } from '@playwright/test';
import { FIRST_WORK, allPages, neutralPaths } from './pages';

const SITE = 'https://yunya-hsu.github.io';

test.describe('header', () => {
  test('logo goes to the home of the current language', async ({ page }) => {
    await page.goto('/zh/about/');
    await expect(page.getByRole('link', { name: 'Yours, Yunya', exact: true })).toHaveAttribute('href', '/zh/');
  });

  test('marks the current section', async ({ page }) => {
    const work = page.locator('summary', { hasText: 'Work' });
    await page.goto('/about/');
    await expect(page.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(work).not.toHaveAttribute('aria-current');
    for (const path of ['/', '/postcards/', FIRST_WORK]) {
      await page.goto(path);
      await expect(work, path).toHaveAttribute('aria-current', 'true');
    }
  });

  test('language switch is its own nav in the top-right corner, outside the main nav', async ({ page }) => {
    await page.goto('/');
    const main = page.getByRole('navigation', { name: 'Main' });
    const lang = page.getByRole('navigation', { name: 'Language' });
    await expect(main.getByRole('link', { name: '中文' })).toHaveCount(0);
    await expect(lang.getByRole('link')).toHaveText(['EN', '中']);
    const box = (await lang.boundingBox())!;
    const logo = (await page.locator('.logo').boundingBox())!;
    const width = page.viewportSize()!.width;
    expect(box.x).toBeGreaterThan(logo.x + logo.width);
    expect(width - (box.x + box.width)).toBeLessThanOrEqual(64);
    expect(box.y).toBeLessThan(logo.y + 20);
  });

  test('the language switch underlines the current language and shows white on dark on hover', async ({ page, isMobile }) => {
    await page.goto('/');
    const lang = page.getByRole('navigation', { name: 'Language' });
    const en = lang.getByRole('link', { name: 'EN English' });
    const zh = lang.getByRole('link', { name: '中文' });
    await expect(en).toHaveCSS('border-bottom-color', 'rgb(47, 44, 39)');
    await expect(zh).toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');
    if (!isMobile) {
      await zh.hover();
      // Never an underline: underlines mean "selected" (SPEC 2.5).
      await expect(zh).toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');
      await expect(zh).toHaveCSS('background-color', 'rgb(74, 69, 61)');
      await expect(zh).toHaveCSS('color', 'rgb(255, 255, 255)');
      // The current language stays as it is, with no extra underline.
      await en.hover();
      await expect(en).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(en).toHaveCSS('color', 'rgb(47, 44, 39)');
      await expect(en).toHaveCSS('text-decoration-line', 'none');
    }
  });

  test('header items never get the site-wide hover underline', async ({ page, isMobile }) => {
    test.skip(isMobile, 'touch screens have no hover');
    await page.goto('/about/');
    const items = [
      page.getByRole('link', { name: 'About', exact: true }),
      page.locator('summary', { hasText: 'Work' }),
      page.getByRole('link', { name: 'EN English' }),
      page.getByRole('link', { name: '中文' }),
    ];
    for (const item of items) {
      await item.hover();
      await expect(item).toHaveCSS('text-decoration-line', 'none');
    }
  });

  test('404 has no language switch', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page.getByRole('navigation', { name: 'Language' })).toHaveCount(0);
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

test('About has no contact section: the social links live only in the footer', async ({ page }) => {
  await page.goto('/about/');
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Contact' })).toHaveCount(0);
  await expect(main.getByRole('link', { name: /Instagram|Threads/ })).toHaveCount(0);
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Instagram', exact: true })).toBeVisible();
});
