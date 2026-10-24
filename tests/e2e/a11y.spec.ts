import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Every page on the site; extend this list as pages are added.
const pages = ['/', '/zh/'];

for (const path of pages) {
  test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
