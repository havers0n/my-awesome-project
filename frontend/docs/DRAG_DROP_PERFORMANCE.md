# Drag & Drop Performance Testing and Optimization Guide

## Обзор

Этот документ описывает систему тестирования и оптимизации производительности для drag & drop функциональности в нашем React приложении.

## Структура тестов

### 1. Unit Tests

**Файлы:**
- `src/hooks/__tests__/useDragDropUX.test.ts` - тесты для основного хука
- `src/components/common/__tests__/DragPreview.test.tsx` - тесты для компонентов preview

**Что тестируется:**
- Логика состояний drag & drop
- Haptic и звуковая обратная связь
- CSS классы и стили
- Обработка ошибок
- Очистка ресурсов

**Запуск:**
```bash
npm run test:drag-drop
```

### 2. E2E Tests (Playwright)

**Файл:** `tests/e2e/drag-drop.spec.ts`

**Что тестируется:**
- Визуальная обратная связь при drag операциях
- Изменение cursor states
- Подсветка drop zones
- Файловый drag & drop
- Мобильная адаптивность
- Доступность (keyboard navigation, screen readers)
- Производительность операций

**Запуск:**
```bash
npm run test:e2e
# или конкретно drag & drop тесты
npx playwright test tests/e2e/drag-drop.spec.ts
```

### 3. Performance Monitoring

**Файл:** `src/utils/performance/DragDropPerformanceMonitor.ts`

**Метрики:**
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint) 
- **CLS** (Cumulative Layout Shift)
- **FID** (First Input Delay)
- Длительность drag операций
- Количество re-renders
- Использование памяти
- FPS во время анимаций

**Использование:**
```typescript
import { usePerformanceMonitor } from '@/utils/performance/DragDropPerformanceMonitor';

function MyDragComponent() {
  const { startDragOperation, endDragOperation, getReport } = usePerformanceMonitor();
  
  const handleDragStart = () => {
    startDragOperation(1); // количество элементов
    // ... drag logic
  };
  
  const handleDragEnd = () => {
    endDragOperation();
    // Получаем отчет
    const report = getReport();
    console.log('Performance report:', report);
  };
}
```

## Оптимизация производительности

### 1. React.memo и мемоизация

**Оптимизированные компоненты:** `src/components/optimized/OptimizedDragDropComponents.tsx`

Ключевые оптимизации:
- `React.memo` для предотвращения лишних re-renders
- `useMemo` для тяжелых вычислений
- `useCallback` для стабильных функций

```typescript
const OptimizedDraggable = memo(({ id, children, ...props }) => {
  const draggableClasses = useMemo(() => {
    // Мемоизируем расчет CSS классов
    return computeClasses(props);
  }, [props.disabled, props.isDragging]);
  
  const handleDrag = useCallback((data) => {
    // Стабильная функция
  }, []);
  
  return <motion.div className={draggableClasses}>{children}</motion.div>;
});
```

### 2. Lazy Loading виджетов

**Система:** `src/components/lazy/LazyWidgetLoader.tsx`

Особенности:
- Загрузка по приоритетам (high, medium, low)
- Intersection Observer для определения видимости
- Fallback компоненты и error boundaries
- Предварительная загрузка критичных виджетов

```typescript
const widgetConfig: LazyWidgetConfig = {
  id: 'sales-chart',
  type: 'chart',
  title: 'График продаж',
  priority: 'high', // загружается сразу
  preload: true,
  loadCondition: () => userHasAccess('sales')
};

<LazyWidget config={widgetConfig} />
```

### 3. Управление анимациями

**Конфигурация:** `src/config/dnd.config.ts`

Настройки для оптимальной производительности:
- Spring анимации с оптимальными параметрами
- Использование `transform` вместо изменения layout
- Throttling для haptic feedback
- Оптимизированные collision detection алгоритмы

### 4. Мониторинг Web Vitals

Автоматический мониторинг критических метрик:

```typescript
// Пороговые значения
const thresholds = {
  dragDuration: 500, // ms
  reRenderCount: 50,
  memoryThreshold: 50 * 1024 * 1024, // 50MB
  cls: 0.1 // максимальный CLS
};
```

## Команды для тестирования

### Основные команды

```bash
# Запуск всех тестов производительности
npm run test:performance

# Unit тесты только для drag & drop
npm run test:drag-drop

# E2E тесты
npm run test:e2e

# Тесты с покрытием кода
npm run test:coverage

# UI режим для тестов
npm run test:ui
```

### Специализированные команды

```bash
# E2E тесты в headed режиме (видимый браузер)
npm run test:e2e:headed

# E2E тесты на мобильных устройствах
npm run e2e:mobile

# Тесты производительности в dev режиме
npm run test:performance:dev

# Обновление снимков
npm run e2e:update-snapshots
```

## Benchmark и метрики

### Целевые показатели

| Метрика | Целевое значение | Критическое значение |
|---------|------------------|---------------------|
| Drag Duration | < 300ms | > 500ms |
| Re-renders | < 10 | > 50 |
| Memory Usage | < 20MB | > 50MB |
| FCP | < 1.8s | > 3s |
| LCP | < 2.5s | > 4s |
| CLS | < 0.1 | > 0.25 |
| FID | < 100ms | > 300ms |

### Интерпретация результатов

**Зеленая зона** ✅
- Все метрики в пределах целевых значений
- Производительность оптимальна
- Готово к продакшену

**Желтая зона** ⚠️
- Некоторые метрики превышают целевые, но в пределах критических
- Рекомендуется оптимизация
- Можно деплоить с мониторингом

**Красная зона** ❌
- Метрики превышают критические значения
- Требуется немедленная оптимизация
- Не рекомендуется к продакшену

## Troubleshooting

### Частые проблемы и решения

**1. Высокое количество re-renders**
```typescript
// Проблема: избыточные re-renders
const Component = ({ items, onUpdate }) => {
  // Каждый render создает новую функцию
  const handleDrag = (item) => onUpdate(item);
  
  // Решение: мемоизация
  const handleDrag = useCallback((item) => {
    onUpdate(item);
  }, [onUpdate]);
};
```

**2. Медленные drag операции**
```typescript
// Проблема: синхронные тяжелые операции
const handleDragEnd = (item) => {
  updateDatabase(item); // блокирует UI
  recalculateLayout(); // тяжелая операция
};

// Решение: асинхронность и оптимизация
const handleDragEnd = useCallback(async (item) => {
  // Быстрое обновление UI
  updateLocalState(item);
  
  // Асинхронное обновление БД
  setTimeout(() => updateDatabase(item), 0);
  
  // Дебаунс для пересчета
  debouncedRecalculate();
}, []);
```

**3. Проблемы с памятью**
- Убедитесь в правильной очистке event listeners
- Используйте WeakMap для кэширования
- Проверьте на memory leaks в DevTools

**4. Низкий FPS во время анимаций**
- Используйте `transform` вместо изменения `left/top`
- Применяйте `will-change: transform`
- Ограничивайте количество одновременных анимаций

## CI/CD интеграция

### GitHub Actions пример

```yaml
name: Drag & Drop Performance Tests

on: [push, pull_request]

jobs:
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: npm run test:performance
      
      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: reports/
```

## Мониторинг в продакшене

### Настройка мониторинга

```typescript
// В production коде
if (process.env.NODE_ENV === 'production') {
  // Включаем легкий мониторинг
  performanceMonitor.setThresholds({
    dragDuration: 1000, // более мягкие пороги для prod
    reRenderCount: 100,
  });
  
  // Отправляем метрики в аналитику
  performanceMonitor.onThresholdExceeded((metric, value) => {
    analytics.track('performance_issue', {
      metric,
      value,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });
  });
}
```

### Алерты и дашборды

Рекомендуется настроить:
- Алерты при превышении критических метрик
- Дашборды с трендами производительности
- A/B тесты для оптимизаций
- Корреляция с бизнес-метриками

## Заключение

Комплексное тестирование производительности drag & drop функциональности включает:

1. **Unit тесты** - проверка логики и корректности
2. **E2E тесты** - валидация UX и интеграций
3. **Performance мониторинг** - отслеживание метрик
4. **Оптимизация** - React.memo, lazy loading, мемоизация
5. **Continuous monitoring** - мониторинг в продакшене

Регулярный запуск тестов и мониторинг метрик помогает поддерживать высокое качество пользовательского опыта и предотвращать деградацию производительности.
