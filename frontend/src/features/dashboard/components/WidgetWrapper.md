# WidgetWrapper - Обновленный компонент

## Описание

Обновленный компонент `WidgetWrapper` с поддержкой:
- **Drag & Drop** через dnd-kit
- **Resize** через react-resizable
- **Анимации** через framer-motion
- **Accessibility** с поддержкой клавиатурной навигации
- **Визуальные индикаторы** для состояний drag и hover

## Новые возможности

### 1. Drag & Drop (dnd-kit)
```typescript
// Интеграция с useSortable
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
  id: widget.id,
  disabled: !isEditMode
});
```

### 2. Resize (react-resizable)
```typescript
<Resizable
  width={widgetWidth}
  height={widgetHeight}
  onResize={handleResize}
  minConstraints={[widgetDefinition.minSize.w * 100, widgetDefinition.minSize.h * 50]}
  maxConstraints={widgetDefinition.maxSize ? [widgetDefinition.maxSize.w * 100, widgetDefinition.maxSize.h * 50] : undefined}
  resizeHandles={isEditMode ? ['se', 'e', 's'] : []}
/>
```

### 3. Анимации (framer-motion)
```typescript
<motion.div
  ref={setNodeRef}
  style={dragStyle}
  layout
  // ... другие свойства
>
```

### 4. Accessibility
- **ARIA attributes**: `role="widget"`, `aria-label`, `aria-describedby`
- **Keyboard navigation**: Delete, Backspace, Enter, Escape
- **Focus management**: tabIndex для режима редактирования
- **Screen reader support**: скрытые описания

## Новые Props

### onResize
```typescript
onResize?: (widgetId: string, size: { width: number; height: number }) => void;
```

## Клавиатурные сочетания

| Клавиша | Действие |
|---------|----------|
| Delete / Backspace | Удалить виджет |
| Enter / Space | Настроить виджет (с Shift) |
| Escape | Снять фокус |

## Визуальные индикаторы

### Drag State
- Полупрозрачность (opacity: 0.5)
- Курсор `cursor-grabbing`
- Тень и поворот
- Drag overlay с пунктирной границей

### Hover State
- Подсветка границы
- Показ панели управления
- Изменение цвета фона

### Resize Handles
- Показываются только в режиме редактирования
- Кастомные стили через CSS модуль
- Синие круглые индикаторы

## Размеры

Система размеров основана на:
- `widget.width` / `widget.height` - пиксели
- `widgetDefinition.defaultSize.w/h` - множитель грида
- Fallback: `defaultSize.w * 100` / `defaultSize.h * 50`

## CSS Модуль

Кастомные стили в `WidgetWrapper.module.css`:
- `.widget-edit-mode` - режим редактирования
- `.widget-dragging` - состояние перетаскивания
- `.widget-drag-overlay` - overlay индикатор
- `.react-resizable-handle-*` - кастомизация handles

## Пример использования

```typescript
<WidgetWrapper
  widget={widget}
  widgetDefinition={widgetDefinition}
  isEditMode={isEditMode}
  onRemove={handleRemoveWidget}
  onConfig={handleConfigWidget}
  onResize={handleResizeWidget}
  className="custom-widget-class"
/>
```

## Обновленные типы

```typescript
interface DashboardWidget {
  id: string;
  widgetType: string;
  config?: Record<string, any>;
  visible: boolean;
  width?: number;  // Новое поле
  height?: number; // Новое поле
}
```

## Совместимость

- Совместим с существующими виджетами
- Backward compatible с DashboardWidget без размеров
- Работает с существующими WidgetDefinition
- Поддерживает все браузеры с ES6+ support
