import { test, expect } from '@playwright/test';
import {
  API_BASE,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  loginAs,
  authHeaders,
  uniq,
  createStudent,
} from './helpers.js';

test.describe('Health', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
  });
});

test.describe('Auth', () => {
  test('admin login returns a token and admin role', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeTruthy();
    expect(body.data.user.role).toBe('admin');
    expect(body.data.user.email).toBe(ADMIN_EMAIL);
  });

  test('student login returns a token and student role', async ({ request }) => {
    const adminToken = await loginAs(request);
    const student = await createStudent(request, adminToken);

    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: student.email, password: 'password123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.user.role).toBe('student');
    expect(body.data.user.email).toBe(student.email);
  });

  test('GET /api/auth/me returns profile without secrets', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.get(`${API_BASE}/auth/me`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.email).toBe(ADMIN_EMAIL);
    expect(body.data.role).toBe('admin');
    expect(body.data.passwordHash).toBeUndefined();
  });

  test('POST /api/auth/logout succeeds with a valid token', async ({ request }) => {
    const token = await loginAs(request);
    const res = await request.post(`${API_BASE}/auth/logout`, { headers: authHeaders(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.loggedOut).toBe(true);
  });

  test.describe('negative', () => {
    test('wrong password returns 401', async ({ request }) => {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: ADMIN_EMAIL, password: 'wrong-password' },
      });
      expect(res.status()).toBe(401);
      expect((await res.json()).success).toBe(false);
    });

    test('unknown email returns 401', async ({ request }) => {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: 'ghost@example.com', password: 'password123' },
      });
      expect(res.status()).toBe(401);
    });

    test('missing password returns 400', async ({ request }) => {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: ADMIN_EMAIL },
      });
      expect(res.status()).toBe(400);
    });

    test('invalid email returns 400', async ({ request }) => {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: 'not-an-email', password: 'password123' },
      });
      expect(res.status()).toBe(400);
    });

    test('missing token returns 401', async ({ request }) => {
      const res = await request.get(`${API_BASE}/auth/me`);
      expect(res.status()).toBe(401);
    });

    test('garbage token returns 401', async ({ request }) => {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: 'Bearer not.a.real.token' },
      });
      expect(res.status()).toBe(401);
    });

    test('unknown route returns 404', async ({ request }) => {
      const token = await loginAs(request);
      const res = await request.get(`${API_BASE}/does-not-exist`, { headers: authHeaders(token) });
      expect(res.status()).toBe(404);
    });
  });
});
