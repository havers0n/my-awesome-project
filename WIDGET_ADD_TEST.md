# 🧪 Тестирование добавления виджетов

## Проблема
Новые виджеты не добавляются на дашборд.

## Диагностика с логами

### Шаг 1: Очистка localStorage
1. Откройте `frontend/clear-dashboard-storage.html`
2. Нажмите "Очистить конфигурации дашборда"
3. Нажмите "Установить дефолтную конфигурацию"

### Шаг 2: Тестирование добавления виджета
1. Откройте дашборд: `http://localhost:5174/dashboard`
2. Нажмите "Режим редактирования"
3. Нажмите "Добавить виджет"
4. Выберите любой виджет из списка
5. Проверьте логи в консоли

### Ожидаемые логи при добавлении:

```
🎮 [CustomizableDashboard] Toggle edit mode: true
➕ [CustomizableDashboard] Open add widget modal
🎨 [AddWidgetModal] Modal state: {isOpen: true, availableWidgets: 10, ...}
🔍 [AddWidgetModal] Filtered widgets: 10
🎯 [AddWidgetModal] Widget clicked: ecommerce-metrics EcommerceMetrics
➕ [AddWidgetModal] Widget selected: ecommerce-metrics
➕ [AddWidgetModal] Calling onAddWidget callback
🎯 [CustomizableDashboard] Add widget confirmed: ecommerce-metrics
🔥 [useDashboardLayout] START addWidget
🔥 [useDashboardLayout] Widget type: ecommerce-metrics
✅ [useDashboardLayout] Widget definition found: {...}
🆔 [useDashboardLayout] Generated widget ID: widget-xxxxx
📍 [useDashboardLayout] Widget position: {x: 0, y: 0}
📦 [useDashboardLayout] New layout item: {...}
🎯 [useDashboardLayout] New widget: {...}
🚀 [useDashboardLayout] Calling onLayoutChange...
🚀 [useDashboardLayout] Calling onWidgetsChange...
✅ [useDashboardLayout] END addWidget
🔧 [CustomizableDashboard] Widgets changed: {...}
💾 [useDashboardPersistence] Saving dashboard config: {...}
```

### Возможные проблемы:

#### 1. Виджет не найден
```
❌ [useDashboardLayout] Widget type not found: widget-type
```
**Решение:** Проверить `widgetRegistry.ts`

#### 2. Ошибка сохранения
```
❌ Error saving dashboard config: ...
```
**Решение:** Проверить localStorage

#### 3. Виджет не отображается
```
🎯 [DashboardGrid] Widget default-widget-X: exists=false
```
**Решение:** Проверить соответствие ID в layout и widgets

## Диагностические команды

### Проверка localStorage в консоли:
```javascript
// Показать текущую конфигурацию
console.log(JSON.parse(localStorage.getItem('dashboard-config-v3')));

// Очистить localStorage
localStorage.removeItem('dashboard-config-v3');

// Установить дефолтную конфигурацию
localStorage.setItem('dashboard-config-v3', JSON.stringify({
  version: '1.0.0',
  layout: [
    { i: 'default-widget-1', x: 0, y: 0, w: 12, h: 4 }
  ],
  widgets: {
    'default-widget-1': {
      id: 'default-widget-1',
      widgetType: 'ecommerce-metrics',
      config: {},
      visible: true
    }
  },
  settings: {
    gridSize: 12,
    autoResize: true,
    theme: 'light'
  }
}));
```

### Проверка реестра виджетов:
```javascript
// В консоли браузера
console.log(Object.keys(window.WIDGET_REGISTRY || {}));
```

## Что проверить:

1. ✅ Сервер запущен на правильном порту
2. ✅ localStorage очищен от старых данных
3. ✅ Логи появляются при клике на виджет
4. ✅ Функция `addWidget` вызывается
5. ✅ Новый виджет добавляется в состояние
6. ✅ Конфигурация сохраняется в localStorage
7. ✅ Компонент перерендеривается с новыми данными

---

**Статус:** Диагностика готова 🔍  
**Файлы обновлены:** 2 (с логированием) 