import { expect, test } from '@playwright/test';
import { FIRST_WORK, allPages } from './pages';

const SITE = 'https://yunya-hsu.github.io';

test.describe('header', () => {
  test('logo goes home', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.getByRole('link', { name: 'Yours, Yunya', exact: true })).toHaveAttribute('href', '/');
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

  test('header items never get the site-wide hover underline', async ({ page, isMobile }) => {
    test.skip(isMobile, 'touch screens have no hover');
    await page.goto('/about/');
    const items = [
      page.getByRole('link', { name: 'About', exact: true }),
      page.locator('summary', { hasText: 'Work' }),
    ];
    for (const item of items) {
      await item.hover();
      await expect(item).toHaveCSS('text-decoration-line', 'none');
    }
  });

});

test('footer has the copyright; the Instagram / Threads icons are in the footer on phones, the sidebar on desktop', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toHaveText(`© ${new Date().getFullYear()} Yours, Yunya`);
  // One set is shown at a time; the other is display: none, so it is out of the accessibility tree too.
  const home = isMobile ? footer : page.getByRole('banner');
  const ig = home.getByRole('link', { name: 'Instagram (opens in a new tab)', exact: true });
  const threads = home.getByRole('link', { name: 'Threads (opens in a new tab)', exact: true });
  await expect(page.getByRole('link', { name: /^Instagram/ })).toHaveCount(1);
  await expect(ig).toHaveAttribute('href', 'https://www.instagram.com/yours_yunya/');
  await expect(threads).toHaveAttribute('href', 'https://www.threads.com/@yours_yunya');
  for (const link of [ig, threads]) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'me noopener');
    await expect(link).toHaveText('');
    await expect(link.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    const box = await link.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(24);
    expect(box!.height).toBeGreaterThanOrEqual(24);
  }
});

for (const path of allPages) {
  test(`${path} has a canonical link`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
  });
}

test('every page has a title and description in its language', async ({ page }) => {
  await page.goto('/about/');
  await expect(page).toHaveTitle('About — Yunya Hsu');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Illustrator based in Taiwan/);

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
  test('unknown URLs show a not-found page, in English while Chinese is unpublished', async ({ page }) => {
    const response = await page.goto('/no-such-page/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to the work' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('heading', { name: '找不到這個頁面' })).toHaveCount(0);
  });

  test('is not in the sitemap', async ({ request }) => {
    expect(await (await request.get('/sitemap-0.xml')).text()).not.toContain('404');
  });
});

test('About has no contact section: the social links live in the sidebar or footer', async ({ page }) => {
  await page.goto('/about/');
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Contact' })).toHaveCount(0);
  await expect(main.getByRole('link', { name: /Instagram|Threads/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^Instagram/ })).toBeVisible();
});

test('the selected underline is square, 6px under the text and no wider than it', async ({ page }) => {
  for (const [width, path] of [
    [1280, '/about/'],
    [800, '/about/'],
  ] as const) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(path);
    const about = page.getByRole('navigation', { name: 'Main' }).locator('a[aria-current]');
    const line = await about.evaluate((el) => {
      const after = getComputedStyle(el, '::after');
      const box = el.getBoundingClientRect();
      // The text itself, without the letter-spacing browsers add after the last letter.
      const range = document.createRange();
      range.selectNodeContents(el);
      const text = range.getBoundingClientRect();
      const trailing = parseFloat(getComputedStyle(el).letterSpacing);
      return {
        left: box.left + parseFloat(after.left),
        right: box.right - parseFloat(after.right),
        top: box.bottom - parseFloat(after.bottom) - parseFloat(after.height),
        textLeft: text.left,
        textRight: text.right - trailing,
        // Bottom of the line of text (its content box), which the 6px is measured from.
        textBottom: box.bottom - parseFloat(getComputedStyle(el).paddingBottom),
        border: getComputedStyle(el).borderBottomWidth,
      };
    });
    // A border would pick up the item's rounded corners and curl up at the ends.
    expect(line.border, `${path} at ${width}px`).toBe('0px');
    expect(line.left).toBeCloseTo(line.textLeft, 0);
    expect(line.right).toBeCloseTo(line.textRight, 0);
    expect(line.top - line.textBottom).toBeCloseTo(6, 0);
  }
});
