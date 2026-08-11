export async function loginViaUi(page, { email, password, role = 'student', stayOnLogin = false }) {
  await page.goto('/login');
  const tab = role === 'admin' ? 'Login as Admin' : 'Login as Student';
  await page.getByRole('button', { name: tab, exact: true }).first().click();
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.locator('button[type="submit"]').click();
  if (!stayOnLogin) {
    await page.waitForURL((url) => !url.pathname.endsWith('/login'));
  }
}
