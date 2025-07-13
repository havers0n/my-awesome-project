# Выделение Organisms для компонента RecentOrders

## Обзор

Данный документ содержит анализ и выделение крупных самостоятельных блоков (Organisms) в компоненте `RecentOrders` согласно методологии Atomic Design.

## Текущая структура

**Файл**: `src/components/ecommerce/RecentOrders.tsx`

## Выделенные Organisms

### 1. 🎯 **OrdersTableHeader** (Заголовок + кнопки действий)

**Местоположение**: Строки 74-124 в RecentOrders.tsx

**Описание**: Самостоятельный блок, содержащий заголовок виджета и панель управления с кнопками

**Содержимое**:
- Заголовок "Последние заказы" (строки 76-78)
- Контейнер с кнопками (строки 81-123)
- Кнопка "Фильтр" с SVG иконкой (строки 82-119)
- Кнопка "Смотреть все" (строки 120-122)

**Рекомендуемая структура компонента**:
```typescript
interface OrdersTableHeaderProps {
  title: string;
  onFilter?: () => void;
  onViewAll?: () => void;
  className?: string;
}

export function OrdersTableHeader({ 
  title, 
  onFilter, 
  onViewAll, 
  className 
}: OrdersTableHeaderProps) {
  return (
    <div className={`flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-3">
        <FilterButton onClick={onFilter} />
        <ViewAllButton onClick={onViewAll} />
      </div>
    </div>
  );
}
```

**Зависимости**:
- `FilterButton` (атом)
- `ViewAllButton` (атом)

---

### 2. 🎯 **OrdersTable** (Вся таблица с заголовками и данными)

**Местоположение**: Строки 125-209 в RecentOrders.tsx

**Описание**: Самостоятельный блок таблицы с заголовками и данными о заказах

**Содержимое**:
- Контейнер с overflow-x-auto (строка 125)
- Компонент Table (строки 126-208)
- TableHeader с заголовками колонок (строки 128-155)
- TableBody с данными заказов (строки 159-207)

**Рекомендуемая структура компонента**:
```typescript
interface Order {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  status: "Delivered" | "Pending" | "Canceled";
  image: string;
}

interface OrdersTableProps {
  orders: Order[];
  className?: string;
}

export function OrdersTable({ orders, className }: OrdersTableProps) {
  return (
    <div className={`max-w-full overflow-x-auto ${className}`}>
      <Table>
        <OrdersTableHeader />
        <OrdersTableBody orders={orders} />
      </Table>
    </div>
  );
}
```

**Зависимости**:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` (атомы)
- `OrdersTableHeaderRow` (молекула)
- `OrdersTableBodyRow` (молекула)
- `Badge` (атом)
- `ProductImage` (атом)
- `ProductInfo` (атом)

---

### 3. 🎯 **RecentOrdersCard** (Весь виджет с оберткой)

**Местоположение**: Строки 72-210 в RecentOrders.tsx

**Описание**: Самостоятельный виджет, представляющий собой карточку с полной функциональностью отображения последних заказов

**Содержимое**:
- Контейнер-карточка с фоном и border (строка 73)
- OrdersTableHeader (строки 74-124)
- OrdersTable (строки 125-209)

**Рекомендуемая структура компонента**:
```typescript
interface RecentOrdersCardProps {
  title?: string;
  orders: Order[];
  onFilter?: () => void;
  onViewAll?: () => void;
  className?: string;
}

export function RecentOrdersCard({ 
  title = "Последние заказы",
  orders,
  onFilter,
  onViewAll,
  className 
}: RecentOrdersCardProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 ${className}`}>
      <OrdersTableHeader 
        title={title}
        onFilter={onFilter}
        onViewAll={onViewAll}
      />
      <OrdersTable orders={orders} />
    </div>
  );
}
```

**Зависимости**:
- `OrdersTableHeader` (организм)
- `OrdersTable` (организм)

---

## Иерархия компонентов

```
RecentOrdersCard (Organism)
├── OrdersTableHeader (Organism)
│   ├── WidgetTitle (Atom)
│   ├── FilterButton (Atom)
│   │   └── FilterIcon (Atom)
│   └── ViewAllButton (Atom)
└── OrdersTable (Organism)
    ├── OrdersTableHeaderRow (Molecule)
    │   └── TableColumnHeader (Atom)
    └── OrdersTableBodyRow (Molecule)
        ├── ProductImage (Atom)
        ├── ProductInfo (Atom)
        ├── PriceText (Atom)
        ├── CategoryText (Atom)
        └── Badge (Atom)
```

## Рекомендации по рефакторингу

### Этап 1: Выделение OrdersTableHeader
1. Создать `src/components/ecommerce/organisms/OrdersTableHeader.tsx`
2. Вынести логику заголовка и кнопок
3. Подключить атомы `FilterButton` и `ViewAllButton`

### Этап 2: Выделение OrdersTable
1. Создать `src/components/ecommerce/organisms/OrdersTable.tsx`
2. Вынести логику таблицы
3. Подключить молекулы строк таблицы

### Этап 3: Выделение RecentOrdersCard
1. Создать `src/components/ecommerce/organisms/RecentOrdersCard.tsx`
2. Объединить OrdersTableHeader и OrdersTable
3. Обновить основной компонент `RecentOrders.tsx`

## Структура папок

```
src/components/ecommerce/
├── organisms/
│   ├── OrdersTableHeader.tsx
│   ├── OrdersTable.tsx
│   └── RecentOrdersCard.tsx
├── molecules/
│   ├── OrdersTableHeaderRow.tsx
│   └── OrdersTableBodyRow.tsx
└── RecentOrders.tsx (обновленный)
```

## Преимущества выделения Organisms

1. **Переиспользуемость**: Каждый организм может быть использован независимо
2. **Тестируемость**: Легче писать тесты для отдельных блоков
3. **Поддержка**: Упрощение понимания и модификации кода
4. **Масштабируемость**: Возможность комбинировать организмы в разных контекстах

## Заключение

Выделение трех основных организмов (`OrdersTableHeader`, `OrdersTable`, `RecentOrdersCard`) позволит создать более модульную и гибкую архитектуру компонента. Каждый организм представляет собой самостоятельный функциональный блок, который может быть легко протестирован, поддержан и переиспользован.
