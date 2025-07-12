import { test, expect, devices } from '@playwright/test';

test.describe('Экспорт данных', () => {
  test('Экспорт данных из таблицы продуктов', async ({ page }) => {
    await page.goto('/products');
    
    // Ждем загрузки таблицы
    await expect(page.locator('table, [data-testid="products-table"]')).toBeVisible();
    
    // Находим кнопку экспорта
    const exportButton = page.getByRole('button', { name: /экспорт|export/i });
    await exportButton.click();
    
    // Проверяем доступные форматы экспорта
    const formats = {
      'CSV': '.csv',
      'Excel': '.xlsx',
      'PDF': '.pdf',
      'JSON': '.json'
    };
    
    for (const [format, extension] of Object.entries(formats)) {
      const formatButton = page.getByRole('button', { name: new RegExp(format, 'i') });
      
      if (await formatButton.isVisible()) {
        // Начинаем ожидание загрузки
        const downloadPromise = page.waitForEvent('download');
        
        // Кликаем по формату
        await formatButton.click();
        
        // Ждем загрузку файла
        const download = await downloadPromise;
        
        // Проверяем файл
        expect(download).toBeTruthy();
        expect(download.suggestedFilename()).toContain(extension);
        
        // Проверяем размер файла
        const path = await download.path();
        if (path) {
          const stats = await page.evaluateHandle((filePath) => {
            const fs = require('fs');
            return fs.statSync(filePath);
          }, path);
          
          const size = await stats.jsonValue();
          expect(size.size).toBeGreaterThan(0);
        }
        
        break; // Тестируем только первый доступный формат
      }
    }
  });
  
  test('Экспорт с применением фильтров', async ({ page }) => {
    await page.goto('/sales-forecast');
    
    // Применяем фильтры
    const dateFilter = page.locator('input[type="date"]').first();
    if (await dateFilter.isVisible()) {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      await dateFilter.fill(lastWeek.toISOString().split('T')[0]);
    }
    
    // Создаем прогноз
    await page.locator('input[type="number"]').first().fill('7');
    await page.getByRole('button', { name: /предсказать|прогноз/i }).click();
    await page.waitForTimeout(3000);
    
    // Экспортируем отфильтрованные данные
    const exportButton = page.getByRole('button', { name: /экспорт|export/i });
    await exportButton.click();
    
    // Выбираем CSV
    const csvButton = page.getByRole('button', { name: /csv/i });
    if (await csvButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await csvButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('forecast');
      expect(download.suggestedFilename()).toContain('.csv');
    }
  });
  
  test('Массовый экспорт данных', async ({ page }) => {
    await page.goto('/reports');
    
    // Находим кнопку массового экспорта
    const bulkExportButton = page.getByRole('button', { name: /массовый экспорт|bulk export|экспортировать все/i });
    
    if (await bulkExportButton.isVisible()) {
      await bulkExportButton.click();
      
      // Выбираем отчеты для экспорта
      const reportCheckboxes = page.locator('input[type="checkbox"][name*="report"]');
      const checkboxCount = await reportCheckboxes.count();
      
      // Выбираем первые 3 отчета
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await reportCheckboxes.nth(i).check();
      }
      
      // Выбираем формат
      const formatSelect = page.locator('select[name="export-format"]');
      await formatSelect.selectOption('zip');
      
      // Начинаем экспорт
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /начать экспорт|start export|скачать/i }).click();
      
      // Проверяем загрузку архива
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.zip');
    }
  });
  
  test('Настройка параметров экспорта', async ({ page }) => {
    await page.goto('/products');
    
    // Открываем расширенные настройки экспорта
    const exportButton = page.getByRole('button', { name: /экспорт|export/i });
    await exportButton.click();
    
    const advancedButton = page.getByRole('button', { name: /расширенные|advanced|настройки|settings/i });
    if (await advancedButton.isVisible()) {
      await advancedButton.click();
      
      // Настраиваем параметры
      const exportSettings = page.locator('[data-testid="export-settings"], .export-settings');
      await expect(exportSettings).toBeVisible();
      
      // Выбираем колонки для экспорта
      const columnCheckboxes = page.locator('input[type="checkbox"][name*="column"]');
      const columnCount = await columnCheckboxes.count();
      
      // Отключаем некоторые колонки
      for (let i = 0; i < columnCount; i++) {
        if (i % 2 === 0) {
          await columnCheckboxes.nth(i).uncheck();
        }
      }
      
      // Настраиваем форматирование
      const includeHeaders = page.locator('input[name="include-headers"]');
      await includeHeaders.check();
      
      const dateFormat = page.locator('select[name="date-format"]');
      await dateFormat.selectOption('ISO');
      
      // Применяем настройки и экспортируем
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /экспортировать|export|применить и скачать/i }).click();
      
      const download = await downloadPromise;
      expect(download).toBeTruthy();
    }
  });
});

test.describe('Мобильная адаптивность', () => {
  test.use({ ...devices['iPhone 12'] });
  
  test('Навигация на мобильном устройстве', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем мобильное меню
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Открываем меню
    await mobileMenuButton.click();
    
    // Проверяем, что меню открылось
    const mobileNav = page.locator('[data-testid="mobile-nav"], nav.mobile-menu');
    await expect(mobileNav).toBeVisible();
    
    // Проверяем пункты меню
    const menuItems = [
      'Дашборд',
      'Прогноз продаж',
      'Инвентарь',
      'Отчеты',
      'Настройки'
    ];
    
    for (const item of menuItems) {
      await expect(page.locator(`text=/${item}/i`)).toBeVisible();
    }
    
    // Переходим по пункту меню
    await page.getByRole('link', { name: /прогноз продаж/i }).click();
    
    // Проверяем, что меню закрылось после перехода
    await expect(mobileNav).not.toBeVisible();
    
    // Проверяем, что страница загрузилась
    await expect(page).toHaveURL(/sales-forecast/);
  });
  
  test('Адаптивные таблицы', async ({ page }) => {
    await page.goto('/products');
    
    // Проверяем, что таблица адаптирована для мобильных
    const table = page.locator('table, [data-testid="products-table"]');
    await expect(table).toBeVisible();
    
    // Проверяем горизонтальную прокрутку
    const tableWrapper = page.locator('.table-wrapper, [data-testid="table-scroll-wrapper"]');
    if (await tableWrapper.isVisible()) {
      // Проверяем, что можно скроллить
      await tableWrapper.evaluate(el => el.scrollLeft = 100);
      await page.waitForTimeout(300);
      
      const scrollLeft = await tableWrapper.evaluate(el => el.scrollLeft);
      expect(scrollLeft).toBeGreaterThan(0);
    }
    
    // Проверяем мобильный вид карточек (если есть)
    const mobileCards = page.locator('[data-testid="mobile-card"], .mobile-card-view');
    if (await mobileCards.first().isVisible()) {
      await expect(mobileCards.first()).toBeVisible();
      
      // Проверяем, что информация отображается корректно
      const cardInfo = mobileCards.first().locator('.card-info, [data-testid="card-content"]');
      await expect(cardInfo).toBeVisible();
    }
  });
  
  test('Адаптивные формы', async ({ page }) => {
    await page.goto('/sales-forecast');
    
    // Проверяем адаптацию формы прогноза
    const forecastForm = page.locator('form, [data-testid="forecast-form"]').first();
    
    // Проверяем, что поля формы занимают полную ширину
    const input = page.locator('input[type="number"]').first();
    const inputWidth = await input.evaluate(el => el.offsetWidth);
    const containerWidth = await forecastForm.evaluate(el => el.offsetWidth);
    
    // Поле должно занимать большую часть ширины контейнера
    expect(inputWidth / containerWidth).toBeGreaterThan(0.8);
    
    // Проверяем, что кнопки адаптированы
    const button = page.getByRole('button', { name: /предсказать|прогноз/i });
    const buttonWidth = await button.evaluate(el => el.offsetWidth);
    
    // Кнопка должна быть достаточно широкой для удобного нажатия
    expect(buttonWidth).toBeGreaterThan(150);
  });
  
  test('Адаптивные графики', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Проверяем, что графики адаптируются под размер экрана
    const chart = page.locator('canvas, .chart, [data-testid="chart"]').first();
    await expect(chart).toBeVisible();
    
    // Получаем размеры графика
    const chartSize = await chart.evaluate(el => ({
      width: el.offsetWidth,
      height: el.offsetHeight
    }));
    
    // Проверяем, что график занимает доступную ширину
    const viewport = page.viewportSize();
    expect(chartSize.width).toBeLessThanOrEqual(viewport!.width);
    expect(chartSize.width).toBeGreaterThan(viewport!.width * 0.8);
    
    // Проверяем возможность взаимодействия с графиком
    await chart.tap({ position: { x: 50, y: 50 } });
    
    // Проверяем появление тултипа
    const tooltip = page.locator('[role="tooltip"], .chart-tooltip');
    if (await tooltip.isVisible()) {
      await expect(tooltip).toBeVisible();
    }
  });
  
  test('Свайпы и жесты', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Находим карусель или слайдер
    const carousel = page.locator('[data-testid="carousel"], .swiper, .slider');
    
    if (await carousel.isVisible()) {
      // Получаем начальную позицию
      const initialTransform = await carousel.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.transform;
      });
      
      // Выполняем свайп
      await carousel.dragTo(carousel, {
        sourcePosition: { x: 200, y: 50 },
        targetPosition: { x: 50, y: 50 }
      });
      
      // Проверяем, что элемент сдвинулся
      const newTransform = await carousel.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.transform;
      });
      
      expect(newTransform).not.toBe(initialTransform);
    }
  });
});

test.describe('Планшетная адаптивность', () => {
  test.use({ ...devices['iPad'] });
  
  test('Макет для планшета', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Проверяем двухколоночный макет
    const sidebar = page.locator('[data-testid="sidebar"], aside');
    const mainContent = page.locator('[data-testid="main-content"], main');
    
    // На планшете sidebar должен быть видим
    await expect(sidebar).toBeVisible();
    await expect(mainContent).toBeVisible();
    
    // Проверяем, что элементы расположены рядом
    const sidebarBox = await sidebar.boundingBox();
    const mainBox = await mainContent.boundingBox();
    
    if (sidebarBox && mainBox) {
      // Sidebar слева, main content справа
      expect(sidebarBox.x).toBeLessThan(mainBox.x);
      expect(sidebarBox.x + sidebarBox.width).toBeLessThanOrEqual(mainBox.x);
    }
  });
  
  test('Сетка виджетов на планшете', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Проверяем сетку виджетов
    const widgets = page.locator('[data-testid="widget"], .widget, .dashboard-card');
    const widgetCount = await widgets.count();
    
    if (widgetCount >= 2) {
      const firstWidget = await widgets.first().boundingBox();
      const secondWidget = await widgets.nth(1).boundingBox();
      
      if (firstWidget && secondWidget) {
        // Проверяем, что виджеты расположены в сетке
        const sameRow = Math.abs(firstWidget.y - secondWidget.y) < 10;
        
        if (sameRow) {
          // Виджеты в одной строке
          expect(firstWidget.x).not.toBe(secondWidget.x);
        }
      }
    }
  });
});

test.describe('Тесты производительности на мобильных устройствах', () => {
  test.use({ 
    ...devices['iPhone 12'],
    // Эмулируем медленную сеть
    offline: false,
    // Замедляем CPU
    cpuThrottling: 4
  });
  
  test('Производительность на медленных устройствах', async ({ page }) => {
    // Измеряем время загрузки
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    
    // Ждем основных элементов
    await expect(page.locator('[data-testid="kpi-card"], .kpi-card').first()).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // На медленных устройствах допускаем больше времени
    expect(loadTime).toBeLessThan(10000); // 10 секунд
    
    // Проверяем lazy loading изображений
    const images = page.locator('img[loading="lazy"]');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Проверяем, что изображения имеют атрибут loading="lazy"
      for (let i = 0; i < imageCount; i++) {
        const loading = await images.nth(i).getAttribute('loading');
        expect(loading).toBe('lazy');
      }
    }
    
    // Проверяем оптимизацию шрифтов
    const fontDisplay = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule instanceof CSSFontFaceRule) {
              return rule.style.fontDisplay;
            }
          }
        } catch (e) {
          // Игнорируем ошибки доступа к внешним стилям
        }
      }
      return null;
    });
    
    if (fontDisplay) {
      expect(['swap', 'optional', 'fallback']).toContain(fontDisplay);
    }
  });
});
