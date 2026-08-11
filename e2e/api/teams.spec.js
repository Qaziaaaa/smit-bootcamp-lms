import { test, expect } from '@playwright/test';
import { API_BASE, loginAs, authHeaders, uniq, createStudent, createTeam } from './helpers.js';

test.describe('Teams API', () => {
  test('create team', async ({ request }) => {
    const token = await loginAs(request);
    const name = `Team ${uniq('alpha')}`;

    const res = await request.post(`${API_BASE}/teams`, {
      data: { name },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe(name);
    expect(body.data._id).toBeTruthy();
  });

  test('duplicate team name returns 409', async ({ request }) => {
    const token = await loginAs(request);
    const team = await createTeam(request, token, `Team ${uniq('dup')}`);

    const res = await request.post(`${API_BASE}/teams`, {
      data: { name: team.name },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(409);
  });

  test('empty team name returns 400', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.post(`${API_BASE}/teams`, {
      data: { name: '' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(400);
  });

  test('list teams with member counts', async ({ request }) => {
    const token = await loginAs(request);
    const team = await createTeam(request, token, `Team ${uniq('list')}`);
    const student = await createStudent(request, token);
    await request.post(`${API_BASE}/teams/${team._id}/students`, {
      data: { studentIds: [student._id] },
      headers: authHeaders(token),
    });

    const res = await request.get(`${API_BASE}/teams`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const found = body.data.teams.find((t) => t._id === team._id);
    expect(found).toBeTruthy();
    expect(found.memberCount).toBe(1);
  });

  test('search teams by name', async ({ request }) => {
    const token = await loginAs(request);
    const name = `Team ${uniq('searchable')}`;
    await createTeam(request, token, name);
    await createTeam(request, token, `Team ${uniq('other')}`);

    const res = await request.get(`${API_BASE}/teams?search=${encodeURIComponent(name)}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.teams.map((t) => t.name)).toContain(name);
  });

  test('get team by id includes members and project', async ({ request }) => {
    const token = await loginAs(request);
    const team = await createTeam(request, token, `Team ${uniq('detail')}`);
    const student = await createStudent(request, token);
    await request.post(`${API_BASE}/teams/${team._id}/students`, {
      data: { studentIds: [student._id] },
      headers: authHeaders(token),
    });

    const res = await request.get(`${API_BASE}/teams/${team._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe(team.name);
    expect(body.data.members.map((m) => m._id)).toContain(student._id);
    expect(body.data.project).toBeNull();
  });

  test('get team by id returns 404 for unknown id', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.get(`${API_BASE}/teams/64b000000000000000000000`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });

  test('assign students to team', async ({ request }) => {
    const token = await loginAs(request);
    const team = await createTeam(request, token, `Team ${uniq('assign')}`);
    const student = await createStudent(request, token);

    const res = await request.post(`${API_BASE}/teams/${team._id}/students`, {
      data: { studentIds: [student._id] },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.team.id).toBe(team._id);
    expect(body.data.members.map((m) => m._id)).toContain(student._id);

    const detail = await (await request.get(`${API_BASE}/teams/${team._id}`, {
      headers: authHeaders(token),
    })).json();
    expect(detail.data.members.length).toBe(1);
  });

  test('assign with unknown student returns 400', async ({ request }) => {
    const token = await loginAs(request);
    const team = await createTeam(request, token, `Team ${uniq('badassign')}`);

    const res = await request.post(`${API_BASE}/teams/${team._id}/students`, {
      data: { studentIds: ['64b000000000000000000000'] },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(400);
  });

  test('update team name', async ({ request }) => {
    const token = await loginAs(request);
    const team = await createTeam(request, token, `Team ${uniq('rename')}`);
    const newName = `Team ${uniq('renamed')}`;

    const res = await request.put(`${API_BASE}/teams/${team._id}`, {
      data: { name: newName },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.name).toBe(newName);
  });

  test('delete team unassigns its students', async ({ request }) => {
    const token = await loginAs(request);
    const team = await createTeam(request, token, `Team ${uniq('delete')}`);
    const student = await createStudent(request, token);
    await request.post(`${API_BASE}/teams/${team._id}/students`, {
      data: { studentIds: [student._id] },
      headers: authHeaders(token),
    });

    const res = await request.delete(`${API_BASE}/teams/${team._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.deleted).toBe(true);

    const detail = await request.get(`${API_BASE}/students/${student._id}`, {
      headers: authHeaders(token),
    });
    expect((await detail.json()).data.teamId).toBeUndefined();
  });

  test('students cannot manage teams', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const login = await request.post(`${API_BASE}/auth/login`, {
      data: { email: student.email, password: 'password123' },
    });
    const studentToken = (await login.json()).data.token;

    const res = await request.get(`${API_BASE}/teams`, { headers: authHeaders(studentToken) });
    expect(res.status()).toBe(403);
  });
});
