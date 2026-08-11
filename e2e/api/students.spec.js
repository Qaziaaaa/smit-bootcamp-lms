import { test, expect } from '@playwright/test';
import {
  API_BASE,
  loginAs,
  authHeaders,
  uniq,
  createStudent,
  createTeam,
  todayISO,
  markAttendance,
} from './helpers.js';

test.describe('Students API', () => {
  test('create student', async ({ request }) => {
    const token = await loginAs(request);
    const u = uniq('student');

    const res = await request.post(`${API_BASE}/students`, {
      data: {
        name: `Test ${u}`,
        email: `${u}@test.com`,
        password: 'password123',
        phone: '03001234567',
        batch: 'SMIT-Bootcamp-LMS3',
      },
      headers: authHeaders(token),
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe(`Test ${u}`);
    expect(body.data.email).toBe(`${u}@test.com`);
    expect(body.data.status).toBe('active');
    expect(body.data._id).toBeTruthy();
  });

  test('duplicate email returns 409', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);

    const res = await request.post(`${API_BASE}/students`, {
      data: {
        name: 'Duplicate',
        email: student.email,
        password: 'password123',
      },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(409);
  });

  test('invalid payload returns 400', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.post(`${API_BASE}/students`, {
      data: { name: 'X', email: 'not-an-email', password: 'short' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).success).toBe(false);
  });

  test('list students with pagination', async ({ request }) => {
    const token = await loginAs(request);
    await createStudent(request, token);

    const res = await request.get(`${API_BASE}/students?limit=5`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data.students)).toBe(true);
    expect(body.data.pagination).toBeTruthy();
    expect(body.data.pagination.limit).toBe(5);
  });

  test('search students by name', async ({ request }) => {
    const token = await loginAs(request);
    const u = uniq('needle');
    const student = await createStudent(request, token, { name: `Needle ${u}` });
    await createStudent(request, token, { name: `Haystack ${uniq('other')}` });

    const res = await request.get(`${API_BASE}/students?search=${encodeURIComponent(`Needle ${u}`)}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const names = body.data.students.map((s) => s.name);
    expect(names).toContain(`Needle ${u}`);
    expect(body.data.students.some((s) => s._id === student._id)).toBe(true);
  });

  test('get student by id', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);

    const res = await request.get(`${API_BASE}/students/${student._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data._id).toBe(student._id);
    expect(body.data.email).toBe(student.email);
  });

  test('get student by id returns 404 for unknown id', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.get(`${API_BASE}/students/64b000000000000000000000`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });

  test('update student', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    const newPhone = '03123456789';

    const res = await request.put(`${API_BASE}/students/${student._id}`, {
      data: { phone: newPhone },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.phone).toBe(newPhone);
  });

  test('updated student can log in with the same credentials', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    await request.put(`${API_BASE}/students/${student._id}`, {
      data: { name: 'Renamed Student' },
      headers: authHeaders(token),
    });

    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: student.email, password: 'password123' },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.user.email).toBe(student.email);
  });

  test('delete student removes the login account', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);

    const del = await request.delete(`${API_BASE}/students/${student._id}`, {
      headers: authHeaders(token),
    });
    expect(del.status()).toBe(200);

    const login = await request.post(`${API_BASE}/auth/login`, {
      data: { email: student.email, password: 'password123' },
    });
    expect(login.status()).toBe(401);
  });

  test('student attendance endpoint aggregates summary', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    await markAttendance(request, token, { studentId: student._id, date: todayISO(), status: 'present' });
    await markAttendance(request, token, { studentId: student._id, date: '2026-01-05', status: 'absent' });

    const res = await request.get(`${API_BASE}/students/${student._id}/attendance`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.records.length).toBe(2);
    expect(body.data.summary.present).toBe(1);
    expect(body.data.summary.absent).toBe(1);
    expect(body.data.summary.totalDays).toBe(2);
    expect(body.data.summary.percentage).toBe(50);
  });

  test.describe('authorization', () => {
    test('students cannot create students', async ({ request }) => {
      const adminToken = await loginAs(request);
      const student = await createStudent(request, adminToken);

      const login = await request.post(`${API_BASE}/auth/login`, {
        data: { email: student.email, password: 'password123' },
      });
      const studentToken = (await login.json()).data.token;

      const res = await request.post(`${API_BASE}/students`, {
        data: { name: 'Sneaky', email: `${uniq('sneaky')}@test.com`, password: 'password123' },
        headers: authHeaders(studentToken),
      });
      expect(res.status()).toBe(403);
    });

    test('no token returns 401', async ({ request }) => {
      const res = await request.get(`${API_BASE}/students`);
      expect(res.status()).toBe(401);
    });
  });
});
