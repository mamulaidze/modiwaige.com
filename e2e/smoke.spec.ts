import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD;
const runAuthTests = Boolean(testEmail && testPassword);

test.describe('guest smoke', () => {
  test('guest can browse the feed', async ({ page }) => {
    await page.goto('/en');

    await expect(page).toHaveURL(/\/en/);
    await expect(
      page.getByRole('main').getByRole('heading').first(),
    ).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });

  test('guest can switch between English and Georgian', async ({ page }) => {
    await page.goto('/en');

    await page.getByTestId('language-switcher').filter({ visible: true }).click();
    await page.getByRole('menuitem', { name: /ქართული/i }).click();
    await expect(page).toHaveURL(/\/ge/);

    await page.getByTestId('language-switcher').filter({ visible: true }).click();
    await page.getByRole('menuitem', { name: /english/i }).click();
    await expect(page).toHaveURL(/\/en/);
  });

  test('guest admin route redirects away from admin tools', async ({
    page,
  }) => {
    await page.goto('/en/admin');

    await expect(page).not.toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  });
});

test.describe('accessibility smoke', () => {
  for (const path of ['/en', '/en/login', '/en/register']) {
    test(`${path} has no serious accessibility violations`, async ({
      page,
    }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const seriousViolations = results.violations.filter(
        ({ impact }) => impact === 'serious' || impact === 'critical',
      );

      expect(seriousViolations).toEqual([]);
    });
  }
});

test.describe('auth smoke', () => {
  test.skip(
    !runAuthTests,
    'Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD to run auth flows.',
  );

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('configured user can log in', async ({ page }) => {
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('configured user can open create post flow', async ({ page }) => {
    await page.goto('/en/create');

    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /create post/i }),
    ).toBeVisible();
  });

  test('configured user can see own post management surface', async ({
    page,
  }) => {
    await page.goto('/en/profile');

    await expect(page.getByRole('button', { name: /my posts/i })).toBeVisible();
  });
});

test.describe('optional manual auth flows', () => {
  test.skip(
    !runAuthTests,
    'Register/create/reserve/edit/delete smoke needs isolated Supabase test data and configured credentials.',
  );

  test('registration page is reachable for isolated test-account strategy', async ({
    page,
  }) => {
    await page.goto('/en/register');

    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /create account/i }),
    ).toBeVisible();
  });

  test('reserve, edit, and delete flows have reachable controls when data exists', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/en');

    const firstPost = page.locator('article').first();
    test.skip(
      (await firstPost.count()) === 0,
      'No seed post exists to exercise reserve/edit/delete controls.',
    );

    await firstPost.getByRole('link').first().click();
    await expect(page.getByRole('main')).toBeVisible();
  });
});

async function login(page: import('@playwright/test').Page) {
  await page.goto('/en/login');
  await page.getByLabel(/email/i).fill(testEmail ?? '');
  await page.getByLabel(/password/i).fill(testPassword ?? '');
  await page.getByRole('button', { name: /^log in$/i }).click();
  await expect(page).toHaveURL(/\/profile/, { timeout: 15_000 });
}
