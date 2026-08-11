import { test, expect } from '@playwright/test';
import { API_BASE, loginAs, authHeaders, uniq, createStudent, createTeam, createProject } from './helpers.js';

test.describe('Projects API', () => {
  test('create project', async ({ request }) => {
    const token = await loginAs(request);
    const title = `Project ${uniq('create')}`;

    const res = await request.post(`${API_BASE}/projects`, {
      data: { title, description: 'E2E project', status: 'active' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.title).toBe(title);
    expect(body.data.status).toBe('active');
  });

  test('create project with a team links the project to that team', async ({ request }) => {
    const token = await loginAs(request);
    const team = await createTeam(request, token, `Team ${uniq('proj')}`);
    const project = await createProject(request, token, { teamId: team._id });

    const teamDetail = await (await request.get(`${API_BASE}/teams/${team._id}`, {
      headers: authHeaders(token),
    })).json();
    expect(teamDetail.data.project).toBeTruthy();
    expect(teamDetail.data.project._id).toBe(project._id);
  });

  test('create project with unknown team returns 404', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.post(`${API_BASE}/projects`, {
      data: { title: `Project ${uniq('badteam')}`, teamId: '64b000000000000000000000' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });

  test('empty title returns 400', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.post(`${API_BASE}/projects`, {
      data: { title: '' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(400);
  });

  test('list projects with pagination', async ({ request }) => {
    const token = await loginAs(request);
    await createProject(request, token);

    const res = await request.get(`${API_BASE}/projects?limit=5`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data.projects)).toBe(true);
    expect(body.data.pagination.limit).toBe(5);
  });

  test('filter projects by status', async ({ request }) => {
    const token = await loginAs(request);
    await createProject(request, token, { status: 'on-hold', title: `Hold ${uniq('p')}` });

    const res = await request.get(`${API_BASE}/projects?status=on-hold`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.projects.length).toBeGreaterThan(0);
    for (const p of body.data.projects) {
      expect(p.status).toBe('on-hold');
    }
  });

  test('search projects by title', async ({ request }) => {
    const token = await loginAs(request);
    const title = `SearchMe ${uniq('proj')}`;
    await createProject(request, token, { title });

    const res = await request.get(`${API_BASE}/projects?search=${encodeURIComponent(title)}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.projects.map((p) => p.title)).toContain(title);
  });

  test('get project by id includes tasks', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);

    const res = await request.get(`${API_BASE}/projects/${project._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data._id).toBe(project._id);
    expect(Array.isArray(body.data.tasks)).toBe(true);
  });

  test('get project by id returns 404 for unknown id', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.get(`${API_BASE}/projects/64b000000000000000000000`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });

  test('update project', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    const newTitle = `Renamed ${uniq('project')}`;

    const res = await request.put(`${API_BASE}/projects/${project._id}`, {
      data: { title: newTitle, status: 'completed' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe(newTitle);
    expect(body.data.status).toBe('completed');
  });

  test('delete project removes its tasks', async ({ request }) => {
    const token = await loginAs(request);
    const project = await createProject(request, token);
    const task = await (await request.post(`${API_BASE}/tasks`, {
      data: { projectId: project._id, title: `Task ${uniq('delproj')}` },
      headers: authHeaders(token),
    })).json();

    const res = await request.delete(`${API_BASE}/projects/${project._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.deleted).toBe(true);

    const taskRes = await request.get(`${API_BASE}/tasks/${task.data._id}`, {
      headers: authHeaders(token),
    });
    expect(taskRes.status()).toBe(404);
  });

  test('students cannot manage projects', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const login = await request.post(`${API_BASE}/auth/login`, {
      data: { email: student.email, password: 'password123' },
    });
    const studentToken = (await login.json()).data.token;

    const res = await request.get(`${API_BASE}/projects`, { headers: authHeaders(studentToken) });
    expect(res.status()).toBe(403);
  });
});
