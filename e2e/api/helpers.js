import { expect } from '@playwright/test';

export const API_BASE = 'http://localhost:5000/api';
export const ADMIN_EMAIL = 'admin@lms.com';
export const ADMIN_PASSWORD = 'password123';

export async function loginAs(request, { email = ADMIN_EMAIL, password = ADMIN_PASSWORD } = {}) {
  const res = await request.post(`${API_BASE}/auth/login`, { data: { email, password } });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  return body.data.token;
}

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function uniq(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export function todayISO() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export async function createStudent(request, token, overrides = {}) {
  const u = uniq('student');
  const payload = {
    name: `Test ${u}`,
    email: `${u}@test.com`,
    password: 'password123',
    phone: '03001234567',
    batch: 'SMIT-Bootcamp-LMS3',
    ...overrides,
  };
  const res = await request.post(`${API_BASE}/students`, {
    data: payload,
    headers: authHeaders(token),
  });
  expect(res.status(), JSON.stringify(await res.text().catch(() => ''))).toBe(201);
  return (await res.json()).data;
}

export async function createTeam(request, token, name) {
  const res = await request.post(`${API_BASE}/teams`, {
    data: { name },
    headers: authHeaders(token),
  });
  expect(res.status()).toBe(201);
  return (await res.json()).data;
}

export async function createProject(request, token, overrides = {}) {
  const u = uniq('project');
  const payload = {
    title: `Project ${u}`,
    description: 'E2E generated project',
    status: 'active',
    ...overrides,
  };
  const res = await request.post(`${API_BASE}/projects`, {
    data: payload,
    headers: authHeaders(token),
  });
  expect(res.status()).toBe(201);
  return (await res.json()).data;
}

export async function createTask(request, token, overrides = {}) {
  const u = uniq('task');
  const payload = {
    title: `Task ${u}`,
    projectId: null,
    priority: 'medium',
    status: 'pending',
    ...overrides,
  };
  const res = await request.post(`${API_BASE}/tasks`, {
    data: payload,
    headers: authHeaders(token),
  });
  expect(res.status()).toBe(201);
  return (await res.json()).data;
}

export async function markAttendance(request, token, { studentId, date, status }) {
  const res = await request.post(`${API_BASE}/attendance`, {
    data: { studentId, date, status },
    headers: authHeaders(token),
  });
  expect(res.status()).toBe(200);
  return (await res.json()).data;
}
