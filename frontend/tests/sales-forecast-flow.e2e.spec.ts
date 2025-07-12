import { test, expect } from '@playwright/test';

test.describe('Создание и просмотр прогноза продаж', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу прогнозов
    await page.goto('/sales-forecast');
  });
  
  test('Создание нового прогноза на 7 дней', async ({ page }) => {
    // Проверяем, что страница загрузилась
    await expect(page.locator('h1')).toContainText(/прогноз/i);
    
    // Находим поле ввода количества дней
    const daysInput = page.locator('input[type="number"]').first();
    await expect(daysInput).toBeVisible();
    
    // Очищаем и вводим новое значение
    await daysInput.clear();
    await daysInput.fill('7');
    
    // Нажимаем кнопку создания прогноза
    const predictButton = page.getByRole('button', { name: /предсказать|прогноз|forecast|predict/i });
    await expect(predictButton).toBeEnabled();
    await predictButton.click();
    
    // Ждем появления индикатора загрузки
    const loadingIndicator = page.locator('text=/загрузка|loading/i').or(page.locator('.spinner'));
    await expect(loadingIndicator).toBeVisible();
    
    // Ждем завершения загрузки (максимум 30 секунд)
    await expect(loadingIndicator).not.toBeVisible({ timeout: 30000 });
    
    // Проверяем появление графика
    const chart = page.locator('canvas, .chart, [data-testid="forecast-chart"], .apexcharts-svg').first();
    await expect(chart).toBeVisible();
    
    // Проверяем наличие данных прогноза
    await expect(page.locator('text=/прогноз на|forecast for/i')).toBeVisible();
  });
  
  test('Создание прогноза с разными периодами', async ({ page }) => {
    const periods = [3, 7, 14, 30];
    
    for (const days of periods) {
      // Вводим количество дней
      const daysInput = page.locator('input[type="number"]').first();
      await daysInput.clear();
      await daysInput.fill(days.toString());
      
      // Создаем прогноз
      await page.getByRole('button', { name: /предсказать|прогноз|forecast|predict/i }).click();
      
      // Ждем результата
      await page.waitForTimeout(2000);
      
      // Проверяем, что график обновился
      const chart = page.locator('canvas, .chart, [data-testid="forecast-chart"]').first();
      await expect(chart).toBeVisible();
      
      // Делаем скриншот для каждого периода
      await page.screenshot({ 
        path: `test-results/forecast-${days}-days.png`,
        fullPage: true 
      });
    }
  });
  
  test('Просмотр деталей прогноза', async ({ page }) => {
    // Создаем прогноз
    await page.locator('input[type="number"]').first().fill('7');
    await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
    
    // Ждем загрузки
    await page.waitForTimeout(3000);
    
    // Проверяем наличие метрик качества
    const metricsButton = page.getByRole('button', { name: /метрики|metrics/i });
    if (await metricsButton.isVisible()) {
      await metricsButton.click();
      
      // Проверяем отображение метрик
      await expect(page.locator('text=/R²|MAPE|MAE|RMSE/')).toBeVisible();
      await expect(page.locator('[data-testid="kpi-blocks"]')).toBeVisible();
    }
    
    // Проверяем возможность переключения видов
    const viewButtons = page.locator('button:has-text("Chart"), button:has-text("Table")');
    if (await viewButtons.first().isVisible()) {
      // Переключаемся на табличный вид
      await page.getByRole('button', { name: /table|таблица/i }).click();
      await expect(page.locator('table, [data-testid="forecast-table"]')).toBeVisible();
      
      // Возвращаемся к графику
      await page.getByRole('button', { name: /chart|график/i }).click();
      await expect(page.locator('canvas, .chart')).toBeVisible();
    }
  });
  
  test('Фильтрация и сортировка данных прогноза', async ({ page }) => {
    // Создаем прогноз
    await page.locator('input[type="number"]').first().fill('14');
    await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
    
    // Ждем загрузки
    await page.waitForTimeout(3000);
    
    // Проверяем наличие фильтров
    const filters = {
      'SKU': page.locator('button:has-text("SKU")'),
      'Store': page.locator('button:has-text("Store")'), 
      'Time': page.locator('button:has-text("Time")')
    };
    
    for (const [filterName, filterButton] of Object.entries(filters)) {
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(1000);
        
        // Проверяем, что данные обновились
        const content = page.locator('[data-testid="forecast-content"], .chart, table').first();
        await expect(content).toBeVisible();
      }
    }
    
    // Проверяем сортировку если есть таблица
    const tableView = page.getByRole('button', { name: /table|таблица/i });
    if (await tableView.isVisible()) {
      await tableView.click();
      
      // Находим заголовки таблицы и пробуем отсортировать
      const sortableHeaders = page.locator('th[role="button"], th.sortable');
      const headerCount = await sortableHeaders.count();
      
      if (headerCount > 0) {
        // Кликаем по первому сортируемому заголовку
        await sortableHeaders.first().click();
        await page.waitForTimeout(500);
        
        // Кликаем еще раз для обратной сортировки
        await sortableHeaders.first().click();
        await page.waitForTimeout(500);
      }
    }
  });
  
  test('Сохранение и загрузка истории прогнозов', async ({ page }) => {
    // Создаем первый прогноз
    await page.locator('input[type="number"]').first().fill('7');
    await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
    await page.waitForTimeout(3000);
    
    // Создаем второй прогноз
    await page.locator('input[type="number"]').first().fill('14');
    await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
    await page.waitForTimeout(3000);
    
    // Проверяем наличие истории
    const historyButton = page.getByRole('button', { name: /история|history/i });
    if (await historyButton.isVisible()) {
      await historyButton.click();
      
      // Проверяем список прогнозов
      await expect(page.locator('[data-testid="forecast-history"]')).toBeVisible();
      
      // Проверяем наличие как минимум двух записей
      const historyItems = page.locator('[data-testid="history-item"]');
      await expect(historyItems).toHaveCount(2, { timeout: 5000 });
      
      // Загружаем предыдущий прогноз
      await historyItems.first().click();
      await page.waitForTimeout(1000);
      
      // Проверяем, что данные загрузились
      await expect(page.locator('canvas, .chart')).toBeVisible();
    }
  });
  
  test('Обработка ошибок при создании прогноза', async ({ page }) => {
    // Пробуем создать прогноз с невалидными данными
    const daysInput = page.locator('input[type="number"]').first();
    
    // Тест с отрицательным значением
    await daysInput.clear();
    await daysInput.fill('-5');
    await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
    
    // Проверяем сообщение об ошибке
    await expect(page.locator('text=/ошибка|error|недопустимо|invalid/i')).toBeVisible();
    
    // Тест с очень большим значением
    await daysInput.clear();
    await daysInput.fill('9999');
    await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
    
    // Проверяем ограничение
    await expect(page.locator('text=/максимум|maximum|слишком|too/i')).toBeVisible();
    
    // Тест с пустым значением
    await daysInput.clear();
    await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
    
    // Проверяем валидацию
    await expect(page.locator('text=/требуется|required|введите|enter/i')).toBeVisible();
  });
  
  test('Адаптивность интерфейса прогнозов', async ({ page }) => {
    // Тестируем на разных размерах экрана
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Создаем прогноз
      await page.locator('input[type="number"]').first().fill('7');
      await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
      await page.waitForTimeout(2000);
      
      // Делаем скриншот
      await page.screenshot({ 
        path: `test-results/forecast-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Проверяем, что основные элементы видны
      await expect(page.locator('canvas, .chart, [data-testid="forecast-chart"]').first()).toBeVisible();
    }
  });
});
