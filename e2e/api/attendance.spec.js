import { test, expect } from '@playwright/test';
import { API_BASE, loginAs, authHeaders, uniq, createStudent, todayISO, markAttendance } from './helpers.js';

test.describe('Attendance API', () => {
  test('mark student present', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);

    const res = await markAttendance(request, token, {
      studentId: student._id,
      date: todayISO(),
      status: 'present',
    });
    expect(res.status).toBe('present');
    expect(res.studentId._id).toBe(student._id);
  });

  test('mark attendance upserts (same student+date updates instead of duplicating)', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    const date = todayISO();

    await markAttendance(request, token, { studentId: student._id, date, status: 'absent' });
    await markAttendance(request, token, { studentId: student._id, date, status: 'present' });

    const res = await request.get(`${API_BASE}/attendance?date=${date}&studentId=${student._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.records.length).toBe(1);
    expect(body.data.records[0].status).toBe('present');
  });

  test('invalid status returns 400', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);

    const res = await request.post(`${API_BASE}/attendance`, {
      data: { studentId: student._id, date: todayISO(), status: 'maybe' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(400);
  });

  test('invalid date returns 400', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);

    const res = await request.post(`${API_BASE}/attendance`, {
      data: { studentId: student._id, date: 'not-a-date', status: 'present' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(400);
  });

  test('list attendance for a date', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    const date = todayISO();
    await markAttendance(request, token, { studentId: student._id, date, status: 'absent' });
    await markAttendance(request, token, { studentId: student._id, date: '2026-01-05', status: 'present' });

    const res = await request.get(`${API_BASE}/attendance?date=${date}&studentId=${student._id}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.records.length).toBe(1);
    expect(body.data.records[0].status).toBe('absent');
    expect(body.data.records[0].batch).toBe(student.batch);

    const otherDay = await request.get(`${API_BASE}/attendance?date=2026-01-05&studentId=${student._id}`, {
      headers: authHeaders(token),
    });
    const otherBody = await otherDay.json();
    expect(otherBody.data.records.length).toBe(1);
    expect(otherBody.data.records[0].status).toBe('present');
  });

  test('filter attendance by status', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    const date = todayISO();
    await markAttendance(request, token, { studentId: student._id, date, status: 'present' });

    const res = await request.get(`${API_BASE}/attendance?status=absent`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const r of body.data.records) {
      expect(r.status).toBe('absent');
    }
  });

  test('update attendance status', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    const date = todayISO();
    const record = await markAttendance(request, token, { studentId: student._id, date, status: 'absent' });

    const res = await request.put(`${API_BASE}/attendance/${record._id}`, {
      data: { status: 'present' },
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.status).toBe('present');
  });

  test('attendance summary aggregates per-student totals', async ({ request }) => {
    const token = await loginAs(request);
    const student = await createStudent(request, token);
    await markAttendance(request, token, { studentId: student._id, date: todayISO(), status: 'present' });
    await markAttendance(request, token, { studentId: student._id, date: '2026-01-05', status: 'absent' });

    const res = await request.get(`${API_BASE}/attendance/summary`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const row = body.data.students.find((s) => s.studentName === student.name);
    expect(row).toBeTruthy();
    expect(row.present).toBe(1);
    expect(row.absent).toBe(1);
    expect(row.totalDays).toBe(2);
    expect(row.percentage).toBe(50);
    expect(body.data.overall.totalStudents).toBeGreaterThan(0);
  });

  test('students cannot access attendance management', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);
    const login = await request.post(`${API_BASE}/auth/login`, {
      data: { email: student.email, password: 'password123' },
    });
    const studentToken = (await login.json()).data.token;

    const res = await request.get(`${API_BASE}/attendance`, { headers: authHeaders(studentToken) });
    expect(res.status()).toBe(403);
  });
});
