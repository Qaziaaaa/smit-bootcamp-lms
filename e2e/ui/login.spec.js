import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers.js';
import { createStudent } from '../api/helpers.js';
import { loginAs, authHeaders, API_BASE, ADMIN_EMAIL, ADMIN_PASSWORD } from '../api/helpers.js';

test.describe('Login flow (UI)', () => {
  test('admin login lands on the dashboard', async ({ page }) => {
    await loginViaUi(page, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    await page.waitForURL('**/dashboard');
    await expect(page.getByText('SMIT Bootcamp Overview')).toBeVisible();
  });

  test('student login lands on the student dashboard', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);

    await loginViaUi(page, { email: student.email, password: 'password123', role: 'student' });
    await page.waitForURL('**/student/dashboard');
    await expect(page.getByText(`Welcome back, ${student.name}!`)).toBeVisible();
  });

  test('wrong credentials shows an error and stays on login', async ({ page }) => {
    await loginViaUi(page, { email: ADMIN_EMAIL, password: 'wrong-password', role: 'admin', stayOnLogin: true });
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/students');
    await page.waitForURL('**/login');
    await expect(page.locator('#login-email')).toBeVisible();
  });

  test('admin is denied access to the student area', async ({ page }) => {
    await loginViaUi(page, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    await page.waitForURL('**/dashboard');

    await page.goto('/student/dashboard');
    await expect(page.getByText('Access denied')).toBeVisible();
  });

  test('logout returns to the login page', async ({ page }) => {
    await loginViaUi(page, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    await page.waitForURL('**/dashboard');

    await page.getByText('Logout').click();
    await page.waitForURL('**/login');
    await expect(page.locator('#login-email')).toBeVisible();
  });
});
