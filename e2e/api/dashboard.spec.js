import { test, expect } from '@playwright/test';
import { API_BASE, loginAs, authHeaders, uniq, createStudent, createProject, createTask, createTeam, markAttendance, todayISO } from './helpers.js';

test.describe('Admin Dashboard API', () => {
  test('returns all stat groups', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.get(`${API_BASE}/dashboard`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(typeof body.data.counts.students).toBe('number');
    expect(typeof body.data.counts.teams).toBe('number');
    expect(typeof body.data.counts.projects).toBe('number');
    expect(typeof body.data.counts.tasks).toBe('number');
    expect(typeof body.data.taskStatus.pending).toBe('number');
    expect(typeof body.data.taskStatus.inProgress).toBe('number');
    expect(typeof body.data.taskStatus.completed).toBe('number');
    expect(typeof body.data.todayAttendance.present).toBe('number');
    expect(typeof body.data.todayAttendance.absent).toBe('number');
    expect(Array.isArray(body.data.recentStudents)).toBe(true);
    expect(Array.isArray(body.data.recentTasks)).toBe(true);
  });

  test('recent lists include just-created data', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    const project = await createProject(request, token);
    const task = await createTask(request, token, { projectId: project._id });

    const res = await request.get(`${API_BASE}/dashboard`, { headers: authHeaders(token) });
    const body = await res.json();

    expect(body.data.recentStudents.some((s) => s._id === student._id)).toBe(true);
    expect(body.data.recentTasks.some((t) => t._id === task._id)).toBe(true);
  });

  test('todayAttendance counts today marked records', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    await markAttendance(request, token, { studentId: student._id, date: todayISO(), status: 'present' });

    const res = await request.get(`${API_BASE}/dashboard`, { headers: authHeaders(token) });
    const body = await res.json();
    expect(body.data.todayAttendance.present).toBeGreaterThanOrEqual(1);
  });

  test('student role gets 403', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const login = await request.post(`${API_BASE}/auth/login`, {
      data: { email: student.email, password: 'password123' },
    });
    const studentToken = (await login.json()).data.token;

    const res = await request.get(`${API_BASE}/dashboard`, { headers: authHeaders(studentToken) });
    expect(res.status()).toBe(403);
  });

  test('no token gets 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/dashboard`);
    expect(res.status()).toBe(401);
  });
});
