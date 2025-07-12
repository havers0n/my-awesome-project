# E2E Testing Guide

## Обзор

Этот проект использует Playwright для end-to-end тестирования. Тесты покрывают критические пользовательские сценарии, мобильную адаптивность и производительность.

## Установка

```bash
# Установка Playwright и зависимостей
npm run playwright:install

# Установка Lighthouse для тестов производительности
npm run lighthouse:install
```

## Структура тестов

```
tests/
├── helpers/
│   └── test-helpers.ts      # Вспомогательные функции
├── .auth/                   # Сохраненные состояния авторизации
├── auth-flow.e2e.spec.ts    # Тесты авторизации
├── sales-forecast-flow.e2e.spec.ts  # Тесты прогноза продаж
├── out-of-stock.e2e.spec.ts # Тесты управления инвентарем
├── dashboards-reports.e2e.spec.ts # Тесты дашбордов
├── export-mobile.e2e.spec.ts # Тесты экспорта и мобильности
├── performance.e2e.spec.ts   # Тесты производительности
├── global.setup.ts          # Глобальная настройка
└── run-e2e-tests.js         # Скрипт запуска тестов
```

## Запуск тестов

### Все тесты
```bash
npm run e2e
```

### Конкретные категории
```bash
npm run e2e:auth        # Только тесты авторизации
npm run e2e:forecast    # Только тесты прогноза продаж
npm run e2e:inventory   # Только тесты инвентаря
npm run e2e:dashboard   # Только тесты дашбордов
npm run e2e:export      # Только тесты экспорта
npm run e2e:mobile      # Только мобильные тесты
npm run e2e:performance # Только тесты производительности
```

### Режимы запуска
```bash
npm run e2e:parallel    # Параллельный запуск (быстрее)
npm run e2e:headed      # С отображением браузера
npm run e2e:debug       # Режим отладки
```

### Конкретные браузеры
```bash
npm run e2e:chromium    # Только Chromium
npm run e2e:firefox     # Только Firefox  
npm run e2e:webkit      # Только WebKit/Safari
npm run e2e:mobile-devices # Мобильные устройства
```

### Отчеты и скриншоты
```bash
npm run e2e:report      # Открыть HTML отчет
npm run e2e:update-snapshots # Обновить скриншоты
```

## Конфигурация

### playwright.config.ts
- **workers**: 4 (параллельные процессы)
- **timeout**: 60 секунд на тест
- **retries**: 2 на CI, 1 локально
- **screenshots**: при падении тестов
- **videos**: при падении тестов
- **trace**: при повторных попытках

### Поддерживаемые устройства
- Desktop: Chrome, Firefox, Safari
- Mobile: iPhone 12, Pixel 5
- Tablet: iPad

## Результаты тестов

```
test-results/
├── screenshots/         # Скриншоты при падении
├── lighthouse/         # Отчеты Lighthouse
├── responsive/         # Скриншоты адаптивности
├── test-results.json   # Результаты в JSON
└── junit.xml          # Результаты в JUnit формате
```

## Best Practices

### 1. Использование data-testid
```html
<button data-testid="submit-forecast">Создать прогноз</button>
```

```typescript
await page.locator('[data-testid="submit-forecast"]').click();
```

### 2. Ожидание элементов
```typescript
// Плохо
await page.waitForTimeout(5000);

// Хорошо
await expect(page.locator('.loading')).not.toBeVisible();
```

### 3. Использование helpers
```typescript
import { login, waitForDataLoad } from './helpers/test-helpers';

test('мой тест', async ({ page }) => {
  await login(page);
  await waitForDataLoad(page);
  // ...
});
```

### 4. Мокирование API
```typescript
await mockApiResponse(page, '/api/forecast', {
  data: mockForecastData
});
```

## Тестовые данные

### Тестовые пользователи
- Email: `test@example.com`
- Password: `password123`

### Тестовые организации
- ООО "Тестовая"
- ИНН: 1234567890

## CI/CD интеграция

### GitHub Actions
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps
  
- name: Run E2E tests
  run: npm run e2e:parallel
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: test-results/
```

## Отладка

### Режим отладки
```bash
npm run e2e:debug
```

### Просмотр трейсов
```bash
npx playwright show-trace test-results/trace.zip
```

### Консольные логи
```typescript
page.on('console', msg => console.log(msg.text()));
```

## Производительность

### Метрики Lighthouse
- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 85
- SEO: ≥ 90

### Core Web Vitals
- FCP < 1.8s
- LCP < 2.5s
- CLS < 0.1
- TBT < 300ms

## Troubleshooting

### Проблема: Тесты падают на CI
1. Увеличьте timeout в конфигурации
2. Добавьте больше ретраев
3. Используйте `waitForLoadState('networkidle')`

### Проблема: Lighthouse не работает
1. Убедитесь, что установлен `playwright-lighthouse`
2. Используйте только Chromium для Lighthouse тестов
3. Проверьте порт 9222

### Проблема: Мобильные тесты нестабильны
1. Используйте `tap()` вместо `click()` для мобильных
2. Добавьте больше времени ожидания для анимаций
3. Проверьте viewport размеры

## Полезные команды

```bash
# Показать справку по тестам
npm run e2e:help

# Очистить результаты тестов
rm -rf test-results/

# Запустить конкретный тест
npx playwright test -g "Авторизация"

# Генерация кода теста
npx playwright codegen http://localhost:5174
```
