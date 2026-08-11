import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers.js';
import { loginAs, createProject, createTask, createStudent, uniq } from '../api/helpers.js';

function taskRow(page, title) {
  return page.locator('tr', { hasText: title });
}

test.describe('Tasks page (UI)', () => {
  test('admin can create a task', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const project = await createProject(request, adminToken);

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/tasks');

    const title = `UI Task ${uniq('create')}`;
    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByRole('heading', { name: /Add Task/ })).toBeVisible();
    await page.getByLabel('Task Title *').fill(title);

    await page.getByRole('dialog').getByRole('combobox').first().click();
    await page.getByRole('option', { name: project.title }).click();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Task created successfully')).toBeVisible();
    await expect(taskRow(page, title)).toBeVisible();
  });

  test('mark all completed only affects the filtered project', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const project = await createProject(request, adminToken);
    const t1 = await createTask(request, adminToken, { projectId: project._id });
    const t2 = await createTask(request, adminToken, { projectId: project._id });

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/tasks');

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: project.title }).click();

    await expect(taskRow(page, t1.title)).toBeVisible();
    await expect(taskRow(page, t2.title)).toBeVisible();

    await page.getByRole('button', { name: 'Mark All Completed' }).click();
    await expect(page.getByText('Mark All Tasks Completed')).toBeVisible();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Mark All Completed' })
      .click();

    await expect(page.getByText('2 of 2 task(s) marked as completed')).toBeVisible();
    await expect(taskRow(page, t1.title)).toContainText('completed');
    await expect(taskRow(page, t2.title)).toContainText('completed');
  });

  test('admin can delete a task', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const project = await createProject(request, adminToken);
    const task = await createTask(request, adminToken, { projectId: project._id });

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/tasks');

    const row = taskRow(page, task.title);
    await expect(row).toBeVisible();
    await row.locator('[title="Delete task"]').click();

    await expect(page.getByText('Delete Task')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Task deleted successfully')).toBeVisible();
    await expect(taskRow(page, task.title)).toHaveCount(0);
  });
});
