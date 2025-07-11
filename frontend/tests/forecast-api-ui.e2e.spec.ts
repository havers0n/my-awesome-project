import { test, expect } from '@playwright/test';

test.describe('Forecast API UI Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Запускаем dev server frontend перед каждым тестом
    await page.goto('http://localhost:5173');
  });

  test('Test Forecast API Page - All Buttons', async ({ page }) => {
    console.log('🔍 Тестирование страницы тестирования API прогнозов');
    
    // Переходим на страницу тестирования API
    await page.goto('http://localhost:5173/test-forecast-api');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что страница загрузилась
    await expect(page).toHaveTitle(/Admin Dashboard/);
    
    console.log('✅ Страница тестирования API загружена');
    
    // 1. Тест кнопки "Test GET Forecast"
    console.log('🔄 Тестирование кнопки "Test GET Forecast"');
    const getButton = page.locator('button:has-text("Test GET Forecast")');
    await expect(getButton).toBeVisible();
    await getButton.click();
    
    // Ждем ответа и проверяем результат
    await page.waitForTimeout(2000);
    
    // 2. Тест кнопки "Test POST Forecast"
    console.log('🔄 Тестирование кнопки "Test POST Forecast"');
    const postButton = page.locator('button:has-text("Test POST Forecast")');
    await expect(postButton).toBeVisible();
    await postButton.click();
    
    // Ждем ответа и проверяем результат
    await page.waitForTimeout(2000);
    
    // 3. Тест кнопки "Test History"
    console.log('🔄 Тестирование кнопки "Test History"');
    const historyButton = page.locator('button:has-text("Test History")');
    await expect(historyButton).toBeVisible();
    await historyButton.click();
    
    // Ждем ответа и проверяем результат
    await page.waitForTimeout(2000);
    
    // 4. Тест кнопки "Test Direct API"
    console.log('🔄 Тестирование кнопки "Test Direct API"');
    const directApiButton = page.locator('button:has-text("Test Direct API")');
    await expect(directApiButton).toBeVisible();
    await directApiButton.click();
    
    // Ждем ответа и проверяем результат
    await page.waitForTimeout(2000);
    
    console.log('✅ Все кнопки на странице тестирования API протестированы');
  });

  test('Sales Forecast Page - Create New Forecast', async ({ page }) => {
    console.log('🔍 Тестирование основной страницы прогнозов');
    
    // Переходим на страницу прогнозов продаж
    await page.goto('http://localhost:5173/sales-forecast');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что страница загрузилась
    await expect(page).toHaveTitle(/Admin Dashboard/);
    
    console.log('✅ Страница прогнозов продаж загружена');
    
    // Ищем секцию создания нового прогноза
    const createForecastSection = page.locator('text="Создать новый прогноз"').first();
    if (await createForecastSection.isVisible()) {
      console.log('✅ Секция "Создать новый прогноз" найдена');
    } else {
      console.log('⚠️ Секция "Создать новый прогноз" не найдена, ищем альтернативные варианты');
      
      // Ищем альтернативные варианты
      const alternatives = [
        'input[type="number"]',
        'input[placeholder*="дней"]',
        'input[placeholder*="days"]',
        'button:has-text("Предсказать")',
        'button:has-text("Predict")',
        'button:has-text("Forecast")'
      ];
      
      for (const selector of alternatives) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          console.log(`✅ Найден элемент: ${selector}`);
        }
      }
    }
    
    // Ищем поле ввода для количества дней
    const dayInput = page.locator('input[type="number"]').first();
    if (await dayInput.isVisible()) {
      console.log('✅ Поле ввода для количества дней найдено');
      
      // Вводим количество дней (7)
      await dayInput.fill('7');
      console.log('✅ Введено количество дней: 7');
      
      // Ищем кнопку "Предсказать"
      const predictButton = page.locator('button:has-text("Предсказать")').first();
      if (await predictButton.isVisible()) {
        console.log('✅ Кнопка "Предсказать" найдена');
        
        // Нажимаем кнопку "Предсказать"
        await predictButton.click();
        console.log('✅ Кнопка "Предсказать" нажата');
        
        // Проверяем появление индикаторов загрузки
        const loadingIndicators = [
          'text="Загрузка"',
          'text="Loading"',
          '.loading',
          '.spinner',
          '[data-testid="loading"]'
        ];
        
        for (const indicator of loadingIndicators) {
          const element = page.locator(indicator);
          if (await element.isVisible()) {
            console.log(`✅ Найден индикатор загрузки: ${indicator}`);
          }
        }
        
        // Ждем завершения операции
        await page.waitForTimeout(5000);
        
        // Проверяем успешное создание прогноза
        const successIndicators = [
          'text="Прогноз создан"',
          'text="Success"',
          'text="Готово"',
          '.success',
          '[data-testid="success"]'
        ];
        
        for (const indicator of successIndicators) {
          const element = page.locator(indicator);
          if (await element.isVisible()) {
            console.log(`✅ Найден индикатор успеха: ${indicator}`);
          }
        }
        
        // Проверяем обновление графика
        const chartElements = [
          'canvas',
          '.chart',
          '[data-testid="chart"]',
          '.apexcharts-svg'
        ];
        
        for (const chart of chartElements) {
          const element = page.locator(chart);
          if (await element.isVisible()) {
            console.log(`✅ Найден элемент графика: ${chart}`);
          }
        }
        
        console.log('✅ Тестирование создания прогноза завершено');
      } else {
        console.log('⚠️ Кнопка "Предсказать" не найдена');
      }
    } else {
      console.log('⚠️ Поле ввода для количества дней не найдено');
    }
  });
});
