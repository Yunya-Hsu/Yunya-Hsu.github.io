import { expect, test, type Page } from '@playwright/test';

// From 1024px the header is a sidebar on the left (SPEC 5.1). Phones and tablets keep the top header.
test.skip(({ isMobile }) => isMobile, 'phones keep the top header');
test.beforeEach(async ({ page }) => page.setViewportSize({ width: 1280, height: 800 }));

const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' });
const menu = (page: Page) => page.locator('#work-menu');

test('logo and nav stack in a column left of the page, the social icons at its bottom', async ({ page }) => {
  await page.goto('/');
  const logo = (await page.locator('.logo').boundingBox())!;
  const nav = (await mainNav(page).boundingBox())!;
  const ig = (await page.getByRole('banner').getByRole('link', { name: 'Instagram' }).boundingBox())!;
  const threads = (await page.getByRole('banner').getByRole('link', { name: 'Threads' }).boundingBox())!;
  const main = (await page.getByRole('main').boundingBox())!;
  expect(logo.y).toBeCloseTo(48, 0);
  expect(nav.y).toBeGreaterThan(logo.y + logo.height);
  // The icons sit at the bottom of the sidebar, 48px up, centred across its width.
  expect(ig.y + ig.height).toBeCloseTo(800 - 48, 0);
  expect((ig.x + threads.x + threads.width) / 2).toBeCloseTo(main.x / 2, 0);
  for (const box of [logo, nav, ig, threads]) expect(box.x + box.width).toBeLessThanOrEqual(main.x);
  // The copyright stays in the footer, centred under the page.
  const copyright = (await page.getByRole('contentinfo').getByText(/^© \d{4} Yours, Yunya$/).boundingBox())!;
  expect(copyright.x + copyright.width / 2).toBeCloseTo(main.x + main.width / 2, 0);
  // The wall starts level with the logo.
  expect((await page.locator('.wall .cell').first().boundingBox())!.y).toBeCloseTo(48, 0);
});

test('Work and About stack in a column, and the categories open to the right of Work on hover', async ({ page }) => {
  await page.goto('/postcards/');
  const work = page.locator('summary', { hasText: 'Work' });
  const about = page.getByRole('link', { name: 'About', exact: true });
  const workBox = (await work.boundingBox())!;
  const aboutBox = (await about.boundingBox())!;
  expect(aboutBox.x).toBeCloseTo(workBox.x, 0);
  expect(aboutBox.y).toBeGreaterThan(workBox.y + workBox.height);
  await expect(menu(page)).toBeHidden();

  await work.hover();
  await expect(menu(page)).toBeVisible();
  // Opens to the right of Work, its first category level with Work, and never covers About.
  const panel = (await menu(page).locator('ul').boundingBox())!;
  const prints = (await menu(page).getByRole('link', { name: 'Limited Edition Prints' }).locator('span').boundingBox())!;
  expect(panel.x).toBeGreaterThan(workBox.x + workBox.width);
  expect(prints.y + prints.height / 2).toBeCloseTo(workBox.y + workBox.height / 2, -1);
  expect(panel.x > aboutBox.x + aboutBox.width || panel.y + panel.height < aboutBox.y).toBe(true);
  await expect(about).toBeVisible();
  expect((await about.boundingBox())!.y).toBeCloseTo(aboutBox.y, 0);
  // The pointer can travel across into the menu without it closing.
  await menu(page).getByRole('link', { name: 'Postcards' }).hover();
  await expect(menu(page)).toBeVisible();
  await expect(menu(page).getByRole('link', { name: 'Postcards' })).toHaveAttribute('aria-current', 'page');

  await page.mouse.move(1200, 700);
  await expect(menu(page)).toBeHidden();
});

test('stays on screen while the wall scrolls', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  expect((await page.locator('.logo').boundingBox())!.y).toBeCloseTo(48, 0);
  await expect(page.locator('summary', { hasText: 'Work' })).toBeInViewport();
  // The icons are part of the sidebar, so they stay put with it.
  expect((await page.getByRole('banner').getByRole('link', { name: 'Instagram' }).boundingBox())!.y).toBeCloseTo(800 - 48 - 32, 0);
});

test('under 1024px the centred top header comes back', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto('/');
  const logo = (await page.locator('.logo').boundingBox())!;
  expect(logo.x + logo.width / 2).toBeCloseTo(500, -1);
});
