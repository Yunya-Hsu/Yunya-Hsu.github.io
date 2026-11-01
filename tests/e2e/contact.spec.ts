import { expect, test, type Page, type Route } from '@playwright/test';

// SPEC 5.5. The form posts to Formspree; every test answers for Formspree, so nothing is ever really sent.
const FORMSPREE = 'https://formspree.io/f/**';

const form = (page: Page) => page.locator('form.contact-form');
const field = (page: Page, name: string) => page.getByLabel(name, { exact: false });
const send = (page: Page) => page.getByRole('button', { name: 'Send' });

async function fillIn(page: Page) {
  await field(page, 'First name').fill('Ada');
  await field(page, 'Last name').fill('Lovelace');
  await field(page, 'Email').fill('ada@example.com');
  await field(page, 'Message').fill('I would like to license a print.');
}

test('Contact is the last item in the header nav and is current on its page', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.locator('.nav-item')).toHaveText(['Work', 'About', 'Contact']);
  await nav.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL('/contact/');
  await expect(page).toHaveTitle('Contact — Yunya Hsu');
  await expect(page.getByRole('heading', { level: 1, name: 'Contact' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'About', exact: true })).not.toHaveAttribute('aria-current');
});

test('shows the greeting, what Yunya is open to, and a form with first and last name, email and message, all required', async ({
  page,
}) => {
  await page.goto('/contact/');
  const main = page.getByRole('main');
  await expect(main.getByText('Hello,', { exact: true })).toBeVisible();
  await expect(main.getByText("I'm open to:", { exact: true })).toBeVisible();
  await expect(main.getByRole('listitem')).toHaveText(['Commissioned Works', 'Stockists', 'Literary Agencies']);
  // No separate "Name" heading over the two name fields.
  await expect(main.getByText('Name', { exact: true })).toHaveCount(0);
  for (const [name, autocomplete] of [
    ['First name', 'given-name'],
    ['Last name', 'family-name'],
    ['Email', 'email'],
  ]) {
    await expect(field(page, name)).toBeVisible();
    await expect(field(page, name)).toHaveAttribute('required');
    await expect(field(page, name)).toHaveAttribute('autocomplete', autocomplete);
  }
  await expect(field(page, 'Email')).toHaveAttribute('type', 'email');
  await expect(field(page, 'Message')).toHaveJSProperty('tagName', 'TEXTAREA');
  await expect(field(page, 'Message')).toHaveAttribute('required');
  await expect(main.getByText('(required)')).toHaveCount(4);
  // No email address anywhere on the page (SPEC 1).
  await expect(page.locator('body')).not.toContainText('@example');
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test('posts to Formspree, with a hidden honeypot and no reCAPTCHA', async ({ page }) => {
  const thirdParty: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost')) thirdParty.push(r.url());
  });
  await page.goto('/contact/');
  await expect(form(page)).toHaveAttribute('action', /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/);
  await expect(form(page)).toHaveAttribute('method', 'POST');
  const honeypot = form(page).locator('input[name="_gotcha"]');
  await expect(honeypot).toBeHidden();
  await expect(page.getByRole('textbox')).toHaveCount(4);
  // Loading the page talks to no one else: no reCAPTCHA, no Formspree script (SPEC 8).
  await page.waitForLoadState('networkidle');
  expect(thirdParty).toEqual([]);
});

test('a sent message replaces the form with a thank-you', async ({ page }) => {
  let body: Record<string, unknown> | undefined;
  let accept: string | undefined;
  await page.route(FORMSPREE, async (route) => {
    const request = route.request();
    accept = (await request.headerValue('accept')) ?? undefined;
    const data = request.postDataBuffer()?.toString() ?? '';
    // FormData is sent as multipart; pick out each field's value.
    body = Object.fromEntries(
      [...data.matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)/g)].map(([, name, value]) => [name, value]),
    );
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/contact/');
  await fillIn(page);
  await send(page).click();

  const status = page.getByRole('status');
  await expect(status).toHaveText("Thank you — your message has been sent. I'll get back to you soon.");
  await expect(status).toBeFocused();
  await expect(form(page)).toBeHidden();
  expect(accept).toBe('application/json');
  expect(body).toEqual({
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada@example.com',
    message: 'I would like to license a print.',
    _subject: 'New message from Yours, Yunya',
    _gotcha: '',
  });
});

const failures: [string, (route: Route) => Promise<void>][] = [
  ['Formspree refuses it', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: '{}' })],
  ['the network fails', (route) => route.abort()],
];

for (const [why, answer] of failures) {
  test(`when ${why}, says so and keeps what was written`, async ({ page }) => {
    await page.route(FORMSPREE, answer);
    await page.goto('/contact/');
    await fillIn(page);
    await send(page).click();

    await expect(page.getByRole('status')).toHaveText(
      "Sorry, your message couldn't be sent. Please try again in a moment, or message me on Instagram.",
    );
    await expect(form(page)).toBeVisible();
    await expect(field(page, 'Message')).toHaveValue('I would like to license a print.');
    await expect(send(page)).toBeEnabled();
    await expect(send(page)).toHaveText('Send');
  });
}

test('the button says it is sending, and cannot be pressed twice', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  let posts = 0;
  await page.route(FORMSPREE, async (route) => {
    posts++;
    await held;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/contact/');
  await fillIn(page);
  await send(page).click();
  const sending = page.getByRole('button', { name: 'Sending…' });
  await expect(sending).toBeDisabled();
  await sending.click({ force: true });
  release();
  await expect(page.getByRole('status')).toContainText('Thank you');
  expect(posts).toBe(1);
});

test('an empty form is not sent', async ({ page }) => {
  let posts = 0;
  await page.route(FORMSPREE, (route) => {
    posts++;
    return route.abort();
  });
  await page.goto('/contact/');
  await send(page).click();
  await expect(field(page, 'First name')).toBeFocused();
  await field(page, 'First name').fill('Ada');
  await field(page, 'Last name').fill('Lovelace');
  await field(page, 'Email').fill('not an email');
  await field(page, 'Message').fill('Hi');
  await send(page).click();
  await expect(field(page, 'Email')).toBeFocused();
  expect(posts).toBe(0);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the form still posts to Formspree', async ({ page }) => {
    let method: string | undefined;
    await page.route(FORMSPREE, (route) => {
      method = route.request().method();
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Thanks!</p>' });
    });
    await page.goto('/contact/');
    await fillIn(page);
    await send(page).click();
    await expect(page.getByText('Thanks!')).toBeVisible();
    expect(method).toBe('POST');
  });
});

test('greeting beside the form from 1024px, above it on smaller screens', async ({ page, isMobile }) => {
  const layout = async () => {
    const intro = (await page.getByText('Hello,', { exact: true }).boundingBox())!;
    const name = (await field(page, 'First name').boundingBox())!;
    const last = (await field(page, 'Last name').boundingBox())!;
    return { intro, name, last };
  };
  await page.goto('/contact/');
  if (!isMobile) {
    await page.setViewportSize({ width: 1280, height: 800 });
    const { intro, name } = await layout();
    expect(name.x).toBeGreaterThan(intro.x + intro.width);
    await page.setViewportSize({ width: 800, height: 1000 });
  }
  const { intro, name, last } = await layout();
  expect(name.y).toBeGreaterThan(intro.y + intro.height);
  // First and last name stay side by side, even on phones.
  expect(last.y).toBeCloseTo(name.y, 0);
  expect(last.x).toBeGreaterThan(name.x + name.width);
  expect(last.x + last.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('the title matches the About page: same style, rule and place on the page', async ({ page }) => {
  const title = async (path: string, name: string) => {
    await page.goto(path);
    const heading = page.getByRole('heading', { level: 1, name });
    await expect(heading).toBeVisible();
    const { x, y } = (await heading.boundingBox())!;
    const style = await heading.evaluate((el) => {
      const { fontSize, fontWeight, letterSpacing } = getComputedStyle(el);
      return { fontSize, fontWeight, letterSpacing, rule: getComputedStyle(el, '::after').width };
    });
    return { x, y, style };
  };
  const about = await title('/about/', 'About');
  const contact = await title('/contact/', 'Contact');
  expect(contact.style).toEqual(about.style);
  expect(contact.y).toBeCloseTo(about.y, 0);
  expect(contact.x).toBeCloseTo(about.x, 0);
});

test('the text matches the About page: same size, line height and letter-spacing', async ({ page }) => {
  const text = async (path: string) => {
    await page.goto(path);
    return page
      .getByRole('main')
      .locator('p')
      .first()
      .evaluate((el) => {
        const { fontSize, lineHeight, letterSpacing, fontWeight } = getComputedStyle(el);
        return { fontSize, lineHeight, letterSpacing, fontWeight };
      });
  };
  expect(await text('/contact/')).toEqual(await text('/about/'));
});

test('"Hello," is the first line of the text under the title, not a second title', async ({ page }) => {
  await page.goto('/contact/');
  const hello = page.getByText('Hello,', { exact: true });
  await expect(hello).toHaveCSS('font-size', '15px');
  const title = (await page.getByRole('heading', { level: 1, name: 'Contact' }).boundingBox())!;
  expect((await hello.boundingBox())!.y).toBeGreaterThan(title.y + title.height - 1);
});

test('the form starts level with the title from 1024px', async ({ page, isMobile }) => {
  test.skip(isMobile, 'stacked on phones');
  await page.goto('/contact/');
  const title = (await page.getByRole('heading', { level: 1, name: 'Contact' }).boundingBox())!;
  const form = (await page.locator('form.contact-form').boundingBox())!;
  expect(form.y).toBeCloseTo(title.y, 0);
});
