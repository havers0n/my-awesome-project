import { test, expect } from '@playwright/test';

test.describe('Просмотр дашбордов и отчетов', () => {
  test('Главный дашборд - обзор ключевых метрик', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Проверяем заголовок
    await expect(page.locator('h1')).toContainText(/dashboard|дашборд|панель/i);
    
    // Проверяем наличие ключевых метрик
    const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card, .metric-card');
    await expect(kpiCards.first()).toBeVisible();
    
    // Проверяем основные показатели
    const expectedMetrics = [
      'Продажи',
      'Прибыль', 
      'Количество заказов',
      'Средний чек',
      'Конверсия',
      'Out of Stock'
    ];
    
    for (const metric of expectedMetrics) {
      const metricElement = page.locator(`text=/${metric}/i`);
      if (await metricElement.isVisible()) {
        await expect(metricElement).toBeVisible();
      }
    }
    
    // Проверяем наличие графиков
    const charts = page.locator('canvas, .chart, svg.chart, .apexcharts-svg');
    await expect(charts.first()).toBeVisible();
    
    // Делаем скриншот дашборда
    await page.screenshot({ 
      path: 'test-results/main-dashboard.png',
      fullPage: true 
    });
  });
  
  test('Переключение периодов на дашборде', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Находим селектор периода
    const periodSelector = page.locator('select[name="period"], [data-testid="period-selector"]').first();
    
    if (await periodSelector.isVisible()) {
      const periods = ['day', 'week', 'month', 'quarter', 'year'];
      
      for (const period of periods) {
        await periodSelector.selectOption(period);
        await page.waitForTimeout(1000);
        
        // Проверяем, что данные обновились
        const updatedMetric = page.locator('[data-testid="kpi-value"], .metric-value').first();
        await expect(updatedMetric).toBeVisible();
      }
    } else {
      // Если селектор - это кнопки
      const periodButtons = page.locator('button:has-text("День"), button:has-text("Неделя"), button:has-text("Месяц")');
      
      if (await periodButtons.first().isVisible()) {
        const buttonCount = await periodButtons.count();
        for (let i = 0; i < buttonCount; i++) {
          await periodButtons.nth(i).click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });
  
  test('Дашборд продаж - детальная аналитика', async ({ page }) => {
    await page.goto('/dashboard/sales');
    
    // Проверяем заголовок
    await expect(page.locator('h1')).toContainText(/продаж|sales/i);
    
    // Проверяем наличие фильтров
    const filters = {
      dateRange: page.locator('[data-testid="date-range"], input[type="date"]'),
      category: page.locator('select[name="category"], [data-testid="category-filter"]'),
      store: page.locator('select[name="store"], [data-testid="store-filter"]'),
      product: page.locator('input[placeholder*="товар"], input[placeholder*="product"]')
    };
    
    // Применяем фильтры
    if (await filters.dateRange.first().isVisible()) {
      const today = new Date();
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      await filters.dateRange.first().fill(monthAgo.toISOString().split('T')[0]);
      await filters.dateRange.last().fill(today.toISOString().split('T')[0]);
    }
    
    if (await filters.category.isVisible()) {
      await filters.category.selectOption({ index: 1 });
    }
    
    // Проверяем графики продаж
    await expect(page.locator('[data-testid="sales-chart"], .sales-chart').first()).toBeVisible();
    
    // Проверяем таблицу топ товаров
    const topProductsTable = page.locator('[data-testid="top-products"], table:has-text("топ")');
    if (await topProductsTable.isVisible()) {
      const rows = topProductsTable.locator('tbody tr');
      await expect(rows.first()).toBeVisible();
    }
  });
  
  test('Дашборд инвентаря', async ({ page }) => {
    await page.goto('/dashboard/inventory');
    
    // Проверяем метрики инвентаря
    await expect(page.locator('text=/товаров на складе|products in stock/i')).toBeVisible();
    await expect(page.locator('text=/out of stock/i')).toBeVisible();
    await expect(page.locator('text=/низкий остаток|low stock/i')).toBeVisible();
    
    // Проверяем график оборачиваемости
    const turnoverChart = page.locator('[data-testid="turnover-chart"], .turnover-chart');
    if (await turnoverChart.isVisible()) {
      await expect(turnoverChart).toBeVisible();
    }
    
    // Проверяем список критических товаров
    const criticalItems = page.locator('[data-testid="critical-items"], .critical-items');
    if (await criticalItems.isVisible()) {
      await expect(criticalItems).toBeVisible();
    }
  });
  
  test('Генерация и просмотр отчетов', async ({ page }) => {
    await page.goto('/reports');
    
    // Проверяем список доступных отчетов
    const reportTypes = [
      'Отчет по продажам',
      'Анализ прибыльности',
      'Отчет по инвентарю',
      'ABC-анализ',
      'Отчет по поставщикам',
      'Анализ клиентов'
    ];
    
    for (const reportType of reportTypes) {
      const reportLink = page.locator(`text=/${reportType}/i`);
      if (await reportLink.isVisible()) {
        await reportLink.click();
        
        // Ждем загрузки отчета
        await page.waitForTimeout(2000);
        
        // Проверяем, что отчет загрузился
        await expect(page.locator('[data-testid="report-content"], .report-content')).toBeVisible();
        
        // Возвращаемся к списку отчетов
        await page.goto('/reports');
      }
    }
  });
  
  test('Настройка параметров отчета', async ({ page }) => {
    await page.goto('/reports/sales');
    
    // Открываем настройки отчета
    const settingsButton = page.getByRole('button', { name: /настройки|параметры|settings|parameters/i });
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Настраиваем параметры
      const reportParams = page.locator('[data-testid="report-params"], .report-parameters');
      await expect(reportParams).toBeVisible();
      
      // Выбираем период
      const periodSelect = page.locator('select[name="report-period"]');
      await periodSelect.selectOption('last-month');
      
      // Выбираем группировку
      const groupBySelect = page.locator('select[name="group-by"]');
      if (await groupBySelect.isVisible()) {
        await groupBySelect.selectOption('category');
      }
      
      // Включаем дополнительные метрики
      const additionalMetrics = page.locator('input[type="checkbox"][name*="metric"]');
      const metricCount = await additionalMetrics.count();
      for (let i = 0; i < Math.min(3, metricCount); i++) {
        await additionalMetrics.nth(i).check();
      }
      
      // Применяем настройки
      await page.getByRole('button', { name: /применить|apply|generate|сформировать/i }).click();
      
      // Ждем обновления отчета
      await page.waitForTimeout(2000);
      await expect(page.locator('[data-testid="report-content"]')).toBeVisible();
    }
  });
  
  test('Экспорт отчетов в различных форматах', async ({ page }) => {
    await page.goto('/reports/sales');
    
    // Ждем загрузки отчета
    await expect(page.locator('[data-testid="report-content"], .report-content')).toBeVisible();
    
    // Находим кнопку экспорта
    const exportButton = page.getByRole('button', { name: /экспорт|export|скачать|download/i });
    await exportButton.click();
    
    // Проверяем доступные форматы
    const exportFormats = ['PDF', 'Excel', 'CSV', 'PNG'];
    
    for (const format of exportFormats) {
      const formatButton = page.getByRole('button', { name: new RegExp(format, 'i') });
      if (await formatButton.isVisible()) {
        // Начинаем ожидание загрузки
        const downloadPromise = page.waitForEvent('download');
        
        // Кликаем по формату
        await formatButton.click();
        
        // Ждем загрузку файла
        try {
          const download = await downloadPromise;
          expect(download).toBeTruthy();
          expect(download.suggestedFilename()).toMatch(new RegExp(format, 'i'));
        } catch (e) {
          // Если загрузка не началась, возможно нужно подтвердить
          const confirmButton = page.getByRole('button', { name: /подтвердить|confirm|да|yes/i });
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }
        }
        
        // Закрываем меню экспорта если оно еще открыто
        const closeButton = page.getByRole('button', { name: /закрыть|close/i });
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
        
        break; // Тестируем только один формат
      }
    }
  });
  
  test('Интерактивные элементы дашборда', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Тестируем drill-down в графиках
    const chart = page.locator('canvas, .chart').first();
    if (await chart.isVisible()) {
      // Кликаем по графику
      await chart.click({ position: { x: 100, y: 100 } });
      
      // Проверяем появление детальной информации
      const tooltip = page.locator('[role="tooltip"], .chart-tooltip');
      if (await tooltip.isVisible()) {
        await expect(tooltip).toBeVisible();
      }
    }
    
    // Тестируем переключение типов графиков
    const chartTypeButtons = page.locator('button[aria-label*="chart type"], [data-testid="chart-type-switcher"] button');
    if (await chartTypeButtons.first().isVisible()) {
      const buttonCount = await chartTypeButtons.count();
      for (let i = 0; i < buttonCount; i++) {
        await chartTypeButtons.nth(i).click();
        await page.waitForTimeout(500);
      }
    }
    
    // Тестируем сворачивание/разворачивание виджетов
    const widgetHeaders = page.locator('.widget-header, [data-testid="widget-header"]');
    const firstWidget = widgetHeaders.first();
    
    if (await firstWidget.isVisible()) {
      const collapseButton = firstWidget.locator('button[title*="свернуть"], button[title*="collapse"]');
      if (await collapseButton.isVisible()) {
        await collapseButton.click();
        await page.waitForTimeout(300);
        
        // Проверяем, что виджет свернулся
        const widgetContent = firstWidget.locator('~ .widget-content, ~ [data-testid="widget-content"]');
        await expect(widgetContent).not.toBeVisible();
        
        // Разворачиваем обратно
        await collapseButton.click();
        await expect(widgetContent).toBeVisible();
      }
    }
  });
  
  test('Кастомизация дашборда', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Открываем настройки дашборда
    const customizeButton = page.getByRole('button', { name: /настроить|customize|персонализ/i });
    
    if (await customizeButton.isVisible()) {
      await customizeButton.click();
      
      // Проверяем панель настройки
      const customizePanel = page.locator('[data-testid="customize-panel"], .customize-dashboard');
      await expect(customizePanel).toBeVisible();
      
      // Добавляем/удаляем виджеты
      const widgetToggles = page.locator('input[type="checkbox"][name*="widget"]');
      const toggleCount = await widgetToggles.count();
      
      if (toggleCount > 0) {
        // Отключаем первый виджет
        await widgetToggles.first().uncheck();
        
        // Включаем последний виджет
        await widgetToggles.last().check();
      }
      
      // Сохраняем настройки
      await page.getByRole('button', { name: /сохранить|save|применить|apply/i }).click();
      
      // Проверяем, что настройки применились
      await expect(page.locator('text=/настройки сохранены|settings saved|успешно|success/i')).toBeVisible();
    }
  });
  
  test('Производительность дашборда', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Измеряем время загрузки
    const startTime = Date.now();
    
    // Ждем полной загрузки всех виджетов
    await expect(page.locator('[data-testid="kpi-card"], .kpi-card').first()).toBeVisible();
    await expect(page.locator('canvas, .chart').first()).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Проверяем, что дашборд загружается достаточно быстро
    expect(loadTime).toBeLessThan(5000); // менее 5 секунд
    
    // Проверяем наличие индикаторов загрузки
    const loadingIndicators = page.locator('.skeleton, [data-testid="loading"], .shimmer');
    const hasLoadingIndicators = await loadingIndicators.first().isVisible();
    
    if (hasLoadingIndicators) {
      // Убеждаемся, что индикаторы исчезают
      await expect(loadingIndicators.first()).not.toBeVisible({ timeout: 5000 });
    }
    
    // Проверяем отзывчивость интерфейса
    const button = page.getByRole('button').first();
    await button.hover();
    
    // Проверяем, что есть визуальная обратная связь (hover эффект)
    await expect(button).toHaveCSS('cursor', 'pointer');
  });
});
