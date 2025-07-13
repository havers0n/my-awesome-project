# React Grid Layout Integration

Эта документация описывает интеграцию react-grid-layout для создания адаптивных сеток дашборда с поддержкой dnd-kit и совместимостью с Tailwind CSS.

## Обзор

Интеграция включает следующие компоненты:

1. **ResponsiveGridLayout** - основной компонент адаптивной сетки
2. **ResponsiveWidgetWrapper** - обертка для виджетов с расширенной функциональностью  
3. **useResponsiveGrid** - хук для управления состоянием адаптивной сетки
4. **ResponsiveGridDemo** - демонстрационный компонент

## Основные возможности

### ✅ Адаптивность

- **Breakpoints**: xxs (≤480px), xs (≤768px), sm (≤996px), md (≤1200px), lg (>1200px)
- **Динамические колонки**: от 2 колонок на мобильных до 12 на десктопе
- **Автоматическая адаптация** виджетов под размер экрана

### ✅ Drag & Drop

- Интеграция с **dnd-kit** для совместимости с существующей логикой
- Плавные анимации перетаскивания
- Визуальные индикаторы при перемещении
- Поддержка клавиатурной навигации

### ✅ Изменение размера

- **8 точек изменения размера**: se, e, s, n, w, ne, nw, sw
- Ограничения минимального и максимального размера
- Адаптивные handles для разных устройств
- Отключение на мобильных устройствах

### ✅ Совместимость с Tailwind CSS

- Полная поддержка темной темы
- Адаптивные утилиты Tailwind
- Кастомные CSS классы для тонкой настройки
- Сохранение существующих стилей проекта

## Использование

### Базовое использование

```tsx
import ResponsiveGridLayoutComponent from './ResponsiveGridLayout';

<ResponsiveGridLayoutComponent
  layout={layout}
  widgets={widgets}
  isEditMode={isEditMode}
  onLayoutChange={handleLayoutChange}
  onRemoveWidget={handleRemoveWidget}
  onConfigWidget={handleConfigWidget}
  onResizeWidget={handleResizeWidget}
/>
```

### С использованием хука

```tsx
import { useResponsiveGrid } from '../hooks/useResponsiveGrid';

const {
  layout,
  widgets,
  currentBreakpoint,
  compactType,
  isEditMode,
  setEditMode,
  addWidget,
  removeWidget,
  resizeWidget,
  optimizeLayout,
  stats
} = useResponsiveGrid({
  initialConfig: DEFAULT_DASHBOARD_CONFIG,
  autoSave: true,
  autoSaveDelay: 1000
});
```

## Конфигурация

### Breakpoints

```tsx
export const BREAKPOINTS = {
  lg: 1200,   // Большие экраны
  md: 996,    // Средние экраны  
  sm: 768,    // Планшеты
  xs: 480,    // Мобильные
  xxs: 0      // Очень маленькие экраны
};
```

### Колонки

```tsx
export const COLUMNS = {
  lg: 12,     // 12 колонок на больших экранах
  md: 10,     // 10 колонок на средних
  sm: 6,      // 6 колонок на планшетах
  xs: 4,      // 4 колонки на мобильных
  xxs: 2      // 2 колонки на очень маленьких
};
```

### Основные параметры

```tsx
const ROW_HEIGHT = 30;                    // Высота строки в пикселях
const MARGIN: [number, number] = [10, 10]; // Отступы между элементами
const CONTAINER_PADDING: [number, number] = [10, 10]; // Отступы контейнера
```

## API Reference

### ResponsiveGridLayoutProps

```tsx
interface ResponsiveGridLayoutProps {
  layout: DashboardLayoutItem[];           // Макет сетки
  widgets: Record<string, DashboardWidget>; // Виджеты
  isEditMode: boolean;                     // Режим редактирования
  onLayoutChange: (layout: DashboardLayoutItem[]) => void; // Изменение макета
  onRemoveWidget: (widgetId: string) => void;              // Удаление виджета
  onConfigWidget?: (widgetId: string) => void;             // Настройка виджета
  onResizeWidget?: (widgetId: string, size: { w: number; h: number }) => void; // Изменение размера
  className?: string;                       // Дополнительные CSS классы
}
```

### UseResponsiveGridReturn

```tsx
interface UseResponsiveGridReturn {
  // Основные данные
  layout: DashboardLayoutItem[];
  widgets: Record<string, DashboardWidget>;
  
  // Состояние сетки
  currentBreakpoint: GridBreakpoint;
  compactType: CompactType;
  isEditMode: boolean;
  
  // Layouts для разных breakpoints
  layouts: { [key in GridBreakpoint]: RGLLayout[] };
  
  // Действия
  setEditMode: (enabled: boolean) => void;
  setCompactType: (type: CompactType) => void;
  updateLayout: (newLayout: DashboardLayoutItem[]) => void;
  addWidget: (widgetType: string, position?: { x: number; y: number }) => void;
  removeWidget: (widgetId: string) => void;
  resizeWidget: (widgetId: string, size: { w: number; h: number }) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  resetLayout: () => void;
  
  // Утилиты
  getWidgetPosition: (widgetId: string) => DashboardLayoutItem | null;
  getAvailablePosition: (size: { w: number; h: number }) => { x: number; y: number };
  optimizeLayout: () => void;
  
  // Статистика
  stats: {
    totalWidgets: number;
    visibleWidgets: number;
    hiddenWidgets: number;
    layoutDensity: number;
  };
}
```

## Расширенные возможности

### Оптимизация макета

```tsx
// Автоматическое размещение виджетов для оптимального использования пространства
optimizeLayout();
```

### Статистика

```tsx
const { stats } = useResponsiveGrid();

console.log(`Всего виджетов: ${stats.totalWidgets}`);
console.log(`Видимых: ${stats.visibleWidgets}`);
console.log(`Плотность: ${stats.layoutDensity.toFixed(1)}%`);
```

### Автосохранение

```tsx
const grid = useResponsiveGrid({
  autoSave: true,        // Включить автосохранение
  autoSaveDelay: 1000    // Задержка в миллисекундах
});
```

## Стилизация

### Кастомные CSS классы

```css
/* Стили для placeholder */
.react-grid-placeholder {
  background: rgb(59 130 246 / 0.1);
  border: 2px dashed rgb(59 130 246 / 0.5);
  border-radius: 8px;
}

/* Стили для handles изменения размера */
.react-resizable-handle {
  background: rgb(59 130 246);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 200ms ease;
}

/* Стили для drag handle */
.drag-handle {
  cursor: grab;
  user-select: none;
}
```

### Темная тема

Все компоненты поддерживают темную тему из коробки:

```css
.dark .react-grid-placeholder {
  background: rgb(59 130 246 / 0.2);
  border-color: rgb(59 130 246 / 0.6);
}

.dark .widget-container {
  background: rgb(31, 41, 55);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.5);
}
```

## Производительность

### Оптимизации

- **useMemo** для дорогих вычислений макета
- **useCallback** для стабильных ссылок на функции
- **CSS transforms** вместо изменения позиций
- **Ленивая загрузка** виджетов с Suspense

### Рекомендации

1. Используйте `measureBeforeMount={false}` для быстрой загрузки
2. Ограничивайте количество виджетов на экране
3. Избегайте сложных вычислений в рендере виджетов
4. Используйте виртуализацию для больших наборов данных

## Доступность

### ARIA атрибуты

```tsx
<div
  role="widget"
  aria-label={`Виджет ${widgetDefinition.title}`}
  aria-describedby={`widget-${widget.id}-description`}
  tabIndex={isEditMode ? 0 : undefined}
  aria-keyshortcuts="Delete Backspace Enter Escape Ctrl+R"
>
```

### Клавиатурная навигация

- **Delete/Backspace**: Удаление виджета
- **Enter**: Настройка виджета (с Shift)
- **Escape**: Снятие фокуса
- **Ctrl+R**: Сброс размера

## Troubleshooting

### Часто встречающиеся проблемы

1. **Виджеты перекрываются**: Проверьте `preventCollision={false}`
2. **Не работает drag**: Убедитесь что `isDraggable={true}` в режиме редактирования
3. **Проблемы с размерами**: Проверьте CSS свойства `width` и `height`
4. **Не сохраняется макет**: Убедитесь что `onLayoutChange` вызывается корректно

### Отладка

```tsx
// Включите логирование для отладки
console.log('Current layout:', layout);
console.log('Widgets:', widgets);
console.log('Current breakpoint:', currentBreakpoint);
```

## Совместимость

- **React**: 18+
- **TypeScript**: 4.5+
- **react-grid-layout**: 1.3+
- **@dnd-kit/core**: 6.0+
- **Tailwind CSS**: 3.0+

## Примеры

Смотрите `ResponsiveGridDemo.tsx` для полного примера использования всех возможностей интеграции.

## Лицензия

MIT License - смотрите LICENSE файл для деталей.
