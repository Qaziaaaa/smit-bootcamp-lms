import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers.js';
import { loginAs, createProject, createTask, uniq } from '../api/helpers.js';

function projectRow(page, title) {
  return page.locator('tr', { hasText: title });
}

test.describe('Projects page (UI)', () => {
  test('admin can create a project', async ({ page, request }) => {
    await loginAs(request);
    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/projects');

    const title = `UI Project ${uniq('create')}`;
    await page.getByRole('button', { name: 'Add Project' }).click();
    await expect(page.getByRole('heading', { name: /Add Project/ })).toBeVisible();
    await page.getByLabel('Project Title *').fill(title);
    await page.getByLabel('Description').fill('Created through the UI');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Project created successfully')).toBeVisible();
    await expect(projectRow(page, title)).toBeVisible();
  });

  test('admin can edit a project', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const project = await createProject(request, adminToken);
    const newTitle = `UI Project ${uniq('renamed')}`;

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/projects');

    const row = projectRow(page, project.title);
    await expect(row).toBeVisible();
    await row.locator('[title="Edit project"]').click();

    await expect(page.getByText('Edit Project')).toBeVisible();
    await page.getByLabel('Project Title *').fill(newTitle);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Project updated successfully')).toBeVisible();
    await expect(projectRow(page, newTitle)).toBeVisible();
  });

  test('admin can delete a project', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const project = await createProject(request, adminToken);

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/projects');

    const row = projectRow(page, project.title);
    await expect(row).toBeVisible();
    await row.locator('[title="Delete project"]').click();

    await expect(page.getByText('Delete Project')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Project deleted successfully')).toBeVisible();
    await expect(projectRow(page, project.title)).toHaveCount(0);
  });

  test('project detail shows its tasks and can create a task', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const project = await createProject(request, adminToken);
    const task = await createTask(request, adminToken, { projectId: project._id });

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto(`/projects/${project._id}`);

    await expect(page.getByText(`Project — ${project.title}`)).toBeVisible();
    await expect(page.getByText(task.title)).toBeVisible();

    const newTaskTitle = `UI Task ${uniq('create')}`;
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByLabel('Task Title *').fill(newTaskTitle);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Task created successfully')).toBeVisible();
    await expect(page.getByText(newTaskTitle)).toBeVisible();
  });

  test('viewing a project opens the detail page', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const project = await createProject(request, adminToken);

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/projects');

    const row = projectRow(page, project.title);
    await expect(row).toBeVisible();
    await row.locator('[title="View project"]').click();

    await page.waitForURL(new RegExp(`/projects/${project._id}`));
    await expect(page.getByText(`Project — ${project.title}`)).toBeVisible();
  });
});
