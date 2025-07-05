# Компоненты управления складскими запасами

Этот модуль содержит компоненты для отображения доступности товаров на складе и полках.

## Компоненты

### ShelfAvailabilityMenu

Основной компонент для отображения полного списка товаров с информацией о их доступности на полках.

#### Особенности:
- 📦 Отображение товаров с различными статусами доступности
- 🔍 Поиск по названию товара или номеру полки
- 🔄 Фильтрация по статусу (в наличии, заканчивается, критически мало, отсутствует)
- 📊 Сортировка по названию, количеству или статусу
- 📍 Информация о местоположении товара на полке
- ⏱️ Отображение времени отсутствия товара
- 🔒 Информация о зарезервированных товарах

#### Использование:

```tsx
import ShelfAvailabilityMenu from '@/components/inventory/ShelfAvailabilityMenu';

// Базовое использование
<ShelfAvailabilityMenu />

// С обработчиком выбора товара
<ShelfAvailabilityMenu 
  onProductSelect={(product) => console.log('Selected:', product)}
  showFilters={true}
/>

// Без фильтров (компактный режим)
<ShelfAvailabilityMenu 
  showFilters={false}
/>
```

#### Props:

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `onProductSelect` | `(product: ProductAvailability) => void` | `undefined` | Колбэк при выборе товара |
| `showFilters` | `boolean` | `true` | Показывать ли фильтры и поиск |

### ShelfAvailabilityWidget

Компактный виджет для отображения сводной информации о складе.

#### Особенности:
- 📊 Краткая статистика по всем товарам
- 🎯 Индикатор состояния склада
- ⚠️ Список товаров, требующих внимания
- 🔗 Ссылка на подробную страницу
- 🔄 Быстрые действия (обновить, отчет)

#### Использование:

```tsx
import ShelfAvailabilityWidget from '@/components/inventory/ShelfAvailabilityWidget';

// Базовое использование
<ShelfAvailabilityWidget />
```

### ShelfAvailabilityPage

Полная страница для управления доступностью товаров.

#### Особенности:
- 📋 Полный интерфейс с меню доступности
- 📖 Инструкции по использованию
- ⚡ Быстрые действия
- 🏷️ Модальное окно с детальной информацией о товаре

#### Использование:

```tsx
// Добавьте в роутинг
<Route path="/shelf-availability" element={<ShelfAvailabilityPage />} />
```

## Статусы товаров

| Статус | Описание | Цвет | Иконка |
|--------|----------|------|--------|
| `available` | Товар есть в достаточном количестве | Зеленый | ✅ |
| `low_stock` | Остаток менее 30% от общего объема | Желтый | ⚠️ |
| `critical` | Остаток менее 10% от общего объема | Оранжевый | 🔶 |
| `out_of_stock` | Товара нет в наличии | Красный | ❌ |

## Интерфейсы данных

### ProductAvailability

```typescript
interface ProductAvailability {
  id: string;
  product_name: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  last_restock_date: string;
  out_of_stock_hours: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'critical';
  shelf_location: string;
}
```

### ProductSummary

```typescript
interface ProductSummary {
  name: string;
  available: number;
  total: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'critical';
}
```

### InventorySummary

```typescript
interface InventorySummary {
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  criticalCount: number;
  availableCount: number;
  urgentItems: ProductSummary[];
}
```

## Интеграция с API

В настоящее время компоненты используют моковые данные для демонстрации. Для интеграции с реальным API:

1. Замените функции `generateMockData()` и `generateSummaryData()` на API вызовы
2. Обновите сервис `outOfStockService` для работы с новыми endpoint'ами
3. Добавьте обработку ошибок и загрузки

### Пример интеграции:

```typescript
// В компоненте ShelfAvailabilityMenu
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/inventory/shelf-availability');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Ошибка загрузки данных о доступности товаров');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

## Стилизация

Компоненты используют Tailwind CSS и следуют общей дизайн-системе приложения:

- **Цвета статусов**: зеленый (в наличии), желтый (заканчивается), оранжевый (критически мало), красный (отсутствует)
- **Типографика**: системные шрифты с различными размерами
- **Анимации**: плавные переходы для ховер-эффектов и модальных окон
- **Иконки**: эмодзи для быстрого визуального распознавания

## Расширение функциональности

### Добавление новых статусов

1. Обновите тип `status` в интерфейсах
2. Добавьте новые цвета в функции `getStatusColor()`
3. Добавьте новые иконки в функции `getStatusIcon()`
4. Обновите логику определения статуса

### Добавление новых полей

1. Обновите интерфейс `ProductAvailability`
2. Добавьте отображение новых полей в компонентах
3. Обновите моковые данные или API

### Кастомизация внешнего вида

Все компоненты используют Tailwind CSS классы, которые можно легко изменить или переопределить через props или CSS переменные.

## Тестирование

Рекомендуется добавить тесты для:

- Корректного отображения данных
- Работы фильтров и поиска
- Обработки ошибок загрузки
- Взаимодействия с пользователем

```typescript
// Пример теста
import { render, screen } from '@testing-library/react';
import ShelfAvailabilityWidget from './ShelfAvailabilityWidget';

test('renders shelf availability widget', () => {
  render(<ShelfAvailabilityWidget />);
  expect(screen.getByText('Склад')).toBeInTheDocument();
});
```
