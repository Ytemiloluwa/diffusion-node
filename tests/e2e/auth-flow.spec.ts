import { expect, test } from '@playwright/test';

const password = 'E2e-auth-password-2026!';

test('registers a user, reaches the dashboard, and logs in again', async ({ page }) => {
  const email = `e2e-${Date.now()}-${test.info().workerIndex}@diffusion-node.test`;

  await page.goto('/auth');
  await expect(page.getByRole('heading', { name: 'Access policy intelligence' })).toBeVisible();

  await page.getByRole('tab', { name: 'Register' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByLabel('API key label').fill('E2E registration session');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

  await page.evaluate('window.localStorage.clear()');
  await page.goto('/auth');

  await page.getByRole('tab', { name: 'Login' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('API key label').fill('E2E login session');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Policy Explorer' })).toBeVisible();
});
