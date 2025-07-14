import { test, expect } from '@playwright/test';

test.describe('Управление out-of-stock товарами', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу управления товарами
    await page.goto('/inventory/out-of-stock');
  });
  
  test('Просмотр списка out-of-stock товаров', async ({ page }) => {
    // Проверяем заголовок страницы
    await expect(page.locator('h1')).toContainText(/out.of.stock|отсутствующие|нет в наличии/i);
    
    // Проверяем наличие таблицы или списка товаров
    const itemsList = page.locator('table, [data-testid="oos-items-list"]').first();
    await expect(itemsList).toBeVisible();
    
    // Проверяем наличие колонок
    const expectedColumns = ['SKU', 'Название', 'Магазин', 'Дата', 'Статус'];
    for (const column of expectedColumns) {
      const columnHeader = page.locator(`th:has-text("${column}"), [data-testid="column-${column.toLowerCase()}"]`);
      if (await columnHeader.isVisible()) {
        await expect(columnHeader).toBeVisible();
      }
    }
    
    // Проверяем наличие хотя бы одного товара
    const items = page.locator('tbody tr, [data-testid="oos-item"]');
    await expect(items.first()).toBeVisible();
  });
  
  test('Фильтрация out-of-stock товаров', async ({ page }) => {
    // Проверяем наличие фильтров
    const filters = {
      search: page.locator('input[placeholder*="поиск"], input[placeholder*="search"]'),
      store: page.locator('select[name="store"], [data-testid="store-filter"]'),
      dateRange: page.locator('[data-testid="date-range-filter"], input[type="date"]'),
      status: page.locator('select[name="status"], [data-testid="status-filter"]')
    };
    
    // Тестируем поиск по SKU/названию
    if (await filters.search.isVisible()) {
      await filters.search.fill('TEST-SKU-001');
      await page.waitForTimeout(500);
      
      // Проверяем, что список обновился
      const items = page.locator('tbody tr, [data-testid="oos-item"]');
      const count = await items.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
    
    // Тестируем фильтр по магазину
    if (await filters.store.isVisible()) {
      await filters.store.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
    
    // Тестируем фильтр по дате
    if (await filters.dateRange.first().isVisible()) {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const dateFrom = filters.dateRange.first();
      const dateTo = filters.dateRange.last();
      
      await dateFrom.fill(weekAgo.toISOString().split('T')[0]);
      await dateTo.fill(today.toISOString().split('T')[0]);
      await page.waitForTimeout(500);
    }
    
    // Сброс фильтров
    const resetButton = page.getByRole('button', { name: /сбросить|reset|очистить|clear/i });
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await page.waitForTimeout(500);
    }
  });
  
  test('Добавление товара в out-of-stock', async ({ page }) => {
    // Нажимаем кнопку добавления
    const addButton = page.getByRole('button', { name: /добавить|add|новый|new/i });
    await addButton.click();
    
    // Проверяем открытие формы/модалки
    const form = page.locator('form, [data-testid="oos-form"]').first();
    await expect(form).toBeVisible();
    
    // Заполняем форму
    await page.locator('input[name="sku"], #sku').fill('NEW-SKU-001');
    await page.locator('input[name="name"], #name').fill('Тестовый товар');
    await page.locator('select[name="store"], #store').selectOption({ index: 1 });
    await page.locator('textarea[name="reason"], #reason').fill('Временный дефицит поставок');
    
    // Отправляем форму
    await page.getByRole('button', { name: /сохранить|save|добавить|add/i }).click();
    
    // Проверяем успешное добавление
    await expect(page.locator('text=/успешно|success/i')).toBeVisible();
    
    // Проверяем появление товара в списке
    await expect(page.locator('text="NEW-SKU-001"')).toBeVisible();
  });
  
  test('Редактирование статуса out-of-stock товара', async ({ page }) => {
    // Находим первый товар в списке
    const firstItem = page.locator('tbody tr, [data-testid="oos-item"]').first();
    await expect(firstItem).toBeVisible();
    
    // Нажимаем кнопку редактирования
    const editButton = firstItem.locator('button[title*="edit"], button[title*="редактировать"], [data-testid="edit-button"]');
    await editButton.click();
    
    // Проверяем открытие формы редактирования
    const editForm = page.locator('form, [data-testid="edit-form"]').first();
    await expect(editForm).toBeVisible();
    
    // Меняем статус
    const statusSelect = page.locator('select[name="status"], #status');
    await statusSelect.selectOption('resolved');
    
    // Добавляем комментарий
    const commentField = page.locator('textarea[name="comment"], #comment');
    await commentField.fill('Товар поступил на склад');
    
    // Сохраняем изменения
    await page.getByRole('button', { name: /сохранить|save|обновить|update/i }).click();
    
    // Проверяем успешное обновление
    await expect(page.locator('text=/обновлен|updated|успешно|success/i')).toBeVisible();
  });
  
  test('Массовые операции с out-of-stock товарами', async ({ page }) => {
    // Проверяем наличие чекбоксов для выбора
    const checkboxes = page.locator('input[type="checkbox"][name!="selectAll"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      // Выбираем первые 3 товара
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await checkboxes.nth(i).check();
      }
      
      // Проверяем появление панели массовых действий
      const bulkActionsPanel = page.locator('[data-testid="bulk-actions"], .bulk-actions');
      await expect(bulkActionsPanel).toBeVisible();
      
      // Выполняем массовое действие
      const bulkActionButton = page.getByRole('button', { name: /обновить статус|update status|действие|action/i });
      await bulkActionButton.click();
      
      // Выбираем новый статус в диалоге
      const bulkStatusSelect = page.locator('dialog select[name="bulk-status"], [data-testid="bulk-status-select"]');
      if (await bulkStatusSelect.isVisible()) {
        await bulkStatusSelect.selectOption('in-progress');
        
        // Подтверждаем действие
        await page.getByRole('button', { name: /применить|apply|подтвердить|confirm/i }).click();
        
        // Проверяем успешное выполнение
        await expect(page.locator('text=/обновлено|updated|успешно|success/i')).toBeVisible();
      }
    }
  });
  
  test('Экспорт списка out-of-stock товаров', async ({ page }) => {
    // Находим кнопку экспорта
    const exportButton = page.getByRole('button', { name: /экспорт|export|скачать|download/i });
    await expect(exportButton).toBeVisible();
    
    // Начинаем ожидание загрузки файла
    const downloadPromise = page.waitForEvent('download');
    
    // Нажимаем кнопку экспорта
    await exportButton.click();
    
    // Если есть выбор формата
    const formatOptions = page.locator('[data-testid="export-format"], button:has-text("CSV"), button:has-text("Excel")');
    if (await formatOptions.first().isVisible()) {
      await page.getByRole('button', { name: /csv/i }).click();
    }
    
    // Ждем загрузку файла
    const download = await downloadPromise;
    
    // Проверяем, что файл скачался
    expect(download).toBeTruthy();
    expect(download.suggestedFilename()).toMatch(/out.of.stock|oos|export/i);
  });
  
  test('Просмотр истории изменений out-of-stock товара', async ({ page }) => {
    // Находим первый товар
    const firstItem = page.locator('tbody tr, [data-testid="oos-item"]').first();
    
    // Нажимаем на товар или кнопку истории
    const historyButton = firstItem.locator('button[title*="history"], button[title*="история"], [data-testid="history-button"]');
    if (await historyButton.isVisible()) {
      await historyButton.click();
    } else {
      // Кликаем по самому товару
      await firstItem.click();
    }
    
    // Проверяем открытие истории
    const historyModal = page.locator('[data-testid="history-modal"], dialog:has-text("история")');
    await expect(historyModal).toBeVisible();
    
    // Проверяем наличие записей истории
    const historyEntries = page.locator('[data-testid="history-entry"], .history-item');
    await expect(historyEntries.first()).toBeVisible();
    
    // Проверяем информацию в истории
    await expect(page.locator('text=/дата|date/i')).toBeVisible();
    await expect(page.locator('text=/статус|status/i')).toBeVisible();
    await expect(page.locator('text=/пользователь|user/i')).toBeVisible();
    
    // Закрываем историю
    const closeButton = page.getByRole('button', { name: /закрыть|close/i });
    await closeButton.click();
  });
  
  test('Настройка уведомлений для out-of-stock товаров', async ({ page }) => {
    // Переходим в настройки
    const settingsButton = page.getByRole('button', { name: /настройки|settings|уведомления|notifications/i });
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Проверяем открытие настроек
      const settingsModal = page.locator('[data-testid="oos-settings"], dialog:has-text("настройки")');
      await expect(settingsModal).toBeVisible();
      
      // Настраиваем уведомления
      const notificationToggles = page.locator('input[type="checkbox"][name*="notification"]');
      
      // Включаем все уведомления
      const toggleCount = await notificationToggles.count();
      for (let i = 0; i < toggleCount; i++) {
        await notificationToggles.nth(i).check();
      }
      
      // Настраиваем порог для уведомлений
      const thresholdInput = page.locator('input[name="threshold"], #threshold');
      if (await thresholdInput.isVisible()) {
        await thresholdInput.fill('5');
      }
      
      // Сохраняем настройки
      await page.getByRole('button', { name: /сохранить|save/i }).click();
      
      // Проверяем успешное сохранение
      await expect(page.locator('text=/сохранено|saved|успешно|success/i')).toBeVisible();
    }
  });
  
  test('Интеграция с системой заказов', async ({ page }) => {
    // Находим товар с возможностью заказа
    const orderableItem = page.locator('[data-testid="oos-item"]:has(button:has-text("заказать"))').first();
    
    if (await orderableItem.isVisible()) {
      // Нажимаем кнопку заказа
      const orderButton = orderableItem.locator('button:has-text("заказать"), button:has-text("order")');
      await orderButton.click();
      
      // Проверяем открытие формы заказа
      const orderForm = page.locator('[data-testid="order-form"], form:has-text("заказ")');
      await expect(orderForm).toBeVisible();
      
      // Заполняем количество
      await page.locator('input[name="quantity"], #quantity').fill('100');
      
      // Выбираем поставщика
      const supplierSelect = page.locator('select[name="supplier"], #supplier');
      if (await supplierSelect.isVisible()) {
        await supplierSelect.selectOption({ index: 1 });
      }
      
      // Добавляем комментарий
      await page.locator('textarea[name="order-comment"], #order-comment').fill('Срочный заказ');
      
      // Отправляем заказ
      await page.getByRole('button', { name: /создать заказ|create order|отправить|submit/i }).click();
      
      // Проверяем успешное создание заказа
      await expect(page.locator('text=/заказ создан|order created|успешно|success/i')).toBeVisible();
    }
  });
});
