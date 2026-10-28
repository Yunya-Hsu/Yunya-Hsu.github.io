import { expect, test, type Page } from '@playwright/test';
import { NONE, SELECTED, underline } from './style';

// Work is a native <summary>; Playwright doesn't map <summary> to a role, so find it by element.
const workButton = (page: Page, name = 'Work') => page.locator('summary', { hasText: name });
const disclosure = (page: Page) => page.locator('details.work-menu');
const menu = (page: Page) => page.locator('#work-menu');

test('Work is a disclosure, not a link, and its menu starts closed', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work' })).toHaveCount(0);
  await expect(disclosure(page)).not.toHaveAttribute('open');
  await expect(menu(page)).toBeHidden();
});

test('tapping Work opens the categories and tapping again closes them', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch');
  await page.goto('/about/');
  await workButton(page).tap();
  await expect(disclosure(page)).toHaveAttribute('open');
  await expect(menu(page).getByRole('link')).toHaveText(['Limited Edition Prints', 'Postcards']);
  await workButton(page).tap();
  await expect(disclosure(page)).not.toHaveAttribute('open');
});

test('tapping a category opens its wall', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch');
  await page.goto('/about/');
  await workButton(page).tap();
  await menu(page).getByRole('link', { name: 'Postcards' }).tap();
  await expect(page).toHaveURL('/postcards/');
});

test('with a mouse, clicking Work keeps the menu open and leaving closes it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch screens have no mouse');
  await page.goto('/about/');
  await workButton(page).click();
  await expect(menu(page)).toBeVisible();
  await workButton(page).click();
  await expect(menu(page)).toBeVisible();
  await page.mouse.move(5, 5);
  await expect(menu(page)).toBeHidden();
});

test('choosing a category opens its wall', async ({ page }) => {
  await page.goto('/about/');
  await workButton(page).click();
  await menu(page).getByRole('link', { name: 'Postcards' }).click();
  await expect(page).toHaveURL('/postcards/');
  await workButton(page).click();
  await menu(page).getByRole('link', { name: 'Limited Edition Prints' }).click();
  await expect(page).toHaveURL('/');
});

test('the menu underlines the wall you are on', async ({ page }) => {
  await page.goto('/postcards/');
  await workButton(page).click();
  await expect(menu(page).getByRole('link', { name: 'Postcards' })).toHaveAttribute('aria-current', 'page');
  await expect(menu(page).getByRole('link', { name: 'Limited Edition Prints' })).not.toHaveAttribute('aria-current');
});

test('a tap outside closes the menu', async ({ page }) => {
  await page.goto('/about/');
  await workButton(page).click();
  await page.locator('main').click({ position: { x: 5, y: 5 } });
  await expect(menu(page)).toBeHidden();
});

test('hovering Work opens the menu on a desktop', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch screens have no hover');
  await page.goto('/about/');
  await workButton(page).hover();
  await expect(menu(page)).toBeVisible();
  // The pointer can travel down into the menu without it closing.
  await menu(page).getByRole('link', { name: 'Postcards' }).hover();
  await expect(menu(page)).toBeVisible();
  await page.mouse.move(5, 5);
  await expect(menu(page)).toBeHidden();
});

test('every category hover patch spans the full width of the menu', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch screens have no hover');
  await page.goto('/about/');
  await workButton(page).hover();
  const panel = (await menu(page).locator('ul').boundingBox())!;
  for (const name of ['Limited Edition Prints', 'Postcards']) {
    const link = menu(page).getByRole('link', { name });
    await link.hover();
    await expect(link).toHaveCSS('background-color', 'rgb(74, 69, 61)');
    const box = (await link.boundingBox())!;
    expect(box.x).toBeCloseTo(panel.x, 0);
    expect(box.width).toBeCloseTo(panel.width, 0);
  }
});

test('the selected category underline is only as wide as its text', async ({ page }) => {
  await page.goto('/postcards/');
  await workButton(page).click();
  const link = menu(page).getByRole('link', { name: 'Postcards' });
  const text = link.locator('span');
  expect(await underline(text)).toBe(SELECTED);
  expect((await text.boundingBox())!.width).toBeLessThan((await link.boundingBox())!.width - 40);
});

test('hovering another category hides the selected underline until the pointer leaves', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch screens have no hover');
  await page.goto('/postcards/');
  await workButton(page).hover();
  const selected = menu(page).getByRole('link', { name: 'Postcards' }).locator('span');
  expect(await underline(selected)).toBe(SELECTED);
  await menu(page).getByRole('link', { name: 'Limited Edition Prints' }).hover();
  await expect.poll(() => underline(selected)).toBe(NONE);
  await menu(page).getByRole('link', { name: 'Postcards' }).hover();
  await expect.poll(() => underline(selected)).toBe(SELECTED);
});

test('works from the keyboard and Escape closes it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard');
  await page.goto('/about/');
  await workButton(page).focus();
  await page.keyboard.press('Enter');
  await expect(menu(page)).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(menu(page).getByRole('link', { name: 'Limited Edition Prints' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu(page)).toBeHidden();
  await expect(workButton(page)).toBeFocused();
  // Tabbing past the last category closes it.
  await page.keyboard.press(' ');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'About', exact: true })).toBeFocused();
  await expect(menu(page)).toBeHidden();
});

test('the menu opens with a click and without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/about/');
  await workButton(page).click();
  await expect(menu(page)).toBeVisible();
  await menu(page).getByRole('link', { name: 'Postcards' }).click();
  await expect(page).toHaveURL('/postcards/');
  await context.close();
});
