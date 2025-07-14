import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Переходим на страницу входа
  await page.goto('/login');
  
  // Вводим учетные данные
  await page.locator('input[type="email"]').fill('test@example.com');
  await page.locator('input[type="password"]').fill('password123');
  
  // Нажимаем кнопку входа
  await page.getByRole('button', { name: /войти|вход|login/i }).click();
  
  // Ждем редиректа на главную страницу после успешного входа
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Проверяем, что мы авторизованы
  await expect(page.locator('text=/выйти|logout/i')).toBeVisible();
  
  // Сохраняем состояние авторизации
  await page.context().storageState({ path: authFile });
});
