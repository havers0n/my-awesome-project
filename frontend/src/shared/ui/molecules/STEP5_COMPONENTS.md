# Новые Molecules - Шаг 5

В рамках пятого шага развития UI-системы были созданы следующие составные компоненты:

## 📦 Созданные компоненты

### 1. ProductCell
**Описание**: Комбинация Image + Typography для отображения товара

**Основные возможности**:
- Горизонтальное и вертикальное размещение
- Различные размеры изображений (sm, md, lg)
- Отображение названия, описания, цены и метаданных
- Поддержка интерактивности (onClick)
- Адаптивный дизайн

**Использование**:
```tsx
<ProductCell
  imageUrl="/images/product/product-01.jpg"
  title="Смартфон iPhone 14"
  description="Новейший смартфон Apple с улучшенной камерой"
  price="$899"
  metadata="В наличии: 25 шт."
  layout="horizontal"
  imageSize="md"
  onClick={() => console.log('Product clicked')}
/>
```

### 2. ActionBar
**Описание**: Контейнер для группы действий (фильтр, просмотр)

**Основные возможности**:
- Различные варианты выравнивания (left, center, right, between, around)
- Горизонтальное и вертикальное размещение
- Настраиваемые отступы и фон
- Заголовок и описание
- Разделитель между заголовком и действиями

**Использование**:
```tsx
<ActionBar
  title="Управление товарами"
  description="Выберите действия для работы с товарами"
  align="between"
  variant="default"
  showDivider={true}
>
  <FilterButton label="Фильтр" iconName="GRID" onClick={() => {}} />
  <FilterButton label="Экспорт" iconName="DOWNLOAD" onClick={() => {}} />
</ActionBar>
```

### 3. TableRowItem
**Описание**: Стандартизированная строка таблицы

**Основные возможности**:
- Различные варианты отображения (default, striped, bordered)
- Состояния строки (normal, warning, error, success)
- Поддержка выделения и hover-эффектов
- Встроенный чекбокс для выбора
- Обработка кликов
- Отключение строки

**Использование**:
```tsx
<TableRowItem
  onClick={() => console.log('Row clicked')}
  selected={false}
  hoverable={true}
  status="normal"
  showCheckbox={true}
  checked={false}
  onCheckedChange={(checked) => console.log('Checked:', checked)}
>
  <TableCell>Содержимое ячейки 1</TableCell>
  <TableCell align="center">Содержимое ячейки 2</TableCell>
</TableRowItem>
```

### 4. FilterButton
**Описание**: Специализированная кнопка с иконкой для фильтрации

**Основные возможности**:
- Активное и неактивное состояния
- Счетчик активных фильтров
- Различные варианты отображения (default, filled, outlined)
- Поддержка иконок из системы
- Индикатор загрузки
- Настраиваемое положение иконки

**Использование**:
```tsx
<FilterButton
  label="Активные"
  iconName="CHECK_CIRCLE"
  active={true}
  count={5}
  onClick={() => console.log('Filter clicked')}
/>
```

### 5. FilterGroup
**Описание**: Группа фильтров для удобного управления

**Основные возможности**:
- Горизонтальное и вертикальное размещение
- Заголовок группы
- Поддержка множественного выбора
- Единый стиль для всех фильтров

**Использование**:
```tsx
<FilterGroup
  title="Категории товаров"
  filters={[
    { id: 'all', label: 'Все товары', iconName: 'GRID', active: true, count: 156 },
    { id: 'electronics', label: 'Электроника', iconName: 'BOLT', count: 89 }
  ]}
  onFilterChange={(filterId) => console.log('Filter changed:', filterId)}
  orientation="horizontal"
  multiple={true}
/>
```

### 6. TableCell
**Описание**: Вспомогательный компонент для ячеек таблицы

**Основные возможности**:
- Настраиваемое выравнивание
- Различные размеры отступов
- Поддержка заголовков и обычных ячеек
- Настраиваемая ширина

## 🎨 Дизайн-принципы

### Консистентность
- Все компоненты следуют единой системе цветов и типографики
- Использование общих атомов (Button, Badge, Text, Icon)
- Стандартизированные состояния (hover, active, disabled)

### Адаптивность
- Поддержка темной и светлой темы
- Адаптивная верстка для различных размеров экрана
- Accessible markup с поддержкой ARIA

### Гибкость
- Настраиваемые пропсы для различных сценариев использования
- Композиция компонентов для создания сложных интерфейсов
- Возможность переопределения стилей через className

## 📁 Структура файлов

```
src/components/molecules/
├── ProductCell.tsx          # Ячейка товара
├── ActionBar.tsx           # Панель действий
├── TableRowItem.tsx        # Строка таблицы + TableCell
├── FilterButton.tsx        # Кнопка фильтра + FilterGroup
├── NewMoleculesStep5Demo.tsx # Демонстрация компонентов
└── STEP5_COMPONENTS.md     # Эта документация
```

## 🔧 Использование в проекте

Все компоненты экспортируются через индексный файл:

```tsx
import {
  ProductCell,
  ActionBar,
  TableRowItem,
  TableCell,
  FilterButton,
  FilterGroup
} from '@/components/molecules';
```

## 🎯 Примеры использования

### Таблица товаров
```tsx
<ActionBar
  title="Товары"
  align="between"
  variant="elevated"
>
  <FilterGroup
    filters={categoryFilters}
    onFilterChange={handleFilterChange}
  />
  <FilterButton
    label="Добавить товар"
    iconName="PLUS"
    onClick={handleAddProduct}
  />
</ActionBar>

<table>
  <tbody>
    {products.map(product => (
      <TableRowItem
        key={product.id}
        onClick={() => selectProduct(product.id)}
        selected={selectedProducts.includes(product.id)}
        showCheckbox={true}
        checked={selectedProducts.includes(product.id)}
        onCheckedChange={(checked) => handleProductSelection(product.id, checked)}
      >
        <TableCell>
          <ProductCell
            imageUrl={product.imageUrl}
            title={product.title}
            description={product.description}
            price={product.price}
            metadata={`В наличии: ${product.stock} шт.`}
          />
        </TableCell>
        <TableCell align="center">{product.category}</TableCell>
        <TableCell align="right">{product.price}</TableCell>
      </TableRowItem>
    ))}
  </tbody>
</table>
```

## 📊 Демонстрация

Полная демонстрация всех компонентов доступна в файле `NewMoleculesStep5Demo.tsx` и интегрирована в основную демонстрацию molecules компонентов.

## 🚀 Следующие шаги

1. **Тестирование**: Добавление unit-тестов для каждого компонента
2. **Документация**: Создание Storybook историй
3. **Оптимизация**: Анализ производительности и оптимизация
4. **Расширение**: Добавление дополнительных вариантов и состояний
5. **Интеграция**: Использование в реальных страницах приложения
