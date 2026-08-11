import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers.js';
import {
  loginAs,
  authHeaders,
  createStudent,
  createTeam,
  createProject,
  createTask,
  markAttendance,
  todayISO,
  uniq,
} from '../api/helpers.js';

async function seedPortalContext(request) {
  const adminToken = await loginAs(request);
  const team = await createTeam(request, adminToken, `Portal Team ${uniq('ui')}`);
  const project = await createProject(request, adminToken, { teamId: team._id });
  const student = await createStudent(request, adminToken);
  const assignRes = await request.post(`http://localhost:5000/api/teams/${team._id}/students`, {
    data: { studentIds: [student._id] },
    headers: authHeaders(adminToken),
  });
  if (assignRes.status() !== 200) {
    throw new Error(`Failed to assign student to team: ${assignRes.status()}`);
  }
  const task = await createTask(request, adminToken, {
    projectId: project._id,
    assignedTo: student._id,
  });
  await markAttendance(request, adminToken, {
    studentId: student._id,
    date: todayISO(),
    status: 'present',
  });
  return { adminToken, team, project, student, task };
}

test.describe('Student portal (UI)', () => {
  test('student dashboard shows profile, team, attendance and tasks', async ({ page, request }) => {
    const { student, team, project, task } = await seedPortalContext(request);

    await loginViaUi(page, { email: student.email, password: 'password123', role: 'student' });
    await page.waitForURL('**/student/dashboard');

    await expect(page.getByText(`Welcome back, ${student.name}!`)).toBeVisible();
    await expect(page.getByRole('main').getByText('My Attendance')).toBeVisible();
    await expect(page.getByText('1/1')).toBeVisible();
    await expect(page.getByRole('main').getByText('My Team')).toBeVisible();
    await expect(page.getByRole('main').getByText(team.name, { exact: true })).toBeVisible();
    await expect(page.getByText(task.title)).toBeVisible();
    await expect(page.getByText('Sprint Tasks Assigned To You')).toBeVisible();
  });

  test('student can start and complete a task from the dashboard', async ({ page, request }) => {
    const { student, task } = await seedPortalContext(request);

    await loginViaUi(page, { email: student.email, password: 'password123', role: 'student' });
    await page.waitForURL('**/student/dashboard');
    await expect(page.getByText(task.title)).toBeVisible();

    await page.getByRole('button', { name: 'Start Work' }).click();
    await expect(page.getByText('In Progress', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Mark Completed' }).click();
    await expect(page.getByText('Completed', { exact: true })).toBeVisible();
  });

  test('my tasks page lists the assigned project and progress', async ({ page, request }) => {
    const { student, project, task } = await seedPortalContext(request);

    await loginViaUi(page, { email: student.email, password: 'password123', role: 'student' });
    await page.waitForURL('**/student/dashboard');

    await page.getByRole('link', { name: 'My Tasks' }).click();
    await page.waitForURL('**/student/tasks');

    await expect(page.getByRole('main').getByText('My Tasks')).toBeVisible();
    await expect(page.getByText(task.title)).toBeVisible();
    await expect(page.getByText(`Project: ${project.title}`)).toBeVisible();
    await expect(page.getByText('Pending', { exact: true })).toHaveCount(2);
  });

  test('my attendance page shows the summary cards', async ({ page, request }) => {
    const { student } = await seedPortalContext(request);

    await loginViaUi(page, { email: student.email, password: 'password123', role: 'student' });
    await page.waitForURL('**/student/dashboard');

    await page.getByRole('link', { name: 'Attendance' }).click();
    await page.waitForURL('**/student/attendance');

    await expect(page.getByRole('main').getByText('My Attendance')).toBeVisible();
    await expect(page.getByText('Present', { exact: true })).toBeVisible();
    await expect(page.getByText('Absent', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Days', { exact: true })).toBeVisible();
    await expect(page.getByText('100%', { exact: true })).toBeVisible();
    await expect(page.getByText('Attendance History', { exact: true })).toBeVisible();
  });

  test('my team page shows team, members and linked project', async ({ page, request }) => {
    const { student, team, project } = await seedPortalContext(request);

    await loginViaUi(page, { email: student.email, password: 'password123', role: 'student' });
    await page.waitForURL('**/student/dashboard');

    await page.getByRole('link', { name: 'My Team' }).click();
    await page.waitForURL('**/student/team');

    await expect(page.getByRole('main').getByText('My Team')).toBeVisible();
    await expect(page.getByRole('main').getByText('Team Name')).toBeVisible();
    await expect(page.getByRole('main').getByText(team.name)).toBeVisible();
    await expect(page.getByRole('main').getByText('Team Members')).toBeVisible();
    await expect(page.getByRole('main').getByText(student.name)).toBeVisible();
    await expect(page.getByRole('main').getByText(student.email)).toBeVisible();
    await expect(page.getByRole('main').getByText(project.title)).toBeVisible();
  });
});
