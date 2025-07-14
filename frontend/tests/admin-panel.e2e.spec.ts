import { test, expect } from '@playwright/test';

// Базовый e2e тест для админ-панели

test.describe('Admin Panel E2E', () => {
  test('Навигация и создание пользователя', async ({ page }) => {
    await page.goto('http://localhost/admin/users');

    // Проверка, что страница пользователей загружена
    await expect(page.locator('h1')).toHaveText(/управление пользователями/i);

    // Клик по внешней кнопке "Создать пользователя" для открытия модалки
    await page.getByRole('button', { name: /создать пользователя/i }).first().click();
    // Проверка открытия модального окна
    await expect(page.locator('form')).toBeVisible();
    await page.screenshot({ path: 'debug-user-form.png', fullPage: true });
    // Вводим email по id
    await page.locator('#user_email').fill('testuser@example.com');
    // Вводим пароль по id
    await page.locator('#user_password').fill('TestPassword123');
    // Вводим ФИО по id
    await page.locator('#user_full_name').fill('Тестовый Пользователь');
    // Выбираем роль по id
    await page.locator('#user_role').selectOption({ index: 1 });
    await page.locator('form').getByRole('button', { name: /создать пользователя/i }).click();

    // Проверка, что пользователь появился в таблице
    await expect(page.getByRole('cell', { name: 'testuser@example.com' })).toBeVisible();
  });

  test('Навигация и создание организации', async ({ page }) => {
    await page.goto('http://localhost/admin/organizations');
    await expect(page.locator('h1')).toHaveText(/управление организациями/i);
    // Клик по внешней кнопке "Создать организацию" для открытия модалки
    await page.getByRole('button', { name: /создать организацию/i }).first().click();
    await expect(page.locator('form')).toBeVisible();
    await page.screenshot({ path: 'debug-org-form.png', fullPage: true });
    // Вводим название организации по id
    await page.locator('#org_name').fill('ООО "Тестовая"');
    // Вводим ИНН/ОГРН по id
    await page.locator('#org_inn').fill('1234567890');
    // Вводим юридический адрес (обязательное поле)
    await page.locator('#org_legal_address').fill('г. Москва, ул. Тестовая, д. 1');
    await page.locator('form').getByRole('button', { name: /создать организацию/i }).click();
    // Скриншот после попытки создания организации
    await page.screenshot({ path: 'debug-org-after-submit.png', fullPage: true });
    // Ожидание появления организации с увеличенным таймаутом
    await expect(page.getByRole('cell', { name: 'ООО "Тестовая"' })).toBeVisible({ timeout: 10000 });
  });
});
