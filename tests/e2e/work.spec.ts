import { expect, test, type Page } from '@playwright/test';
import { FIRST_WORK } from './pages';

const SITE = 'https://yunya-hsu.github.io';
const artwork = (page: Page) => page.locator('.artwork');
const info = (page: Page) => page.locator('.info');
const back = (page: Page) => info(page).getByRole('link', { name: /^Back to |^回到/ });

test('shows the work with its title, year, medium and edition', async ({ page }) => {
  await page.goto(FIRST_WORK);
  await expect(artwork(page)).toHaveAttribute('alt', 'Placeholder colour gradient');
  await expect(info(page).getByRole('heading', { level: 1 })).toHaveText('Placeholder Street Corner');
  await expect(info(page).locator('p')).toHaveText([
    '2025',
    'Digital illustration',
    'Archival pigment print on cotton rag paper · Edition of 25',
  ]);
});

test('leaves the edition out when a work has none', async ({ page }) => {
  await page.goto('/works/placeholder-2/');
  await expect(info(page).locator('p')).toHaveText(['2025', 'Digital illustration']);
});

test('from 1024px the details stand beside the artwork, left-aligned, the back link on top', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones stack them');
  await page.goto(FIRST_WORK);
  const art = (await artwork(page).boundingBox())!;
  const box = (await info(page).boundingBox())!;
  expect(box.x).toBeGreaterThan(art.x + art.width);
  expect(box.y).toBeCloseTo(art.y, 0);
  await expect(info(page)).toHaveCSS('text-align', 'left');
  const link = (await back(page).boundingBox())!;
  expect(link.y).toBeLessThan((await page.getByRole('heading', { level: 1 }).boundingBox())!.y);
});

test('on phones the details sit centred under the artwork, the back link last', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout');
  await page.goto(FIRST_WORK);
  const art = (await artwork(page).boundingBox())!;
  expect((await info(page).boundingBox())!.y).toBeGreaterThan(art.y + art.height);
  await expect(info(page)).toHaveCSS('text-align', 'center');
  const edition = (await info(page).locator('p').last().boundingBox())!;
  expect((await back(page).boundingBox())!.y).toBeGreaterThan(edition.y + edition.height);
});

test.describe('back link', () => {
  test('names the work’s own wall and leads to it', async ({ page }) => {
    for (const [path, text, name, wall] of [
      [FIRST_WORK, 'Limited Edition Prints', 'Back to Limited Edition Prints', '/'],
      ['/works/placeholder-4/', 'Postcards', 'Back to Postcards', '/postcards/'],
    ]) {
      await page.goto(path);
      const link = info(page).getByRole('link', { name, exact: true });
      await expect(link, path).toHaveAttribute('href', wall);
      await expect(link, path).toHaveText(new RegExp(`^‹\\s*${text}$`));
    }
  });

  test('returns to the wall where you had scrolled to', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    const scrolled = await page.evaluate(() => scrollY);
    const last = page.locator('.wall > li').last().getByRole('link');
    await last.click();
    await page.waitForURL('/works/placeholder-6/');
    await back(page).click();
    await page.waitForURL('/');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(scrolled, -1);
  });

  test('opened from elsewhere, e.g. a shared link, it goes to the top of the wall', async ({ page }) => {
    await page.goto('/works/placeholder-7/');
    await back(page).click();
    await page.waitForURL('/postcards/');
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test('hover is white on the dark patch, never an underline (SPEC 2.5)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no hover on touch screens');
    await page.goto(FIRST_WORK);
    await expect(back(page)).toHaveCSS('color', 'rgb(98, 93, 82)');
    await back(page).hover();
    await expect(back(page)).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(back(page)).toHaveCSS('background-color', 'rgb(74, 69, 61)');
    await expect(back(page)).toHaveCSS('text-decoration-line', 'none');
  });
});

test('has no previous / next arrows or arrow-key shortcuts', async ({ page, isMobile }) => {
  await page.goto('/works/placeholder-2/');
  await expect(page.getByRole('main').getByRole('navigation')).toHaveCount(0);
  if (isMobile) return;
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  await expect(page).toHaveURL('/works/placeholder-2/');
});

test.describe('artwork size', () => {
  test.skip(({ isMobile }) => isMobile, 'resizes the window itself');

  test('the whole work and its title fit on the first screen, whatever its shape', async ({ page }) => {
    // Laptops with the sidebar and the title beside the work, the narrowest of those, and a tablet with the top
    // header and the title below.
    for (const [width, height] of [
      [1440, 700],
      [1440, 800],
      [1440, 900],
      [1024, 768],
      [800, 1000],
    ]) {
      await page.setViewportSize({ width, height });
      // Portrait, landscape and square.
      for (const path of [FIRST_WORK, '/works/placeholder-2/', '/works/placeholder-3/']) {
        await page.goto(path);
        await expect(artwork(page)).toHaveJSProperty('complete', true);
        const art = (await artwork(page).boundingBox())!;
        const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
        expect(art.y + art.height, `${path} at ${width}×${height}`).toBeLessThanOrEqual(height);
        expect(title.y + title.height, `${path} at ${width}×${height}`).toBeLessThanOrEqual(height);
      }
    }
  });

  test('is never wider than 1000px', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 2000 });
    await page.goto('/works/placeholder-2/');
    await expect(artwork(page)).toHaveJSProperty('complete', true);
    // Beside the details column on the widest layout it tops out a little under the cap.
    const width = (await artwork(page).boundingBox())!.width;
    expect(width).toBeLessThanOrEqual(1000);
    expect(width).toBeGreaterThan(900);
  });

  test('keeps at least 240px of height on a very short screen, e.g. a phone held sideways', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(FIRST_WORK);
    await expect(artwork(page)).toHaveJSProperty('complete', true);
    expect((await artwork(page).boundingBox())!.height).toBeCloseTo(240, 0);
  });
});

test('has a drop shadow like a print on the wall', async ({ page }) => {
  await page.goto(FIRST_WORK);
  await expect(artwork(page)).toHaveCSS('box-shadow', /rgba\(60, 50, 30, 0\.1\) 0px 10px 28px/);
});

test('shares the work itself as the Open Graph image', async ({ page, request }) => {
  await page.goto('/works/placeholder-4/');
  const meta = (property: string) => page.locator(`meta[property="${property}"]`);
  await expect(meta('og:title')).toHaveAttribute('content', 'Placeholder Reader — Yunya Hsu');
  await expect(meta('og:url')).toHaveAttribute('content', `${SITE}/works/placeholder-4/`);
  await expect(meta('og:image:alt')).toHaveAttribute('content', /\S/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const image = await meta('og:image').getAttribute('content');
  expect(image).toMatch(new RegExp(`^${SITE}/_astro/placeholder-4\\.[^/]+\\.jpe?g$`));
  // The file is built next to the page: fetch it from the preview server.
  const response = await request.get(new URL(image!).pathname);
  expect(response.headers()['content-type']).toMatch(/image\/jpeg/);
  await expect(meta('og:image:width')).toHaveAttribute('content', '1200');
});
