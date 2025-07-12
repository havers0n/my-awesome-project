import { Page, expect } from '@playwright/test';

/**
 * Вспомогательные функции для E2E тестов
 */

/**
 * Авторизация пользователя
 */
export async function login(page: Page, email: string = 'test@example.com', password: string = 'password123') {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /войти|вход|login/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Выход из системы
 */
export async function logout(page: Page) {
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
  
  await expect(page).toHaveURL(/\/(login|home)/);
}

/**
 * Ожидание загрузки данных
 */
export async function waitForDataLoad(page: Page) {
  // Ждем исчезновения индикаторов загрузки
  const loadingSelectors = [
    '.skeleton',
    '.loading',
    '.spinner',
    '[data-testid="loading"]',
    'text=/загрузка|loading/i'
  ];
  
  for (const selector of loadingSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      await expect(element).not.toBeVisible({ timeout: 30000 });
    }
  }
}

/**
 * Создание скриншота с именем теста
 */
export async function takeScreenshot(page: Page, testName: string, suffix?: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${testName}${suffix ? `-${suffix}` : ''}-${timestamp}.png`;
  await page.screenshot({ 
    path: `test-results/screenshots/${filename}`,
    fullPage: true 
  });
}

/**
 * Проверка доступности (a11y)
 */
export async function checkAccessibility(page: Page) {
  // Проверяем основные атрибуты доступности
  const violations = await page.evaluate(() => {
    const issues = [];
    
    // Проверяем alt текст для изображений
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });
    
    // Проверяем ARIA labels для кнопок
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
        issues.push('Button missing accessible label');
      }
    });
    
    // Проверяем контрастность (упрощенная проверка)
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bgColor = style.backgroundColor;
      const textColor = style.color;
      
      // Здесь можно добавить более сложную проверку контрастности
    });
    
    return issues;
  });
  
  expect(violations).toHaveLength(0);
}

/**
 * Мокирование API ответов
 */
export async function mockApiResponse(page: Page, url: string, response: any) {
  await page.route(url, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

/**
 * Ожидание сетевого запроса
 */
export async function waitForRequest(page: Page, urlPattern: string | RegExp) {
  return page.waitForRequest(request => {
    if (typeof urlPattern === 'string') {
      return request.url().includes(urlPattern);
    }
    return urlPattern.test(request.url());
  });
}

/**
 * Ожидание ответа от сервера
 */
export async function waitForResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(response => {
    if (typeof urlPattern === 'string') {
      return response.url().includes(urlPattern);
    }
    return urlPattern.test(response.url());
  });
}

/**
 * Проверка наличия ошибок в консоли
 */
export async function checkConsoleErrors(page: Page) {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  // Даем время для сбора ошибок
  await page.waitForTimeout(1000);
  
  // Игнорируем некоторые известные ошибки
  const filteredErrors = errors.filter(error => {
    return !error.includes('ResizeObserver loop limit exceeded') &&
           !error.includes('Non-Error promise rejection captured');
  });
  
  expect(filteredErrors).toHaveLength(0);
}

/**
 * Заполнение формы
 */
export async function fillForm(page: Page, formData: Record<string, string | boolean | number>) {
  for (const [field, value] of Object.entries(formData)) {
    const input = page.locator(`[name="${field}"], #${field}`).first();
    
    if (typeof value === 'boolean') {
      // Checkbox
      if (value) {
        await input.check();
      } else {
        await input.uncheck();
      }
    } else if (typeof value === 'string' && value.startsWith('select:')) {
      // Select
      await input.selectOption(value.replace('select:', ''));
    } else {
      // Text input
      await input.fill(value.toString());
    }
  }
}

/**
 * Проверка мобильной адаптивности
 */
export async function checkMobileResponsiveness(page: Page) {
  const viewports = [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 414, height: 896, name: 'iPhone XR' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300);
    
    // Проверяем, что основные элементы видны
    const mainContent = page.locator('[data-testid="main-content"], main').first();
    await expect(mainContent).toBeVisible();
    
    // Делаем скриншот
    await page.screenshot({ 
      path: `test-results/responsive/${viewport.name}.png`,
      fullPage: true 
    });
  }
}

/**
 * Измерение производительности
 */
export async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      resources: performance.getEntriesByType('resource').length
    };
  });
  
  return metrics;
}
