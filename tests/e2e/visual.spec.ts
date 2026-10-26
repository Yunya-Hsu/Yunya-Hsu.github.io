import { expect, test } from '@playwright/test';

test('logo is one decorative SVG inside a link named "Yours, Yunya"', async ({ page }) => {
  await page.goto('/');
  const logo = page.getByRole('link', { name: 'Yours, Yunya', exact: true });
  await expect(logo).toHaveAttribute('href', '/');
  const svg = logo.locator('svg');
  await expect(svg).toHaveAttribute('aria-hidden', 'true');
  // No live text inside the logo, so axe never checks the 3.73:1 "YOURS," as page text (SPEC 2.2).
  expect(await svg.locator('text').count()).toBe(0);
});

test('logo is 140px tall on wider screens and 104px on phones', async ({ page, isMobile }) => {
  await page.goto('/');
  const box = await page.locator('.logo svg').boundingBox();
  expect(box?.height).toBeCloseTo(isMobile ? 104 : 140, 0);
});

test('uses the oat wall colour and loads Cormorant Garamond from the site', async ({ page }) => {
  const fontRequests: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'font') fontRequests.push(new URL(r.url()).host + new URL(r.url()).pathname);
  });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(238, 234, 226)');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('600 12px "Cormorant Garamond"'))).toBe(true);
  // Self-hosted only: no Google Fonts or other third-party font requests.
  expect(fontRequests.length).toBeGreaterThan(0);
  for (const r of fontRequests) expect(r).toMatch(/^localhost:\d+\/fonts\//);
});
