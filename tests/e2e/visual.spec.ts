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

test('logo is 111px tall on phones, 149px on tablets and 128px in the desktop sidebar', async ({ page, isMobile }) => {
  const height = async () => (await page.locator('.logo img').boundingBox())!.height;
  await page.goto('/');
  if (isMobile) {
    expect(await height()).toBeCloseTo(111, 0);
    return;
  }
  await page.setViewportSize({ width: 800, height: 900 });
  expect(await height()).toBeCloseTo(149, 0);
  await page.setViewportSize({ width: 1280, height: 800 });
  expect(await height()).toBeCloseTo(128, 0);
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

test.describe('dark frame (SPEC 2.1)', () => {
  const FRAME = 'rgb(69, 64, 58)';

  test('the header is dark and shows the light logo', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toHaveCSS('background-color', FRAME);
    const src = await page.locator('.logo img').getAttribute('src');
    const svg = await (await request.get(src!)).text();
    expect(svg).toContain('fill="#f4f1ea"');
  });

  test('nav items are light, and hover flips to a light patch with dark text', async ({ page, isMobile }) => {
    await page.goto('/');
    const about = page.getByRole('link', { name: 'About', exact: true });
    await expect(about).toHaveCSS('color', 'rgb(203, 196, 184)');
    await expect(page.locator('summary', { hasText: 'Work' })).toHaveCSS('color', 'rgb(244, 241, 234)');
    if (isMobile) return;
    await about.hover();
    await expect(about).toHaveCSS('background-color', 'rgb(238, 234, 226)');
    await expect(about).toHaveCSS('color', 'rgb(47, 44, 39)');
  });

  test('the Work menu is dark beside the sidebar, and keeps the wall’s colours under the top header', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'hover');
    const panel = page.locator('#work-menu ul');
    const prints = page.locator('#work-menu').getByRole('link', { name: 'Limited Edition Prints' });
    await page.goto('/about/');
    // From 1024px it grows out of the sidebar, so it is never half on the frame and half on the wall.
    await page.locator('summary', { hasText: 'Work' }).hover();
    await expect(panel).toHaveCSS('background-color', FRAME);
    await expect(prints).toHaveCSS('color', 'rgb(203, 196, 184)');
    // Under the top header it hangs over the page.
    await page.mouse.move(5, 5);
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.locator('summary', { hasText: 'Work' }).hover();
    await expect(panel).toHaveCSS('background-color', 'rgb(238, 234, 226)');
    await expect(prints).toHaveCSS('color', 'rgb(98, 93, 82)');
  });

  test('on phones the footer is a dark band like the header', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone layout');
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toHaveCSS('background-color', FRAME);
  });

  test('on desktop the footer has no band and the icons sit on the dark sidebar', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop layout');
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Instagram' })).toHaveCSS(
      'color',
      'rgb(203, 196, 184)',
    );
  });
});
