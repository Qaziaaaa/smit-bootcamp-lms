import { test, expect } from '@playwright/test';
import {
  API_BASE,
  loginAs,
  authHeaders,
  uniq,
  createStudent,
  createProject,
  createTask,
} from './helpers.js';

test.describe('Tasks API', () => {
  test('create task', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    const title = `Task ${uniq('create')}`;

    const res = await request.post(`${API_BASE}/tasks`, {
      data: { projectId: project._id, title },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.title).toBe(title);
    expect(body.data.status).toBe('pending');
    expect(body.data.projectId).toBe(project._id);
  });

  test('create task without project returns 400', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.post(`${API_BASE}/tasks`, {
      data: { title: `Task ${uniq('noproj')}` },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(400);
  });

  test('create task with unknown project returns 404', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.post(`${API_BASE}/tasks`, {
      data: { projectId: '64b000000000000000000000', title: `Task ${uniq('badproj')}` },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });

  test('create task with unknown assignee returns 404', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    const res = await request.post(`${API_BASE}/tasks`, {
      data: {
        projectId: project._id,
        title: `Task ${uniq('badassign')}`,
        assignedTo: '64b000000000000000000000',
      },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });

  test('list tasks with pagination', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    await createTask(request, token, { projectId: project._id });

    const res = await request.get(`${API_BASE}/tasks?limit=5`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data.tasks)).toBe(true);
    expect(body.data.pagination.limit).toBe(5);
  });

  test('filter tasks by status', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    await createTask(request, token, { projectId: project._id, title: `Task ${uniq('done')}`, status: 'completed' });

    const res = await request.get(`${API_BASE}/tasks?status=completed`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const t of body.data.tasks) {
      expect(t.status).toBe('completed');
    }
  });

  test('filter tasks by project', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    const task = await createTask(request, token, { projectId: project._id });

    const res = await request.get(`${API_BASE}/tasks?projectId=${project._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.tasks.some((t) => t._id === task._id)).toBe(true);
  });

  test('get task by id returns 404 for unknown id', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.get(`${API_BASE}/tasks/64b000000000000000000000`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });

  test('update task', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    const task = await createTask(request, token, { projectId: project._id });

    const res = await request.put(`${API_BASE}/tasks/${task._id}`, {
      data: { status: 'in-progress' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.status).toBe('in-progress');
  });

  test('delete task', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    const task = await createTask(request, token, { projectId: project._id });

    const res = await request.delete(`${API_BASE}/tasks/${task._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.deleted).toBe(true);

    const detail = await request.get(`${API_BASE}/tasks/${task._id}`, {
      headers: authHeaders(token),
    });
    expect(detail.status()).toBe(404);
  });

  test('students cannot manage tasks', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const login = await request.post(`${API_BASE}/auth/login`, {
      data: { email: student.email, password: 'password123' },
    });
    const studentToken = (await login.json()).data.token;

    const res = await request.get(`${API_BASE}/tasks`, { headers: authHeaders(studentToken) });
    expect(res.status()).toBe(403);
  });
});
