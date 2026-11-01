import { expect, test } from '@playwright/test';

const box = async (locator: import('@playwright/test').Locator) => (await locator.boundingBox())!;

test.beforeEach(async ({ page }) => {
  await page.goto('/about/');
});

test('the avatar is a loaded, upright 4:5 rectangle with alt text and the print shadow', async ({ page }) => {
  const avatar = page.getByRole('img', { name: 'Photo of Yunya Hsu' });
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveCSS('border-radius', '0px');
  await expect(avatar).not.toHaveCSS('box-shadow', 'none');
  const { width, height } = await box(avatar);
  expect(height / width).toBeCloseTo(1.25, 1);
  // The file itself, not only its box: object-fit would quietly crop a picture of another shape.
  const natural = await avatar.evaluate((img: HTMLImageElement) => img.naturalHeight / img.naturalWidth);
  expect(natural).toBeCloseTo(1.25, 1);
});

test('the avatar is not lazy: it is on the first screen', async ({ page }) => {
  await expect(page.getByRole('img', { name: 'Photo of Yunya Hsu' })).toHaveAttribute('loading', 'eager');
});

test('the avatar is 260px wide beside the sidebar and 220px on tablets', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop and tablet layouts');
  const avatar = page.getByRole('img', { name: 'Photo of Yunya Hsu' });
  expect((await box(avatar)).width).toBeCloseTo(260, 0);
  await page.setViewportSize({ width: 800, height: 900 });
  expect((await box(avatar)).width).toBeCloseTo(220, 0);
});

test('from 600px the text is on the left and the photo beside it, with their tops level', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'phones stack them');
  for (const width of [1440, 800, 600]) {
    await page.setViewportSize({ width, height: 900 });
    const avatar = await box(page.getByRole('img', { name: 'Photo of Yunya Hsu' }));
    const title = await box(page.getByRole('heading', { name: 'About', level: 1 }));
    expect(avatar.x, `at ${width}px`).toBeGreaterThanOrEqual(title.x + title.width);
    expect(title.y, `at ${width}px`).toBeCloseTo(avatar.y, 0);
  }
});

test('on phones the photo hangs centred under the text, 240px wide and 40px below it', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout');
  const column = await box(page.locator('.about'));
  const avatar = await box(page.getByRole('img', { name: 'Photo of Yunya Hsu' }));
  const text = await box(page.getByRole('main').locator('p').last());
  expect(avatar.width).toBeCloseTo(240, 0);
  expect(avatar.x + avatar.width / 2).toBeCloseTo(column.x + column.width / 2, 0);
  expect(avatar.y - (text.y + text.height)).toBeCloseTo(40, 0);
});

test('the content is centred on the wall as a block, at most 804px wide', async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 2000, height: 900 });
  const { x, width } = await box(page.locator('.about'));
  expect(width).toBeLessThanOrEqual(804);
  const main = await box(page.getByRole('main'));
  expect(x + width / 2).toBeCloseTo(main.x + main.width / 2, 0);
});

test('the title and bio are left-aligned, with the rule at the left edge', async ({ page }) => {
  const title = page.getByRole('heading', { name: 'About', level: 1 });
  await expect(title).toHaveCSS('text-align', 'start');
  await expect(page.getByRole('main').locator('p').first()).toHaveCSS('text-align', 'start');
  expect(await title.evaluate((el) => getComputedStyle(el, '::after').marginLeft)).toBe('0px');
});

test('the title is visible, in the About style, over a 32px rule', async ({ page }) => {
  const title = page.getByRole('heading', { name: 'About', level: 1 });
  await expect(title).toBeVisible();
  await expect(title).toHaveCSS('font-size', '28px');
  await expect(title).toHaveCSS('font-weight', '500');
  await expect(title).toHaveCSS('letter-spacing', '3.36px');
  const rule = await title.evaluate((el) => {
    const after = getComputedStyle(el, '::after');
    return { width: after.width, height: after.height, background: after.backgroundColor };
  });
  expect(rule).toEqual({ width: '32px', height: '1px', background: 'rgb(47, 44, 39)' });
});

test('shows the bio in the small text of the About and Contact pages', async ({ page }) => {
  const paragraphs = page.getByRole('main').locator('p');
  await expect(paragraphs).toHaveCount(3);
  await expect(paragraphs.first()).toContainText("I'm Yunya Hsu, an illustrator and software engineer based in Taiwan");
  await expect(paragraphs.first()).toHaveCSS('font-size', '15px');
  await expect(paragraphs.nth(1)).toContainText('If I can do it, so can you :)');
  await expect(paragraphs.nth(2)).toContainText('Procreate is my main tool');
});

test('the page starts 48px from the top beside the sidebar, 32px below the header band otherwise', async ({
  page,
  isMobile,
}) => {
  const content = page.locator('.about');
  if (isMobile) {
    const header = await box(page.getByRole('banner'));
    expect((await box(content)).y - (header.y + header.height)).toBeCloseTo(32, 0);
  } else {
    expect((await box(content)).y).toBeCloseTo(48, 0);
  }
});

test('the footer stays 120px below the content', async ({ page, isMobile }) => {
  // On a tall screen the footer sits at the bottom of the screen instead, further away.
  if (!isMobile) await page.setViewportSize({ width: 1280, height: 400 });
  const content = await box(page.locator('.about'));
  const footer = await box(page.getByRole('contentinfo'));
  expect(footer.y - (content.y + content.height)).toBeCloseTo(120, 0);
});
