import { expect, test, type Page } from '@playwright/test';

const works = (page: Page) => page.locator('.wall > li');

test('home is the Limited Edition Prints wall, in order, with title and year under each work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Limited Edition Prints');
  await expect(page).toHaveTitle('Yunya Hsu — Illustration');
  await expect(works(page)).toHaveCount(5);
  const first = works(page).first();
  await expect(first.getByRole('link')).toHaveAttribute('href', '/works/placeholder-1/');
  await expect(first.locator('.title')).toHaveText('Placeholder Street Corner');
  await expect(first.locator('.year')).toHaveText('2025');
  await expect(first.getByRole('img')).toHaveAttribute('alt', 'Placeholder colour gradient');
  await expect(works(page).nth(1).getByRole('link')).toHaveAttribute('href', '/works/placeholder-2/');
});

test('/postcards/ shows only postcards', async ({ page }) => {
  await page.goto('/postcards/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Postcards');
  await expect(page).toHaveTitle('Postcards — Yunya Hsu');
  const links = await works(page).getByRole('link').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(links).toEqual(['/works/placeholder-4/', '/works/placeholder-7/', '/works/placeholder-8/']);
});

test('the category name is a heading for screen readers only', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveClass(/sr-only/);
});

test('the wall works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/postcards/');
  await expect(works(page)).toHaveCount(3);
  await context.close();
});

test.describe('grid', () => {
  const columns = async (page: Page) =>
    new Set(await page.locator('.wall .cell').evaluateAll((cells) => cells.map((c) => Math.round(c.getBoundingClientRect().left)))).size;

  test('has 1, 2 and 3 columns on phone, tablet and desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'resizes the window itself');
    for (const [width, count] of [
      [400, 1],
      [800, 2],
      [1280, 3],
    ]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      expect(await columns(page), `${width}px`).toBe(count);
    }
  });

  test('cells are 4:5 and works fit inside uncropped, centred on the cell', async ({ page }) => {
    for (const path of ['/', '/postcards/']) {
      await page.goto(path);
      for (const item of await works(page).all()) {
        const img = item.getByRole('img');
        await img.scrollIntoViewIfNeeded();
        await expect(img).toHaveJSProperty('complete', true);
        const cell = (await item.locator('.cell').boundingBox())!;
        const box = (await img.boundingBox())!;
        const natural = await img.evaluate((el: HTMLImageElement) => el.naturalWidth / el.naturalHeight);

        expect(cell.width / cell.height).toBeCloseTo(0.8, 2);
        expect(box.width / box.height).toBeCloseTo(natural, 1);
        expect(box.width).toBeLessThanOrEqual(cell.width + 0.5);
        expect(box.height).toBeLessThanOrEqual(cell.height + 0.5);
        // Either the width or the height fills the cell.
        expect(Math.max(box.width / cell.width, box.height / cell.height)).toBeCloseTo(1, 1);
        // Centred both ways.
        expect(box.y + box.height / 2).toBeCloseTo(cell.y + cell.height / 2, 0);
        expect(box.x + box.width / 2).toBeCloseTo(cell.x + cell.width / 2, 0);
      }
    }
  });

  test('titles in the same row line up, 20px below the cell', async ({ page, isMobile }) => {
    test.skip(isMobile, 'one column has no rows to compare');
    await page.goto('/');
    // The first row mixes a portrait, a landscape and a square work.
    const tops = await page.locator('.wall .title').evaluateAll((titles) =>
      titles.slice(0, 3).map((t) => t.getBoundingClientRect().top),
    );
    expect(new Set(tops.map(Math.round)).size).toBe(1);
    const cell = (await works(page).first().locator('.cell').boundingBox())!;
    const title = (await works(page).first().locator('.title').boundingBox())!;
    expect(title.y - (cell.y + cell.height)).toBeGreaterThanOrEqual(20);
    expect(title.y - (cell.y + cell.height)).toBeLessThan(28);
  });

  test('loads the first row eagerly and lazy-loads the rest', async ({ page }) => {
    await page.goto('/');
    const loading = await page.locator('.wall img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('loading')));
    expect(loading).toEqual(['eager', 'eager', 'eager', 'lazy', 'lazy']);
  });
});
