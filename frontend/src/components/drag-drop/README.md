# Drag & Drop UX Components

Комплексное решение для улучшения пользовательского опыта drag & drop взаимодействий с визуальными индикаторами, анимациями и haptic feedback.

## Основные компоненты

### 1. `useDragDropUX` Hook

Хук для управления состояниями drag & drop и обеспечения UX улучшений.

```tsx
import { useDragDropUX } from '../../hooks/useDragDropUX';

const { state, handlers, helpers, feedback } = useDragDropUX({
  enableHapticFeedback: true,
  enableSounds: false,
  enableVisualFeedback: true,
  animationDuration: 200,
});
```

#### Возможности:

- **Haptic feedback** - вибрация на мобильных устройствах
- **Sound feedback** - звуковые сигналы при действиях
- **Cursor states** - автоматическое управление курсором
- **Visual feedback** - CSS классы для состояний

### 2. `DragPreview` Component

Компонент для отображения preview перетаскиваемого элемента.

```tsx
import DragPreview, { WidgetDragPreview, FileDragPreview } from '../common/DragPreview';

// Базовый preview
<DragPreview
  title="Элемент"
  description="Описание элемента"
  isDragging={isDragging}
/>

// Специализированный preview для виджетов
<WidgetDragPreview
  widgetType="chart"
  title="График продаж"
  isDragging={isDragging}
/>

// Специализированный preview для файлов
<FileDragPreview
  fileName="document.pdf"
  fileType="PDF"
  fileSize="2.5 MB"
  isDragging={isDragging}
/>
```

### 3. `EnhancedDropZone` Component

Улучшенная зона для drop с визуальными индикаторами и валидацией.

```tsx
import EnhancedDropZone from '../common/EnhancedDropZone';

<EnhancedDropZone
  onDrop={handleFileDrop}
  acceptedTypes={['image/*', 'application/pdf']}
  maxFileSize={10 * 1024 * 1024}
  maxFiles={5}
  title="Перетащите файлы сюда"
  subtitle="или нажмите для выбора"
  showPreview={true}
/>;
```

## CSS Классы

### Cursor States

- `cursor-grab` - рука для захвата
- `cursor-grabbing` - зажатая рука при перетаскивании
- `cursor-not-allowed` - запрещенное действие

### Drag States

- `.draggable--idle` - элемент в состоянии покоя
- `.draggable--dragging` - элемент перетаскивается
- `.draggable--not-allowed` - перетаскивание запрещено

### Drop Zones

- `.drop-zone` - базовая зона для drop
- `.drop-zone--active` - зона активна (элемент над ней)
- `.drop-zone--valid` - зона принимает элемент
- `.drop-zone--invalid` - зона не принимает элемент

## Конфигурация анимаций

```tsx
// В src/config/dnd.config.ts
export const enhancedDragAnimations = {
  idle: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  dragging: {
    scale: 1.05,
    rotate: 2,
    opacity: 0.8,
    zIndex: 9999,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  // ... другие состояния
};
```

## Haptic Feedback

Поддерживаются различные паттерны вибрации:

```tsx
export const hapticPatterns = {
  dragStart: [10], // Легкая вибрация при начале
  dragEnd: [50], // Средняя вибрация при окончании
  dropSuccess: [100], // Сильная вибрация при успешном drop
  dropError: [50, 50, 50], // Серия вибраций при ошибке
};
```

## Accessibility

### Поддержка клавиатуры

- `Tab` - навигация между элементами
- `Space/Enter` - активация drag
- `Arrow keys` - перемещение при drag
- `Escape` - отмена drag

### Screen Readers

- Соответствующие ARIA атрибуты
- Описательные labels
- Объявления о состояниях

### Пример использования с клавиатурой:

```tsx
<div
  role="button"
  tabIndex={0}
  aria-label="Перетаскиваемый элемент"
  aria-describedby="element-description"
  onKeyDown={handleKeyDown}
  className="draggable"
>
  Содержимое элемента
</div>
```

## Responsive Design

Адаптация для мобильных устройств:

```css
@media (max-width: 768px) {
  .draggable {
    touch-action: manipulation;
  }

  .draggable--dragging {
    scale: 1.1; /* Увеличенный масштаб на мобильных */
  }
}
```

## Примеры использования

### 1. Файловый менеджер

```tsx
function FileManager() {
  const { state, handlers } = useDragDropUX({
    enableHapticFeedback: true,
  });

  return (
    <div>
      <EnhancedDropZone
        onDrop={handleFileDrop}
        acceptedTypes={['image/*', 'application/pdf']}
        maxFileSize={10 * 1024 * 1024}
      />

      <FileDragPreview
        fileName={draggedFile?.name}
        fileType={draggedFile?.type}
        isDragging={state.isDragging}
      />
    </div>
  );
}
```

### 2. Dashboard с виджетами

```tsx
function WidgetDashboard() {
  const { state, handlers } = useDragDropUX();

  return (
    <DragDropUXProvider>
      <div className="widget-grid">
        {widgets.map(widget => (
          <div
            key={widget.id}
            className={helpers.getDraggableClasses()}
            onDragStart={() => handlers.handleDragStart(widget)}
            onDragEnd={handlers.handleDragEnd}
          >
            <Widget {...widget} />
          </div>
        ))}
      </div>
    </DragDropUXProvider>
  );
}
```

### 3. Сортируемый список

```tsx
function SortableList({ items }) {
  return (
    <div className="sortable-list">
      {items.map(item => (
        <div key={item.id} className="sortable-item draggable" draggable>
          <div className="drag-handle">⋮⋮</div>
          <div className="item-content">{item.title}</div>
        </div>
      ))}
    </div>
  );
}
```

## Производительность

### Оптимизации:

- Использование `transform-gpu` для аппаратного ускорения
- Throttling для haptic feedback
- Lazy loading для preview компонентов
- Мемоизация обработчиков событий

### Мониторинг:

```tsx
// Отслеживание производительности drag операций
useEffect(() => {
  if (state.isDragging) {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`Drag operation took ${endTime - startTime}ms`);
    };
  }
}, [state.isDragging]);
```

## Тестирование

### Unit Tests

```tsx
import { render, fireEvent } from '@testing-library/react';
import { useDragDropUX } from '../useDragDropUX';

test('should handle drag start', () => {
  const { result } = renderHook(() => useDragDropUX());

  act(() => {
    result.current.handlers.handleDragStart(mockItem);
  });

  expect(result.current.state.isDragging).toBe(true);
});
```

### E2E Tests

```tsx
// Cypress пример
cy.get('[data-testid="draggable-item"]')
  .trigger('dragstart')
  .get('[data-testid="drop-zone"]')
  .trigger('drop');

cy.get('[data-testid="success-message"]').should('be.visible');
```

## Браузерная совместимость

| Функция         | Chrome | Firefox | Safari | Edge |
| --------------- | ------ | ------- | ------ | ---- |
| Drag & Drop     | ✅     | ✅      | ✅     | ✅   |
| Haptic Feedback | ✅     | ❌      | ✅     | ❌   |
| CSS Animations  | ✅     | ✅      | ✅     | ✅   |
| Touch Events    | ✅     | ✅      | ✅     | ✅   |

## Лучшие практики

1. **Используйте семантические HTML элементы**
2. **Предоставляйте визуальную обратную связь**
3. **Тестируйте на мобильных устройствах**
4. **Обеспечивайте keyboard accessibility**
5. **Оптимизируйте производительность анимаций**
6. **Предусматривайте fallback для unsupported features**

## Troubleshooting

### Проблема: Haptic feedback не работает

**Решение**: Проверьте поддержку `navigator.vibrate` и HTTPS соединение.

### Проблема: Анимации тормозят

**Решение**: Используйте `will-change: transform` и ограничьте количество одновременных анимаций.

### Проблема: Drag не работает на touch устройствах

**Решение**: Добавьте `touch-action: none` и обработчики touch событий.
