import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers.js';
import { loginAs, createStudent, markAttendance, todayISO } from '../api/helpers.js';

test.describe('Attendance page (UI)', () => {
  test('admin can mark a student present for today', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    await markAttendance(request, adminToken, {
      studentId: student._id,
      date: todayISO(),
      status: 'absent',
    });

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/attendance');

    await page.getByPlaceholder('Search student...').fill(student.name);
    const row = page.locator('tr', { hasText: student.name });
    await expect(row).toBeVisible();
    await expect(row).toContainText('absent');

    await row.locator('input[type="checkbox"]').click();

    await expect(page.getByText('Marked as present')).toBeVisible();
    await expect(row).toContainText('present');
    await expect(page.getByText('Total Present')).toBeVisible();
  });

  test('attendance persists after reload', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    await markAttendance(request, adminToken, {
      studentId: student._id,
      date: todayISO(),
      status: 'present',
    });

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/attendance');

    await page.getByPlaceholder('Search student...').fill(student.name);
    const row = page.locator('tr', { hasText: student.name });
    await expect(row).toContainText('present');

    await page.reload();
    await page.getByPlaceholder('Search student...').fill(student.name);
    const rowAfterReload = page.locator('tr', { hasText: student.name });
    await expect(rowAfterReload).toContainText('present');
  });
});
