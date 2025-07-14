import { test, expect } from '@playwright/test';

test.describe('Полный flow авторизации', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Не используем сохраненную авторизацию
  
  test('Регистрация нового пользователя', async ({ page }) => {
    await page.goto('/register');
    
    // Заполняем форму регистрации
    await page.locator('input[name="email"]').fill('newuser@example.com');
    await page.locator('input[name="password"]').fill('StrongPassword123!');
    await page.locator('input[name="confirmPassword"]').fill('StrongPassword123!');
    await page.locator('input[name="fullName"]').fill('Новый Пользователь');
    
    // Принимаем условия использования если есть чекбокс
    const termsCheckbox = page.locator('input[type="checkbox"][name="terms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    // Отправляем форму
    await page.getByRole('button', { name: /зарегистрироваться|регистрация|register/i }).click();
    
    // Проверяем успешную регистрацию
    await expect(page).toHaveURL(/\/(dashboard|login)/);
    
    // Если перенаправили на login, входим
    if (page.url().includes('login')) {
      await page.locator('input[type="email"]').fill('newuser@example.com');
      await page.locator('input[type="password"]').fill('StrongPassword123!');
      await page.getByRole('button', { name: /войти|вход|login/i }).click();
    }
    
    // Проверяем, что мы вошли в систему
    await expect(page.locator('text=/выйти|logout/i')).toBeVisible();
  });
  
  test('Вход в систему с валидными данными', async ({ page }) => {
    await page.goto('/login');
    
    // Проверяем элементы формы входа
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Вводим данные
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    
    // Нажимаем кнопку входа
    await page.getByRole('button', { name: /войти|вход|login/i }).click();
    
    // Проверяем успешный вход
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=/выйти|logout/i')).toBeVisible();
  });
  
  test('Попытка входа с неверными данными', async ({ page }) => {
    await page.goto('/login');
    
    // Вводим неверные данные
    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    
    // Нажимаем кнопку входа
    await page.getByRole('button', { name: /войти|вход|login/i }).click();
    
    // Проверяем сообщение об ошибке
    await expect(page.locator('text=/неверный|ошибка|invalid|error/i')).toBeVisible();
    
    // Проверяем, что остались на странице входа
    await expect(page).toHaveURL(/\/login/);
  });
  
  test('Восстановление пароля', async ({ page }) => {
    await page.goto('/login');
    
    // Нажимаем ссылку "Забыли пароль?"
    await page.getByRole('link', { name: /забыли пароль|forgot password/i }).click();
    
    // Проверяем переход на страницу восстановления
    await expect(page).toHaveURL(/\/(forgot|reset)/);
    
    // Вводим email
    await page.locator('input[type="email"]').fill('test@example.com');
    
    // Отправляем форму
    await page.getByRole('button', { name: /восстановить|отправить|send|reset/i }).click();
    
    // Проверяем сообщение об успешной отправке
    await expect(page.locator('text=/отправлен|проверьте|sent|check/i')).toBeVisible();
  });
  
  test('Выход из системы', async ({ page }) => {
    // Сначала входим
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /войти|вход|login/i }).click();
    
    // Ждем загрузки dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Ищем и нажимаем кнопку выхода
    const logoutButton = page.getByRole('button', { name: /выйти|выход|logout/i });
    const logoutLink = page.getByRole('link', { name: /выйти|выход|logout/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else if (await logoutLink.isVisible()) {
      await logoutLink.click();
    } else {
      // Если кнопка в меню профиля
      await page.locator('[data-testid="user-menu"]').click();
      await page.getByRole('menuitem', { name: /выйти|выход|logout/i }).click();
    }
    
    // Проверяем выход
    await expect(page).toHaveURL(/\/(login|home)/);
    await expect(page.locator('text=/войти|вход|login/i')).toBeVisible();
  });
  
  test('Проверка защищенных маршрутов', async ({ page }) => {
    // Пытаемся перейти на защищенную страницу без авторизации
    await page.goto('/dashboard');
    
    // Должны быть перенаправлены на страницу входа
    await expect(page).toHaveURL(/\/login/);
    
    // Пытаемся перейти на другие защищенные страницы
    const protectedRoutes = [
      '/sales-forecast',
      '/admin/users',
      '/admin/organizations',
      '/reports',
      '/settings'
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });
  
  test('Сессия и токены', async ({ page, context }) => {
    // Входим в систему
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /войти|вход|login/i }).click();
    
    // Ждем успешного входа
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Проверяем наличие токена в localStorage или cookies
    const localStorage = await page.evaluate(() => window.localStorage);
    const cookies = await context.cookies();
    
    // Проверяем наличие токена авторизации
    const hasAuthToken = 
      localStorage.authToken || 
      localStorage.access_token ||
      cookies.some(cookie => cookie.name.includes('auth') || cookie.name.includes('token'));
    
    expect(hasAuthToken).toBeTruthy();
    
    // Проверяем, что токен сохраняется при перезагрузке
    await page.reload();
    await expect(page.locator('text=/выйти|logout/i')).toBeVisible();
  });
});
