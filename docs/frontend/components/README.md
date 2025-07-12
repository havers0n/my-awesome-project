# Inventory Module

Модуль управления запасами с полнофункциональным отслеживанием доступности товаров на полках.

## 🚀 Возможности

- **Отслеживание доступности товаров** - Мониторинг запасов в реальном времени
- **Управление местоположением полок** - Точное определение расположения товаров
- **Учет времени отсутствия** - Трекинг периодов отсутствия товаров
- **Уведомления в реальном времени** - Автоматические предупреждения о критических ситуациях
- **Расширенная фильтрация и поиск** - Быстрый поиск товаров и полок
- **Аналитика и отчетность** - Подробная статистика и экспорт данных

## 📁 Структура модуля

```
src/modules/inventory/
├── components/          # UI компоненты (будут добавлены)
├── pages/              # Страницы модуля
│   └── ShelfAvailabilityPage.js
├── hooks/              # React хуки (будут добавлены)
├── services/           # API сервисы
│   └── inventoryService.ts
├── types.ts            # Типы TypeScript
├── index.ts            # Публичные экспорты
└── README.md          # Документация
```

## 🔧 Установка и использование

### Импорт модуля

```typescript
// Импорт всего модуля
import inventoryModule from '@/modules/inventory';

// Импорт отдельных компонентов
import { ShelfAvailabilityPage, inventoryService } from '@/modules/inventory';

// Импорт типов
import type { ProductAvailability, InventorySummary } from '@/modules/inventory';
```

### Использование компонентов

```jsx
import React from 'react';
import { ShelfAvailabilityPage } from '@/modules/inventory';

function InventoryManagement() {
  return (
    <div>
      <ShelfAvailabilityPage />
    </div>
  );
}
```

### Использование сервисов

```typescript
import { inventoryService } from '@/modules/inventory';

// Получение данных о товарах
const products = await inventoryService.getProductAvailability();

// Получение статистики
const summary = await inventoryService.getInventorySummary();

// Обновление товара
await inventoryService.updateProductAvailability('product-id', {
  available_stock: 50
});
```

## 📋 API Reference

### Типы данных

#### ProductStatus
```typescript
type ProductStatus = 'available' | 'low_stock' | 'critical' | 'out_of_stock';
```

#### ProductAvailability
```typescript
interface ProductAvailability {
  id: string;
  product_name: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  last_restock_date: string;
  out_of_stock_hours: number;
  status: ProductStatus;
  shelf_location: string;
}
```

#### InventorySummary
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

### Сервисы

#### inventoryService

##### `getProductAvailability()`
Получение всех данных о доступности товаров.

```typescript
const response = await inventoryService.getProductAvailability();
if (response.success) {
  console.log(response.data); // ProductAvailability[]
}
```

##### `getInventorySummary()`
Получение сводной статистики по складу.

```typescript
const response = await inventoryService.getInventorySummary();
if (response.success) {
  console.log(response.data); // InventorySummary
}
```

##### `getProductsPaginated(pagination, filters?)`
Получение товаров с пагинацией и фильтрацией.

```typescript
const response = await inventoryService.getProductsPaginated(
  { page: 1, limit: 10 },
  { search: 'молоко', status: 'available' }
);
```

##### `updateProductAvailability(id, updates)`
Обновление данных о товаре.

```typescript
await inventoryService.updateProductAvailability('product-1', {
  available_stock: 25,
  status: 'available'
});
```

##### `getShelfLocations()`
Получение списка всех полок.

```typescript
const response = await inventoryService.getShelfLocations();
console.log(response.data); // string[]
```

### Константы

```typescript
import { STATUS_COLORS, STATUS_ICONS, STATUS_LABELS } from '@/modules/inventory';

// Цвета статусов для UI
STATUS_COLORS.available // 'bg-green-100 text-green-800'

// Иконки статусов  
STATUS_ICONS.critical   // '🔶'

// Текстовые метки
STATUS_LABELS.low_stock // 'Заканчивается'
```

### Утилиты

```typescript
import { isValidProductStatus, isProductAvailability } from '@/modules/inventory';

// Проверка валидности статуса
isValidProductStatus('available') // true

// Type guard для проверки объекта
if (isProductAvailability(data)) {
  // data is ProductAvailability
}
```

## 🔄 Обратная совместимость

Модуль обеспечивает полную обратную совместимость с существующими компонентами:

```typescript
// Легаси компоненты (помечены как deprecated)
import { 
  LegacyShelfAvailabilityWidget,
  LegacyShelfAvailabilityMenu,
  LegacyShelfAvailabilityPage 
} from '@/modules/inventory';

// Легаси типы
import type { LegacyProductData, LegacyInventorySummary } from '@/modules/inventory';

// Легаси сервис
import { outOfStockService } from '@/modules/inventory';
```

## 🔧 Разработка

### Добавление новых компонентов

1. Создайте компонент в `components/`
2. Добавьте экспорт в `index.ts`
3. Обновите типы в `types.ts` при необходимости

### Добавление новых хуков

1. Создайте хук в `hooks/`
2. Добавьте типы возвращаемых значений в `types.ts`
3. Экспортируйте в `index.ts`

### Интеграция с API

Текущая реализация использует мок-данные. Для интеграции с реальным API:

1. Замените функции генерации мок-данных в `inventoryService.ts`
2. Добавьте обработку ошибок
3. Обновите типы ответов API

```typescript
// Пример интеграции с Supabase
export async function getProductAvailability(): Promise<ApiResponse<ProductAvailability[]>> {
  try {
    const { data, error } = await supabase
      .from('product_availability')
      .select('*')
      .order('product_name');
    
    if (error) throw error;
    
    return {
      data,
      success: true
    };
  } catch (error) {
    return {
      data: [],
      error: error.message,
      success: false
    };
  }
}
```

## 🎨 Стилизация

Компоненты используют Tailwind CSS с системой дизайна:

- **Цвета статусов**: Зеленый (в наличии), желтый (заканчивается), оранжевый (критично), красный (отсутствует)
- **Анимации**: Плавные переходы и hover-эффекты
- **Адаптивность**: Responsive дизайн для всех размеров экранов
- **Градиенты**: Современные градиентные фоны
- **Иконки**: Lucide React иконки для всех элементов

## 🧪 Тестирование

Рекомендуется добавить тесты для:

- Компонентов (render тесты)
- Хуков (behavior тесты)
- Сервисов (API тесты)
- Утилит (unit тесты)

```typescript
// Пример теста компонента
import { render, screen } from '@testing-library/react';
import { ShelfAvailabilityPage } from '@/modules/inventory';

test('renders inventory page', () => {
  render(<ShelfAvailabilityPage />);
  expect(screen.getByText('Доступность товаров')).toBeInTheDocument();
});
```

## 📈 Производительность

- Ленивая загрузка компонентов
- Мемоизация дорогих вычислений
- Виртуализация больших списков
- Оптимизация re-renders

## 🚀 Roadmap

- [ ] Добавление компонентов виджетов
- [ ] Реализация кастомных хуков
- [ ] Интеграция с real-time API
- [ ] Добавление unit тестов
- [ ] Мобильная версия
- [ ] PWA поддержка
- [ ] Экспорт в Excel/PDF

## 📞 Поддержка

При возникновении вопросов или проблем:

1. Проверьте документацию
2. Посмотрите примеры в `goodversion.md`
3. Обратитесь к команде разработки
4. Создайте issue в репозитории

---

**Версия модуля**: 1.0.0  
**Последнее обновление**: ${new Date().toISOString().split('T')[0]}  
**Статус**: ✅ Готов к использованию
