# Widgets Layer (Слой виджетов)

Слой `widgets` содержит комплексные UI-блоки, которые объединяют в себе логику из слоев `features` и `entities`, а также используют компоненты из `shared` слоя.

## Структура

```
widgets/
├── sidebar/                    # Боковая панель навигации
│   ├── SidebarWidget.tsx
│   └── index.ts
├── header/                     # Шапка приложения
│   ├── HeaderWidget.tsx
│   └── index.ts
├── dashboard-metrics/          # Панель метрик дашборда
│   ├── DashboardMetricsWidget.tsx
│   └── index.ts
├── orders-table/              # Таблица заказов
│   ├── OrdersTableWidget.tsx
│   └── index.ts
├── product-table/             # Таблица товаров
│   ├── ProductTableWidget.tsx
│   └── index.ts
├── charts/                    # Виджеты графиков
│   ├── ChartWidget.tsx
│   └── index.ts
├── reports/                   # Виджеты отчетов
│   ├── ReportWidget.tsx
│   └── index.ts
├── layout/                    # Общий макет приложения
│   ├── AppLayoutWidget.tsx
│   └── index.ts
├── index.ts                   # Публичный API
└── README.md                  # Документация
```

## Принципы организации

### 1. Композиция над наследованием
Виджеты строятся путем композиции более мелких компонентов и логики:
- Используют organisms из components слоя
- Интегрируют бизнес-логику из features слоя
- Работают с данными из entities слоя

### 2. Независимость
Каждый виджет является независимым модулем:
- Имеет собственную бизнес-логику
- Управляет собственным состоянием
- Может быть использован в разных контекстах

### 3. Конфигурируемость
Виджеты поддерживают гибкую конфигурацию:
- Настраиваемые свойства через props
- Возможность отключения/включения функций
- Различные варианты отображения

## Примеры использования

### OrdersTableWidget
Виджет для управления заказами с расширенными возможностями:

```tsx
import { OrdersTableWidget } from '@/widgets/orders-table';

function OrdersPage() {
  return (
    <OrdersTableWidget
      title="Управление заказами"
      showActions={true}
      showCheckboxes={true}
      onOrderClick={(order) => console.log('Clicked order:', order)}
    />
  );
}
```

Возможности:
- Фильтрация и поиск заказов
- Массовые операции
- Статистика по заказам
- Интеграция с бизнес-логикой

### DashboardMetricsWidget
Виджет для отображения ключевых метрик:

```tsx
import { DashboardMetricsWidget } from '@/widgets/dashboard-metrics';

function DashboardPage() {
  return (
    <DashboardMetricsWidget
      title="Ключевые показатели"
      period="month"
      autoColumns={true}
      showSettings={true}
    />
  );
}
```

### ChartWidget
Универсальный виджет для графиков:

```tsx
import { ChartWidget } from '@/widgets/charts';

function AnalyticsPage() {
  return (
    <ChartWidget
      title="Продажи по месяцам"
      chartType="line"
      dataSource="sales"
      showExport={true}
      showFullscreen={true}
    />
  );
}
```

### AppLayoutWidget
Композиционный макет приложения:

```tsx
import { AppLayoutWidget } from '@/widgets/layout';

function App() {
  return (
    <AppLayoutWidget
      headerConfig={{
        showSearch: true,
        showNotifications: true,
        showBreadcrumbs: true,
      }}
      sidebarConfig={{
        showLogo: true,
        enableHover: true,
      }}
      navigationSections={navigationSections}
    />
  );
}
```

## Архитектурные решения

### Интеграция с Features
Виджеты используют custom hooks из features слоя:

```tsx
// OrdersTableWidget.tsx
import { useOrders } from '../../features/orders/hooks/useOrders';

export const OrdersTableWidget: React.FC<Props> = (props) => {
  const { orders, loading, error, fetchOrders } = useOrders();
  
  // Логика виджета...
};
```

### Работа с Entities
Виджеты оперируют типами данных из entities:

```tsx
import { Order } from '../../entities/order';
import { Product } from '../../entities/product';

interface OrdersTableWidgetProps {
  onOrderClick?: (order: Order) => void;
}
```

### Использование Shared компонентов
Виджеты композируют UI из shared компонентов:

```tsx
import { Card } from '../../shared/ui/Card';
import { Typography } from '../../shared/ui/Typography';
import { Button } from '../../shared/ui/Button';
```

## Рекомендации по разработке

### 1. Именование
- Используйте суффикс `Widget` для всех виджетов
- Называйте папки в kebab-case
- Интерфейсы props должны заканчиваться на `Props`

### 2. Структура файлов
```
widget-name/
├── WidgetName.tsx          # Основной компонент
├── index.ts               # Экспорты
├── hooks/                 # Специфичные хуки (если нужны)
├── types.ts              # Типы виджета (если много)
└── README.md             # Документация виджета
```

### 3. Props интерфейсы
```tsx
interface WidgetProps {
  /** Заголовок виджета */
  title?: string;
  /** Показать действия */
  showActions?: boolean;
  /** Размер виджета */
  size?: 'sm' | 'md' | 'lg';
  /** Дополнительные CSS классы */
  className?: string;
  /** Обработчики событий */
  onAction?: (data: any) => void;
}
```

### 4. Состояние виджета
- Используйте локальное состояние для UI-логики
- Интегрируйтесь с глобальным состоянием через features
- Обеспечьте возможность контроля извне через props

### 5. Обработка ошибок
```tsx
if (error) {
  return (
    <Card variant="error">
      <ErrorMessage 
        title="Ошибка загрузки"
        message={error}
        onRetry={handleRetry}
      />
    </Card>
  );
}
```

## Миграция от Organisms

При миграции от organisms к widgets:

1. **Перенесите компонент** в соответствующую папку widgets
2. **Добавьте бизнес-логику** через features hooks
3. **Расширьте функциональность** (фильтры, поиск, действия)
4. **Обновите интерфейс** с учетом новых возможностей
5. **Обеспечьте композицию** с другими виджетами

## Тестирование

Виджеты должны покрываться тестами:

```tsx
// OrdersTableWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { OrdersTableWidget } from './OrdersTableWidget';

describe('OrdersTableWidget', () => {
  it('should render with title', () => {
    render(<OrdersTableWidget title="Test Orders" />);
    expect(screen.getByText('Test Orders')).toBeInTheDocument();
  });
});
```

## Производительность

- Используйте `React.memo` для тяжелых виджетов
- Мемоизируйте колбэки с `useCallback`
- Ленивая загрузка данных
- Виртуализация для больших списков

## Заключение

Слой widgets обеспечивает:
- Переиспользование сложной UI-логики
- Инкапсуляцию бизнес-функциональности
- Гибкую композицию интерфейсов
- Единообразие в UX patterns

При правильном использовании widgets значительно упрощают разработку и поддержку пользовательского интерфейса.
