# 🚨 Быстрая диагностика проблемы с виджетами

## Шаг 1: Откройте дашборд
1. Перейдите на http://localhost:5174/dashboard/
2. Откройте Developer Tools (F12) → Console

## Шаг 2: Проверьте логи при загрузке
Должны появиться логи:
```
🚀 [CustomizableDashboard] Component rendered
📊 [CustomizableDashboard] Persistence state: {...}
🎯 [CustomizableDashboard] Layout state: {...}
🎨 [DashboardGrid] Component rendered
📋 [DashboardGrid] Props: {layoutCount: 7, widgetsCount: 7, isEditMode: false}
```

## Шаг 3: Проверьте отладочную информацию
На странице должна появиться желтая панель с отладочной информацией.
Проверьте значения:
- Layout items: должно быть 7
- Widgets: должно быть 7  
- Visible widgets: должно быть 7

## Шаг 4: Попробуйте добавить виджет
1. Нажмите кнопку "Редактировать"
2. Нажмите кнопку "Добавить виджет"
3. Выберите любой виджет
4. Проверьте логи в консоли

## Ожидаемые логи при добавлении виджета:
```
🔥 [useDashboardLayout] START addWidget
🔥 [useDashboardLayout] Widget type: widget-name
✅ [useDashboardLayout] Widget definition found: {...}
🆔 [useDashboardLayout] Generated widget ID: widget-...
📍 [useDashboardLayout] Widget position: {x: 0, y: 30}
📦 [useDashboardLayout] New layout item: {...}
🎯 [useDashboardLayout] New widget: {...}
🚀 [useDashboardLayout] Calling onLayoutChange...
🚀 [useDashboardLayout] Calling onWidgetsChange...
✅ [useDashboardLayout] END addWidget
```

## Шаг 5: Проверьте результат
После добавления виджета:
1. Проверьте, изменились ли значения в отладочной панели
2. Проверьте, появился ли новый виджет на дашборде
3. Если виджет не появился, проверьте логи WidgetWrapper

## Возможные проблемы:

### Проблема 1: Логи не появляются
- Сервер не запущен или неправильный порт
- Ошибки JavaScript блокируют выполнение

### Проблема 2: Виджеты не отображаются при загрузке
- Проблема с localStorage (используйте debug-dashboard.html)
- Проблема с visible: false в виджетах

### Проблема 3: Виджеты не добавляются
- Проверьте логи добавления виджета
- Возможно, проблема в onLayoutChange или onWidgetsChange

### Проблема 4: Виджеты добавляются, но не отображаются
- Проверьте логи WidgetWrapper
- Возможно, проблема в компоненте виджета

## Скопируйте и отправьте:
1. Значения из отладочной панели
2. Все логи из консоли при добавлении виджета
3. Любые ошибки JavaScript 