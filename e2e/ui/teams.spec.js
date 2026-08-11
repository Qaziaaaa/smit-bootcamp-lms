import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers.js';
import { loginAs, createTeam, createStudent, uniq } from '../api/helpers.js';

function teamRow(page, name) {
  return page.locator('tr', { hasText: name });
}

test.describe('Teams page (UI)', () => {
  test('admin can create a team', async ({ page, request }) => {
    await loginAs(request);
    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/teams');

    const name = `UI Team ${uniq('create')}`;
    await page.getByRole('button', { name: 'Add Team' }).click();
    await expect(page.getByText('Add New Team')).toBeVisible();
    await page.getByLabel('Team Name').fill(name);
    await page.getByRole('button', { name: 'Create Team' }).click();

    await expect(page.getByText('Team created successfully')).toBeVisible();
    await expect(teamRow(page, name)).toBeVisible();
  });

  test('admin can rename a team', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const team = await createTeam(request, adminToken, `UI Team ${uniq('rename')}`);
    const newName = `UI Team ${uniq('renamed')}`;

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/teams');

    const row = teamRow(page, team.name);
    await expect(row).toBeVisible();
    await row.getByRole('button').nth(1).click(); // Edit

    await expect(page.getByText('Edit Team')).toBeVisible();
    await page.getByLabel('Team Name').fill(newName);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText('Team updated successfully')).toBeVisible();
    await expect(teamRow(page, newName)).toBeVisible();
  });

  test('admin can delete a team', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const team = await createTeam(request, adminToken, `UI Team ${uniq('delete')}`);

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/teams');

    const row = teamRow(page, team.name);
    await expect(row).toBeVisible();
    await row.getByRole('button').nth(2).click(); // Delete

    await expect(page.getByText('Delete Team')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Team deleted successfully')).toBeVisible();
    await expect(teamRow(page, team.name)).toHaveCount(0);
  });

  test('admin can assign a student to a team', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const team = await createTeam(request, adminToken, `UI Team ${uniq('assign')}`);
    const student = await createStudent(request, adminToken);

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto(`/teams/${team._id}`);
    await expect(page.getByText(`Team — ${team.name}`)).toBeVisible();

    await page.getByRole('button', { name: 'Assign Student' }).click();
    await expect(page.getByText('Assign Student to Team')).toBeVisible();

    await page.getByRole('dialog').getByRole('combobox').click();
    await page
      .getByRole('option', { name: new RegExp(student.name) })
      .click();

    await page.getByRole('button', { name: 'Assign' }).click();

    await expect(page.getByText('Student assigned to team')).toBeVisible();
    await expect(page.getByText(student.name)).toBeVisible();
  });

  test('viewing a team opens the detail page', async ({ page, request }) => {
    const adminToken = await loginAs(request);
    const team = await createTeam(request, adminToken, `UI Team ${uniq('view')}`);

    await loginViaUi(page, { email: 'admin@lms.com', password: 'password123', role: 'admin' });
    await page.goto('/teams');

    const row = teamRow(page, team.name);
    await expect(row).toBeVisible();
    await row.getByRole('button').nth(0).click(); // View

    await page.waitForURL(new RegExp(`/teams/${team._id}`));
    await expect(page.getByText(`Team — ${team.name}`)).toBeVisible();
  });
});
