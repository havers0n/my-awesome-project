# Frontend Documentation

## Обзор

Данный раздел содержит всю документацию, связанную с фронтенд частью приложения Tailwind Admin Dashboard.

## Структура

### 📁 **architecture/** - Архитектура фронтенда
- Архитектурные решения
- Структура компонентов
- Паттерны проектирования

### 📁 **components/** - Документация компонентов
- Описание компонентов
- API компонентов
- Примеры использования

### 📁 **performance/** - Производительность
- Анализ производительности
- Руководства по оптимизации
- Метрики и бенчмарки

### 📁 **testing/** - Тестирование
- Стратегии тестирования
- Настройка тестовой среды
- Примеры тестов

### 📁 **ui-ux/** - UI/UX документация
- Руководства по дизайну
- Accessibility
- Пользовательский опыт

## Технологии

- **React** - Основной фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Vite** - Сборка и разработка
- **React Router** - Маршрутизация

## Быстрые ссылки

### Архитектура
- [Архитектурная карта](architecture/ARCHITECTURE_MAPPING.md)
- [SaaS Dashboard архитектура](architecture/saas-dashboard-architecture.md)

### UI/UX
- [Оценка доступности](ui-ux/ACCESSIBILITY_EVALUATION_REPORT.md)
- [Руководство по оптимизации иконок](ui-ux/icon-optimization-guide.md)
- [Задачи редизайна](ui-ux/redesign-task.md)
- [Обзор UX обратной связи](ui-ux/ux-feedback-review.md)

### Производительность
- [Анализ производительности](performance/performance-analysis-report.md)
- [Руководство по оптимизации](performance/performance-optimization-guide.md)

### Тестирование
- [Интеграционные тесты](testing/INTEGRATION_TEST.md)

### Компоненты
- [Компоненты инвентаря](components/)

## Соглашения

### Структура компонентов
```
src/
├── components/
│   ├── common/          # Общие компоненты
│   ├── ui/              # UI компоненты
│   └── feature/         # Функциональные компоненты
├── pages/               # Страницы
├── hooks/               # Пользовательские хуки
├── services/            # Сервисы
├── utils/               # Утилиты
└── types/               # Типы TypeScript
```

### Именование
- Компоненты: PascalCase
- Хуки: camelCase с префиксом `use`
- Утилиты: camelCase
- Константы: UPPER_SNAKE_CASE

### Стилизация
- Используйте Tailwind CSS классы
- Создавайте переиспользуемые компоненты
- Следуйте принципам responsive design

## Разработка

### Запуск проекта
```bash
cd frontend
npm install
npm run dev
```

### Сборка
```bash
npm run build
```

### Тестирование
```bash
npm run test
```

---

*Последнее обновление: 2025-01-16*
