import { test, expect } from '@playwright/test';
import {
  API_BASE,
  loginAs,
  authHeaders,
  uniq,
  createStudent,
  createTeam,
  createProject,
  createTask,
  markAttendance,
  todayISO,
} from './helpers.js';

async function loginAsStudent(request, email) {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password: 'password123' },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).data.token;
}

test.describe('Student Portal API', () => {
  test('profile returns the logged-in student', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const token = await loginAsStudent(request, student.email);

    const res = await request.get(`${API_BASE}/student/profile`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data._id).toBe(student._id);
    expect(body.data.email).toBe(student.email);
  });

  test('attendance returns records and summary for the student', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    await markAttendance(request, adminToken, { studentId: student._id, date: todayISO(), status: 'present' });

    const token = await loginAsStudent(request, student.email);
    const res = await request.get(`${API_BASE}/student/attendance`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.records.length).toBe(1);
    expect(body.data.summary.present).toBe(1);
    expect(body.data.summary.totalDays).toBe(1);
  });

  test('team returns null when unassigned', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const token = await loginAsStudent(request, student.email);

    const res = await request.get(`${API_BASE}/student/team`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    expect((await res.json()).data).toBeNull();
  });

  test('team returns the assigned team with members and project', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const team = await createTeam(request, adminToken, `Team ${uniq('portal')}`);
    await request.post(`${API_BASE}/teams/${team._id}/students`, {
      data: { studentIds: [student._id] },
      headers: authHeaders(adminToken),
    });
    const project = await createProject(request, adminToken, { teamId: team._id });

    const token = await loginAsStudent(request, student.email);
    const res = await request.get(`${API_BASE}/student/team`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe(team.name);
    expect(body.data.members.map((m) => m._id)).toContain(student._id);
    expect(body.data.project._id).toBe(project._id);
  });

  test('tasks returns only the tasks assigned to the student', async ({ request }) => {
    const adminToken = await loginAs(request);
    const studentA = await createStudent(request, adminToken);
    const studentB = await createStudent(request, adminToken);
    const project = await createProject(request, adminToken);
    const myTask = await createTask(request, adminToken, { projectId: project._id, assignedTo: studentA._id });
    await createTask(request, adminToken, { projectId: project._id, assignedTo: studentB._id, title: `Other ${uniq('task')}` });

    const token = await loginAsStudent(request, studentA.email);
    const res = await request.get(`${API_BASE}/student/tasks`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    const tasks = (await res.json()).data;
    expect(tasks.some((t) => t._id === myTask._id)).toBe(true);
    for (const t of tasks) {
      expect(t.assignedTo).toBe(studentA._id);
    }
  });

  test('student can update the progress of their own task', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const project = await createProject(request, adminToken);
    const task = await createTask(request, adminToken, { projectId: project._id, assignedTo: student._id });

    const token = await loginAsStudent(request, student.email);
    const res = await request.put(`${API_BASE}/student/tasks/${task._id}/progress`, {
      data: { status: 'in-progress' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.status).toBe('in-progress');
  });

  test('student cannot update someone else\u2019s task (403)', async ({ request }) => {
    const adminToken = await loginAs(request);
    const studentA = await createStudent(request, adminToken);
    const studentB = await createStudent(request, adminToken);
    const project = await createProject(request, adminToken);
    const task = await createTask(request, adminToken, { projectId: project._id, assignedTo: studentB._id });

    const token = await loginAsStudent(request, studentA.email);
    const res = await request.put(`${API_BASE}/student/tasks/${task._id}/progress`, {
      data: { status: 'completed' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(403);
  });

  test('invalid progress status returns 400', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const project = await createProject(request, adminToken);
    const task = await createTask(request, adminToken, { projectId: project._id, assignedTo: student._id });

    const token = await loginAsStudent(request, student.email);
    const res = await request.put(`${API_BASE}/student/tasks/${task._id}/progress`, {
      data: { status: 'banana' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(400);
  });

  test('admin cannot access the student portal', async ({ request }) => {
    const adminToken = await loginAs(request);
    const res = await request.get(`${API_BASE}/student/profile`, { headers: authHeaders(adminToken) });
    expect(res.status()).toBe(403);
  });
});
