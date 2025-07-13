# Структура компонентов согласно Atomic Design

Этот документ описывает новую организацию компонентов в проекте согласно методологии Atomic Design.

## Обзор структуры

```
components/
├── atoms/
│   ├── Button/
│   ├── Badge/
│   ├── Icon/
│   ├── Typography/
│   └── Image/
├── molecules/
│   ├── ProductCell/
│   ├── ActionBar/
│   ├── TableRowItem/
│   └── FilterButton/
├── organisms/
│   ├── OrdersTable/
│   └── OrdersTableHeader/
└── templates/
    └── RecentOrdersWidget/
```

## Компоненты по уровням

### Atoms (Атомы)

Базовые строительные блоки UI. Это самые простые компоненты, которые не могут быть разложены на более мелкие части.

#### Button
- **Расположение**: `src/components/atoms/Button/`
- **Назначение**: Базовый компонент кнопки с различными вариантами и размерами
- **Пропсы**: variant, size, startIcon, endIcon, loading, fullWidth, disabled
- **Использование**: 
  ```tsx
  import { Button } from '@/components/atoms';
  <Button variant="primary" size="md">Нажми меня</Button>
  ```

#### Badge
- **Расположение**: `src/components/atoms/Badge/`
- **Назначение**: Компонент значка для отображения статусов, меток и счетчиков
- **Пропсы**: variant, size, color, dot, className
- **Использование**:
  ```tsx
  import { Badge } from '@/components/atoms';
  <Badge variant="primary" color="green">Активен</Badge>
  ```

#### Icon
- **Расположение**: `src/components/atoms/Icon/`
- **Назначение**: Компонент для отображения иконок
- **Пропсы**: name, size, className
- **Использование**:
  ```tsx
  import { Icon } from '@/components/atoms';
  <Icon name="filter" size={4} />
  ```

#### Typography
- **Расположение**: `src/components/atoms/Typography/`
- **Назначение**: Компонент для типографики (заголовки, параграфы, текст)
- **Пропсы**: variant, size, weight, color, align, className
- **Использование**:
  ```tsx
  import { Typography } from '@/components/atoms';
  <Typography variant="h1" size="2xl" weight="bold">Заголовок</Typography>
  ```

#### Image
- **Расположение**: `src/components/atoms/Image/`
- **Назначение**: Компонент изображения с поддержкой различных форм и размеров
- **Пропсы**: size, shape, objectFit, fallback, loading, lazy
- **Дополнительно**: Включает подкомпонент Avatar
- **Использование**:
  ```tsx
  import { Image, Avatar } from '@/components/atoms';
  <Image src="/path/to/image.jpg" shape="rounded" size="lg" />
  <Avatar name="John Doe" online />
  ```

### Molecules (Молекулы)

Группы атомов, объединенные вместе для выполнения определенной функции.

#### ProductCell
- **Расположение**: `src/components/molecules/ProductCell/`
- **Назначение**: Ячейка с информацией о товаре (изображение, название, описание, цена)
- **Пропсы**: imageUrl, title, description, price, metadata, imageSize, layout
- **Использование**:
  ```tsx
  import { ProductCell } from '@/components/molecules';
  <ProductCell 
    imageUrl="/product.jpg" 
    title="MacBook Pro" 
    description="2 Variants"
    price="$2399.00" 
  />
  ```

#### ActionBar
- **Расположение**: `src/components/molecules/ActionBar/`
- **Назначение**: Панель с действиями и элементами управления
- **Пропсы**: align, spacing, direction, variant, title, description, showDivider
- **Использование**:
  ```tsx
  import { ActionBar } from '@/components/molecules';
  <ActionBar variant="elevated" align="between">
    <Button>Действие 1</Button>
    <Button>Действие 2</Button>
  </ActionBar>
  ```

#### TableRowItem
- **Расположение**: `src/components/molecules/TableRowItem/`
- **Назначение**: Строка таблицы с расширенной функциональностью
- **Пропсы**: onClick, selected, hoverable, variant, status, showCheckbox
- **Дополнительно**: Включает компонент TableCell
- **Использование**:
  ```tsx
  import { TableRowItem, TableCell } from '@/components/molecules';
  <TableRowItem hoverable showCheckbox>
    <TableCell>Содержимое ячейки</TableCell>
  </TableRowItem>
  ```

#### FilterButton
- **Расположение**: `src/components/molecules/FilterButton/`
- **Назначение**: Кнопка фильтра с иконкой и счетчиком
- **Пропсы**: label, iconName, active, count, size, variant
- **Дополнительно**: Включает компонент FilterGroup для группировки фильтров
- **Использование**:
  ```tsx
  import { FilterButton, FilterGroup } from '@/components/molecules';
  <FilterButton 
    label="Фильтр" 
    iconName="filter" 
    active={true} 
    count={3} 
  />
  ```

### Organisms (Организмы)

Группы молекул, объединенные вместе для формирования относительно сложных, отдельных разделов интерфейса.

#### OrdersTable
- **Расположение**: `src/components/organisms/OrdersTable/`
- **Назначение**: Таблица заказов с полным функционалом
- **Пропсы**: orders, onRowClick, showCheckboxes, selectedOrders, loading, empty
- **Использование**:
  ```tsx
  import { OrdersTable } from '@/components/organisms';
  <OrdersTable 
    orders={ordersData} 
    showCheckboxes 
    onRowClick={handleRowClick} 
  />
  ```

#### OrdersTableHeader
- **Расположение**: `src/components/organisms/OrdersTableHeader/`
- **Назначение**: Заголовок таблицы заказов с действиями
- **Пропсы**: title, subtitle, totalCount, onFilterClick, onViewAllClick, showExport
- **Использование**:
  ```tsx
  import { OrdersTableHeader } from '@/components/organisms';
  <OrdersTableHeader 
    title="Последние заказы" 
    totalCount={150} 
    showFilter 
    showExport 
  />
  ```

### Templates (Шаблоны)

Группы организмов, объединенные вместе для формирования страниц.

#### RecentOrdersWidget
- **Расположение**: `src/components/templates/RecentOrdersWidget/`
- **Назначение**: Полноценный виджет последних заказов
- **Пропсы**: orders, title, showCheckboxes, showFilter, onOrderClick, maxItems
- **Использование**:
  ```tsx
  import { RecentOrdersWidget } from '@/components/templates';
  <RecentOrdersWidget 
    title="Последние заказы"
    orders={ordersData}
    showFilter
    maxItems={5}
    onOrderClick={handleOrderClick}
  />
  ```

## Принципы использования

### Импорты

```tsx
// Импорт атомов
import { Button, Badge, Typography } from '@/components/atoms';

// Импорт молекул
import { ProductCell, ActionBar } from '@/components/molecules';

// Импорт организмов
import { OrdersTable } from '@/components/organisms';

// Импорт шаблонов
import { RecentOrdersWidget } from '@/components/templates';
```

### Композиция

Компоненты верхнего уровня используют компоненты нижнего уровня:

```
Templates → Organisms → Molecules → Atoms
```

### Обратная совместимость

Существующие компоненты из папки `common/` и других папок остаются доступными через основной индекс атомов для обеспечения обратной совместимости.

## Преимущества новой структуры

1. **Понятная иерархия**: Четкое разделение ответственности между компонентами
2. **Переиспользуемость**: Легко комбинировать компоненты для создания новых UI
3. **Масштабируемость**: Простота добавления новых компонентов в соответствующие категории
4. **Тестируемость**: Изолированные компоненты легче тестировать
5. **Документируемость**: Понятная структура облегчает документирование

## Дальнейшее развитие

По мере развития проекта рекомендуется:

1. Добавлять новые атомы в соответствующие папки
2. Создавать молекулы из комбинаций атомов
3. Строить организмы из молекул
4. Создавать шаблоны страниц из организмов
5. Постепенно мигрировать существующие компоненты в новую структуру
