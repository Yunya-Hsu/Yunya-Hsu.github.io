import { expect, test } from '@playwright/test';

test('logo is a cacheable SVG image inside a link named "Yours, Yunya"', async ({ page, request }) => {
  await page.goto('/');
  const logo = page.getByRole('link', { name: 'Yours, Yunya', exact: true });
  await expect(logo).toHaveAttribute('href', '/');
  const img = logo.getByRole('img', { name: 'Yours, Yunya' });
  const src = await img.getAttribute('src');
  expect(src).toMatch(/\.svg$/);
  // A separate file, and pure outlines: axe never checks the 3.73:1 "YOURS," as page text (SPEC 2.2).
  const svg = await (await request.get(src!)).text();
  expect(svg).not.toContain('<text');
});

test('logo is 140px tall on wider screens and 104px on phones', async ({ page, isMobile }) => {
  await page.goto('/');
  const box = await page.locator('.logo img').boundingBox();
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
  // fonts.check() passes even when no face matches, so look for the loaded faces themselves.
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.family.includes('Cormorant Garamond') && f.status === 'loaded').map((f) => f.style),
  );
  expect(loaded).toContain('normal');
  // Self-hosted only: no Google Fonts or other third-party font requests.
  expect(fontRequests.length).toBeGreaterThan(0);
  for (const r of fontRequests) expect(r).toMatch(/^localhost:\d+\/fonts\//);
});
