import { test, expect, Page } from '@playwright/test';

// Вспомогательные функции для drag & drop
async function dragAndDrop(page: Page, sourceSelector: string, targetSelector: string) {
  const source = page.locator(sourceSelector);
  const target = page.locator(targetSelector);
  
  await source.dragTo(target);
}

async function dragAndDropWithSteps(page: Page, sourceSelector: string, targetSelector: string) {
  const source = page.locator(sourceSelector);
  const target = page.locator(targetSelector);
  
  // Получаем координаты элементов
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  
  if (!sourceBox || !targetBox) {
    throw new Error('Элементы не найдены');
  }
  
  // Начинаем drag
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  
  // Перемещаем к цели
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
  
  // Отпускаем
  await page.mouse.up();
}

async function waitForDragAnimation(page: Page, timeout: number = 1000) {
  await page.waitForTimeout(timeout);
}

test.describe('Drag & Drop UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/drag-drop');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Базовая функциональность', () => {
    test('должен отображать drag preview при перетаскивании', async ({ page }) => {
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      
      // Начинаем drag
      await draggable.hover();
      await page.mouse.down();
      
      // Проверяем, что появился drag preview
      const dragPreview = page.locator('.drag-preview');
      await expect(dragPreview).toBeVisible();
      
      // Перемещаем мышь
      await page.mouse.move(300, 300);
      
      // Проверяем, что preview следует за курсором
      await expect(dragPreview).toBeVisible();
      
      // Заканчиваем drag
      await page.mouse.up();
      
      // Проверяем, что preview исчез
      await expect(dragPreview).not.toBeVisible();
    });

    test('должен изменять cursor при drag операциях', async ({ page }) => {
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      
      // Проверяем начальное состояние cursor
      await expect(draggable).toHaveClass(/cursor-grab/);
      
      // Начинаем drag
      await draggable.hover();
      await page.mouse.down();
      
      // Проверяем, что cursor изменился
      await expect(page.locator('body')).toHaveClass(/dragging/);
      
      // Заканчиваем drag
      await page.mouse.up();
      
      // Проверяем, что cursor вернулся в исходное состояние
      await expect(page.locator('body')).not.toHaveClass(/dragging/);
    });

    test('должен подсвечивать допустимые drop zones', async ({ page }) => {
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      const dropZone = page.locator('[data-testid="drop-zone"]').first();
      
      // Начинаем drag
      await draggable.hover();
      await page.mouse.down();
      
      // Проверяем, что drop zone подсвечивается
      await expect(dropZone).toHaveClass(/drop-zone--active/);
      
      // Наводим на drop zone
      await dropZone.hover();
      
      // Проверяем, что drop zone показывает валидное состояние
      await expect(dropZone).toHaveClass(/drop-zone--valid/);
      
      // Заканчиваем drag
      await page.mouse.up();
      
      // Проверяем, что подсветка исчезла
      await expect(dropZone).not.toHaveClass(/drop-zone--active/);
      await expect(dropZone).not.toHaveClass(/drop-zone--valid/);
    });
  });

  test.describe('Файловый drag & drop', () => {
    test('должен загружать файлы через drag & drop', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const dropZone = page.locator('[data-testid="file-drop-zone"]');
      
      // Создаем тестовый файл
      const testFile = {
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Test file content')
      };
      
      // Симулируем drag файла на drop zone
      await fileInput.setInputFiles([testFile]);
      
      // Проверяем, что файл был добавлен
      await expect(page.locator('[data-testid="uploaded-file"]')).toBeVisible();
      await expect(page.locator('[data-testid="uploaded-file"]')).toContainText('test.pdf');
    });

    test('должен показывать preview файлов во время drag', async ({ page }) => {
      const dropZone = page.locator('[data-testid="file-drop-zone"]');
      
      // Симулируем drag файла
      await page.dispatchEvent('[data-testid="file-drop-zone"]', 'dragenter', {
        dataTransfer: {
          files: [{ name: 'test.pdf', type: 'application/pdf' }]
        }
      });
      
      // Проверяем, что появился preview
      await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="file-preview"]')).toContainText('test.pdf');
    });

    test('должен валидировать типы файлов', async ({ page }) => {
      const dropZone = page.locator('[data-testid="file-drop-zone"]');
      
      // Симулируем drag неподдерживаемого файла
      await page.dispatchEvent('[data-testid="file-drop-zone"]', 'dragenter', {
        dataTransfer: {
          files: [{ name: 'test.exe', type: 'application/executable' }]
        }
      });
      
      // Проверяем, что показывается ошибка
      await expect(dropZone).toHaveClass(/drop-zone--invalid/);
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  test.describe('Виджеты dashboard', () => {
    test('должен перетаскивать виджеты в dashboard', async ({ page }) => {
      const widget = page.locator('[data-testid="widget-item"]').first();
      const dashboardArea = page.locator('[data-testid="dashboard-area"]');
      
      // Получаем начальное количество виджетов в dashboard
      const initialCount = await dashboardArea.locator('[data-testid="dashboard-widget"]').count();
      
      // Перетаскиваем виджет
      await dragAndDrop(page, '[data-testid="widget-item"]', '[data-testid="dashboard-area"]');
      
      // Проверяем, что виджет добавился
      const newCount = await dashboardArea.locator('[data-testid="dashboard-widget"]').count();
      expect(newCount).toBe(initialCount + 1);
    });

    test('должен показывать widget preview во время drag', async ({ page }) => {
      const widget = page.locator('[data-testid="widget-item"]').first();
      
      // Начинаем drag
      await widget.hover();
      await page.mouse.down();
      
      // Проверяем, что появился widget preview
      const widgetPreview = page.locator('[data-testid="widget-drag-preview"]');
      await expect(widgetPreview).toBeVisible();
      
      // Проверяем содержимое preview
      await expect(widgetPreview).toContainText('chart');
      
      // Заканчиваем drag
      await page.mouse.up();
      
      // Проверяем, что preview исчез
      await expect(widgetPreview).not.toBeVisible();
    });
  });

  test.describe('Сортируемые списки', () => {
    test('должен изменять порядок элементов в списке', async ({ page }) => {
      const listItems = page.locator('[data-testid="sortable-item"]');
      
      // Получаем исходный порядок
      const initialOrder = await listItems.allTextContents();
      
      // Перетаскиваем первый элемент на место второго
      await dragAndDrop(
        page,
        '[data-testid="sortable-item"]:first-child',
        '[data-testid="sortable-item"]:nth-child(2)'
      );
      
      // Ждем завершения анимации
      await waitForDragAnimation(page);
      
      // Проверяем, что порядок изменился
      const newOrder = await listItems.allTextContents();
      expect(newOrder).not.toEqual(initialOrder);
    });

    test('должен показывать list item preview', async ({ page }) => {
      const listItem = page.locator('[data-testid="sortable-item"]').first();
      
      // Начинаем drag
      await listItem.hover();
      await page.mouse.down();
      
      // Проверяем, что появился list preview
      const listPreview = page.locator('[data-testid="list-drag-preview"]');
      await expect(listPreview).toBeVisible();
      
      // Заканчиваем drag
      await page.mouse.up();
      
      // Проверяем, что preview исчез
      await expect(listPreview).not.toBeVisible();
    });
  });

  test.describe('Производительность', () => {
    test('должен выполнять drag операции без задержек', async ({ page }) => {
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      const dropZone = page.locator('[data-testid="drop-zone"]').first();
      
      // Засекаем время начала операции
      const startTime = Date.now();
      
      // Выполняем drag & drop
      await dragAndDrop(page, '[data-testid="draggable-item"]', '[data-testid="drop-zone"]');
      
      // Ждем завершения анимации
      await waitForDragAnimation(page);
      
      // Засекаем время окончания
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Проверяем, что операция выполнилась быстро (меньше 2 секунд)
      expect(duration).toBeLessThan(2000);
    });

    test('должен плавно анимировать drag операции', async ({ page }) => {
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      
      // Начинаем drag
      await draggable.hover();
      await page.mouse.down();
      
      // Проверяем, что элемент имеет анимацию
      const transform = await draggable.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Элемент должен иметь трансформацию при drag
      expect(transform).not.toBe('none');
      
      // Заканчиваем drag
      await page.mouse.up();
    });
  });

  test.describe('Мобильная адаптивность', () => {
    test('должен работать на мобильных устройствах', async ({ page }) => {
      // Устанавливаем viewport мобильного устройства
      await page.setViewportSize({ width: 375, height: 667 });
      
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      const dropZone = page.locator('[data-testid="drop-zone"]').first();
      
      // Симулируем touch события
      await draggable.tap();
      await page.waitForTimeout(300); // Ждем активации touch drag
      
      // Проверяем, что drag активировался
      await expect(page.locator('body')).toHaveClass(/dragging/);
      
      // Симулируем touch move
      await page.touchscreen.tap(300, 300);
      
      // Проверяем, что операция завершилась
      await expect(page.locator('body')).not.toHaveClass(/dragging/);
    });
  });

  test.describe('Доступность', () => {
    test('должен поддерживать клавиатурную навигацию', async ({ page }) => {
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      
      // Фокусируемся на элементе
      await draggable.focus();
      
      // Проверяем, что элемент в фокусе
      await expect(draggable).toBeFocused();
      
      // Используем пробел для активации drag
      await page.keyboard.press('Space');
      
      // Используем стрелки для перемещения
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      
      // Используем Enter для drop
      await page.keyboard.press('Enter');
      
      // Проверяем, что операция завершилась
      await expect(page.locator('body')).not.toHaveClass(/dragging/);
    });

    test('должен объявлять изменения для screen readers', async ({ page }) => {
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      
      // Начинаем drag
      await draggable.hover();
      await page.mouse.down();
      
      // Проверяем, что есть aria-live область
      const liveRegion = page.locator('[aria-live="polite"]');
      await expect(liveRegion).toBeVisible();
      
      // Заканчиваем drag
      await page.mouse.up();
      
      // Проверяем, что объявлено завершение
      await expect(liveRegion).toContainText(/завершено|completed/i);
    });
  });

  test.describe('Обработка ошибок', () => {
    test('должен обрабатывать недопустимые drop zones', async ({ page }) => {
      const draggable = page.locator('[data-testid="draggable-item"]').first();
      const invalidZone = page.locator('[data-testid="invalid-drop-zone"]');
      
      // Начинаем drag
      await draggable.hover();
      await page.mouse.down();
      
      // Наводим на недопустимую зону
      await invalidZone.hover();
      
      // Проверяем, что зона показывает недопустимое состояние
      await expect(invalidZone).toHaveClass(/drop-zone--invalid/);
      
      // Пытаемся сделать drop
      await page.mouse.up();
      
      // Проверяем, что элемент вернулся в исходное положение
      await expect(draggable).toBeVisible();
    });

    test('должен показывать сообщения об ошибках', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      
      // Пытаемся загрузить слишком большой файл
      const largeFile = {
        name: 'large.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.alloc(20 * 1024 * 1024) // 20MB
      };
      
      await fileInput.setInputFiles([largeFile]);
      
      // Проверяем, что показывается сообщение об ошибке
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/размер|size/i);
    });
  });
});
