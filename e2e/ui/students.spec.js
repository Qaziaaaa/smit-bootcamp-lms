import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers.js';
import { loginAs, createStudent, uniq, API_BASE, authHeaders } from '../api/helpers.js';

function studentRow(page, email) {
  return page.locator('tr', { hasText: email });
}

test.describe('Students page (UI)', () => {
  test('admin can create a student', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.waitForURL('**/dashboard');

    await page.goto('/students');
    await page.getByRole('button', { name: 'Add New Student' }).click();

    const u = uniq('ui');
    await page.getByLabel('Full Name').fill(`UI Student ${u}`);
    const email = `${u}@ui-test.com`;
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Phone Number').fill('03123456789');
    await page.getByLabel('Batch').fill('SMIT-Bootcamp-LMS3');
    await page.getByLabel('Initial Password').fill('password123');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Student created successfully')).toBeVisible();
    await expect(studentRow(page, email)).toBeVisible();
  });

  test('admin can edit a student', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const newPhone = '03211234567';

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/students');

    const row = studentRow(page, student.email);
    await expect(row).toBeVisible();
    await row.getByRole('button').nth(1).click(); // Edit

    const phoneField = page.getByLabel('Phone Number');
    await phoneField.fill(newPhone);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Student updated successfully')).toBeVisible();
    const res = await request.get(`${API_BASE}/students/${student._id}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.phone).toBe(newPhone);
  });

  test('admin can delete a student', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/students');

    const row = studentRow(page, student.email);
    await expect(row).toBeVisible();
    await row.getByRole('button').nth(2).click(); // Delete

    await expect(page.getByText('Delete Student')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Student deleted successfully')).toBeVisible();
    await expect(studentRow(page, student.email)).toHaveCount(0);
  });

  test('search filters the student roster', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const needleName = `Needle ${uniq('ui')}`;
    const needle = await createStudent(request, adminToken, { name: needleName });
    await createStudent(request, adminToken, { name: `Noise ${uniq('ui')}` });

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/students');

    await page.getByPlaceholder('Search student by name or email...').fill(needle.email);
    await expect(studentRow(page, needle.email)).toBeVisible();
    await expect(page.getByText('Noise ', { exact: false })).toHaveCount(0);
  });

  test('viewing a student opens the detail page', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/students');

    const row = studentRow(page, student.email);
    await expect(row).toBeVisible();
    await row.getByRole('button').nth(0).click(); // View

    await page.waitForURL(new RegExp(`/students/${student._id}`));
    await expect(page.getByText(`Student — ${student.name}`)).toBeVisible();
  });
});
