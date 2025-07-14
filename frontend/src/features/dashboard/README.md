# Кастомизируемый дашборд

Система кастомизируемого дашборда позволяет пользователям создавать персонализированные дашборды с различными виджетами.

## 🚀 Возможности

- **Drag & Drop**: Перетаскивание виджетов для изменения порядка
- **Настраиваемые виджеты**: Добавление, удаление и настройка виджетов
- **Персистентность**: Автоматическое сохранение конфигурации в localStorage
- **Адаптивность**: Поддержка различных размеров экрана
- **Темная тема**: Поддержка светлой и темной темы
- **Lazy Loading**: Оптимизированная загрузка виджетов

## 📁 Структура

```
src/features/dashboard/
├── components/          # UI компоненты
│   ├── DashboardGrid.tsx           # Основная сетка с drag & drop
│   ├── WidgetWrapper.tsx           # Обертка для виджетов
│   ├── DashboardControls.tsx       # Панель управления
│   └── AddWidgetModal.tsx          # Модальное окно добавления виджетов
├── widgets/            # Адаптеры виджетов
│   ├── EcommerceMetricsWidget.tsx
│   ├── MonthlySalesChartWidget.tsx
│   └── ...
├── hooks/              # React хуки
│   ├── useDashboardPersistence.ts  # Работа с localStorage
│   └── useDashboardLayout.ts       # Управление макетом
├── types/              # TypeScript типы
│   └── dashboard.types.ts
└── widgetRegistry.ts   # Реестр доступных виджетов
```

## 🔧 Использование

### Доступ к дашборду

Дашборд доступен по адресу: `http://localhost:5173/dashboard/`

### Режимы работы

1. **Режим просмотра** - обычный просмотр виджетов
2. **Режим редактирования** - возможность изменять дашборд

### Добавление нового виджета

1. Создайте адаптер виджета в `widgets/`
2. Добавьте определение в `widgetRegistry.ts`
3. Виджет автоматически появится в модальном окне

Пример адаптера:

```typescript
import { WidgetProps } from "../types/dashboard.types";
import ExistingComponent from "@/components/ExistingComponent";

export default function MyWidget(_props: WidgetProps) {
  return <ExistingComponent />;
}
```

Пример определения в реестре:

```typescript
{
  id: 'my-widget',
  title: 'Мой виджет',
  description: 'Описание виджета',
  category: 'custom',
  component: MyWidget,
  defaultSize: { w: 6, h: 4 },
  minSize: { w: 4, h: 3 },
  configurable: false,
  icon: 'Settings',
}
```

## 🎨 Кастомизация

### Изменение сетки

По умолчанию используется сетка 12 колонок. Изменить можно в `DashboardGrid.tsx`.

### Добавление новых категорий

Категории определены в `dashboard.types.ts` в массиве `WIDGET_CATEGORIES`.

### Настройка сохранения

Конфигурация сохраняется в localStorage под ключом `dashboard-config`. Логика в `useDashboardPersistence.ts`.

## 📱 Адаптивность

- **Desktop**: Полная функциональность
- **Tablet**: Упрощенный drag & drop
- **Mobile**: Отключен drag & drop, стековое расположение

## 🔧 Технические детали

### Зависимости

- `@dnd-kit/core` - drag & drop функциональность
- `@dnd-kit/sortable` - сортировка элементов
- `lucide-react` - иконки

### Хранение данных

```typescript
interface DashboardConfig {
  version: string;
  layout: DashboardLayoutItem[];
  widgets: Record<string, DashboardWidget>;
  settings: DashboardSettings;
}
```

### Производительность

- Lazy loading виджетов через React.lazy()
- Мемоизация дорогих вычислений
- Оптимизированное обновление состояния

## 🐛 Устранение проблем

### Виджет не отображается

1. Проверьте, что виджет добавлен в `widgetRegistry.ts`
2. Убедитесь, что адаптер экспортируется правильно
3. Проверьте консоль браузера на ошибки

### Drag & Drop не работает

1. Убедитесь, что режим редактирования включен
2. Проверьте, что библиотека `@dnd-kit` установлена
3. Убедитесь, что сенсоры настроены правильно

### Конфигурация не сохраняется

1. Проверьте localStorage в браузере
2. Убедитесь, что нет ошибок в `useDashboardPersistence`
3. Проверьте права доступа к localStorage 