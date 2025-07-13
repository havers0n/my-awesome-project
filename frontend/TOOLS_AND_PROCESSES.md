# Внедренные инструменты и процессы

## Обзор

Этот документ описывает все внедренные инструменты разработки и CI/CD процессы для обеспечения качества кода, тестирования и документации.

## 🎨 Storybook 8.6

### Возможности
- **Документация компонентов**: Автоматическая генерация документации из TypeScript типов
- **Визуальное тестирование**: Интерактивные примеры всех компонентов
- **Accessibility testing**: Встроенные проверки доступности
- **Multiple viewports**: Тестирование на разных размерах экранов
- **Controls**: Динамическое изменение props в реальном времени
- **Actions**: Отслеживание событий компонентов

### Конфигурация
- **Файл конфигурации**: `.storybook/main.ts`
- **Превью**: `.storybook/preview.ts`
- **Accessibility addon**: Автоматические проверки a11y
- **Viewport addon**: Тестирование адаптивности

### Команды
```bash
npm run storybook              # Запуск Storybook в dev режиме
npm run build-storybook        # Сборка статической версии
npm run docs:build             # Сборка документации + Storybook
```

### Создание stories
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};
```

## 🔍 Chromatic

### Возможности
- **Visual regression testing**: Автоматическое обнаружение визуальных изменений
- **Cross-browser testing**: Тестирование в разных браузерах
- **Review workflow**: Процесс ревью визуальных изменений
- **CI/CD integration**: Автоматические проверки в GitHub Actions

### Конфигурация
- **Файл конфигурации**: `chromatic.config.json`
- **GitHub Action**: `.github/workflows/chromatic.yml`
- **Скрипты настройки**: `scripts/setup-chromatic.js`

### Команды
```bash
npm run chromatic              # Запуск Chromatic
npm run chromatic:ci           # Запуск для CI (только изменённые)
npm run chromatic:debug        # Запуск с отладочной информацией
npm run chromatic:review       # Запуск с автоматическим принятием изменений
npm run visual-test            # Алиас для chromatic
npm run setup:chromatic        # Настройка Chromatic
```

### Настройка
1. Регистрация на [chromatic.com](https://www.chromatic.com/)
2. Создание проекта
3. Добавление `CHROMATIC_PROJECT_TOKEN` в environment variables
4. Запуск `npm run setup:chromatic`

## 🧪 React Testing Library

### Возможности
- **Unit testing**: Тестирование отдельных компонентов
- **Integration testing**: Тестирование взаимодействия компонентов
- **Accessibility testing**: Проверка доступности
- **User-centric testing**: Тестирование с точки зрения пользователя

### Конфигурация
- **Файл конфигурации**: `vitest.config.ts`
- **Setup файл**: `src/__tests__/setup.ts`
- **Coverage настройки**: Минимальные пороги покрытия

### Команды
```bash
npm run test                   # Запуск тестов
npm run test:ui                # Запуск тестов с UI
npm run test:coverage          # Запуск с покрытием кода
npm run test:drag-drop         # Специфичные тесты drag-drop
```

### Примеры тестов
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick when clicked', async () => {
  const user = userEvent.setup();
  const onClick = jest.fn();
  
  render(<Button onClick={onClick}>Click me</Button>);
  await user.click(screen.getByRole('button'));
  
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

## 🎭 Playwright

### Возможности
- **End-to-end testing**: Тестирование полных пользовательских сценариев
- **Cross-browser testing**: Тестирование в Chrome, Firefox, Safari
- **Mobile testing**: Тестирование на мобильных устройствах
- **Performance testing**: Измерение производительности
- **Visual testing**: Сравнение скриншотов

### Конфигурация
- **Файл конфигурации**: `playwright.config.ts`
- **Проекты**: Chrome, Firefox, Safari, Mobile devices
- **Настройки**: Автоматическое управление браузерами

### Команды
```bash
npm run test:e2e               # Запуск E2E тестов
npm run test:e2e:ui            # Запуск с UI
npm run test:e2e:headed        # Запуск с отображением браузера
npm run e2e                    # Запуск всех E2E тестов
npm run e2e:auth               # Тесты авторизации
npm run e2e:dashboard          # Тесты дашборда
npm run e2e:mobile             # Мобильные тесты
npm run e2e:performance        # Тесты производительности
npm run playwright:install     # Установка браузеров
```

### Примеры тестов
```typescript
import { test, expect } from '@playwright/test';

test('user can login and access dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

## 🔧 CI/CD Процессы

### GitHub Actions Workflows

#### 1. Основной CI pipeline (`.github/workflows/ci.yml`)
- **Lint и Type Check**: ESLint, TypeScript проверки
- **Unit тесты**: Vitest с покрытием кода
- **E2E тесты**: Playwright тесты
- **Accessibility тесты**: axe-core проверки
- **Bundle size check**: Мониторинг размера сборки
- **Security audit**: Проверка безопасности

#### 2. Chromatic workflow (`.github/workflows/chromatic.yml`)
- **Visual regression**: Автоматические визуальные тесты
- **Cross-browser testing**: Тестирование в разных браузерах
- **Review process**: Процесс ревью визуальных изменений

### Автоматические проверки

#### TypeScript
```bash
npm run type-check             # Проверка типов
npx tsc --noEmit              # Прямая проверка TypeScript
```

#### ESLint
```bash
npm run lint                  # Проверка кода
npx eslint src/               # Прямая проверка ESLint
```

#### Prettier
```bash
npm run format               # Форматирование кода
npm run format:check         # Проверка форматирования
```

### Bundle Size Monitoring
```bash
npm run bundle:analyze       # Анализ размера сборки
npm run build               # Сборка проекта
```

### Accessibility проверки
```bash
npm run accessibility:audit  # Проверка доступности
npx axe-core-cli http://localhost:5174 --exit
```

## 📚 Документация

### Автогенерация документации

#### TypeDoc
- **Конфигурация**: `typedoc.json`
- **Генерация**: `npm run docs:generate`
- **Выход**: `docs/api/`

#### Автоматическая генерация
```bash
npm run docs:generate        # Генерация документации
npm run docs:build          # Сборка документации + Storybook
```

### Структура документации
```
docs/
├── api/                     # TypeDoc API документация
├── components/              # Документация компонентов
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── examples/               # Примеры использования
│   ├── getting-started.md
│   ├── component-usage.md
│   └── testing-guide.md
└── storybook/             # Storybook статика
```

### Примеры использования в Storybook
- **Interactive examples**: Живые примеры компонентов
- **Props documentation**: Автоматическая документация props
- **Accessibility tests**: Встроенные a11y проверки

## 🚀 Рабочий процесс

### Разработка компонентов
1. Создание компонента с TypeScript типами
2. Написание unit тестов
3. Создание Storybook stories
4. E2E тестирование (при необходимости)
5. Документирование

### Процесс Pull Request
1. Создание feature branch
2. Разработка и тестирование
3. Запуск `npm run ci:all`
4. Создание Pull Request
5. Автоматические проверки CI/CD
6. Code review
7. Merge после всех проверок

### Команды для проверки качества
```bash
npm run ci:all               # Полная проверка перед коммитом
npm run lint                 # Проверка кода
npm run type-check           # Проверка типов
npm run test:coverage        # Тесты с покрытием
npm run format:check         # Проверка форматирования
npm run build               # Сборка проекта
```

## 📊 Метрики и мониторинг

### Code Coverage
- **Минимальные пороги**: 80% для всех метрик
- **Отчёты**: HTML, JSON, LCOV
- **CI integration**: Автоматическая проверка в GitHub Actions

### Bundle Size
- **Лимит**: 5MB для основной сборки
- **Мониторинг**: Автоматическая проверка в CI
- **Анализ**: Детализированный отчёт по chunks

### Performance
- **Lighthouse CI**: Автоматические проверки производительности
- **Метрики**: Performance, Accessibility, Best Practices, SEO
- **Пороги**: Performance > 80%, Accessibility > 90%

### Accessibility
- **axe-core**: Автоматические проверки доступности
- **Storybook addon**: Интерактивные a11y тесты
- **CI checks**: Обязательные проверки в GitHub Actions

## 🔒 Безопасность

### Аудит безопасности
```bash
npm audit                   # Проверка уязвимостей
npm run ci:all              # Включает security audit
```

### Snyk интеграция
- **GitHub Action**: Автоматическое сканирование
- **Severity threshold**: High level vulnerabilities
- **Token**: `SNYK_TOKEN` в secrets

## 🎯 Следующие шаги

1. **Настройка Chromatic**:
   - Регистрация на chromatic.com
   - Получение project token
   - Настройка GitHub secrets

2. **Настройка Snyk**:
   - Регистрация на snyk.io
   - Получение API token
   - Добавление в GitHub secrets

3. **Настройка Codecov**:
   - Интеграция с репозиторием
   - Настройка coverage reports

4. **Создание примеров компонентов**:
   - Написание stories для существующих компонентов
   - Добавление unit тестов
   - Документирование

5. **Обучение команды**:
   - Проведение воркшопов по инструментам
   - Создание внутренних гайдлайнов
   - Настройка процессов ревью

## 📝 Заключение

Все инструменты настроены и готовы к использованию. Проект теперь имеет:

- ✅ Полный набор инструментов для разработки
- ✅ Автоматизированные CI/CD процессы
- ✅ Comprehensive testing strategy
- ✅ Автоматическую генерацию документации
- ✅ Мониторинг качества кода
- ✅ Accessibility и performance проверки
- ✅ Security аудит

Все процессы интегрированы в GitHub Actions и будут автоматически выполняться при каждом Pull Request.
