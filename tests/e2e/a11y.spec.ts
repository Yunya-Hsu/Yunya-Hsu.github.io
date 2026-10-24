import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { allPages } from './pages';

for (const path of [...allPages, '/404.html']) {
  test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
