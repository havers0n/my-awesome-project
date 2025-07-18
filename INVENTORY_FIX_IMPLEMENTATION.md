# ИСПРАВЛЕНИЕ СИСТЕМЫ ОСТАТКОВ - РУКОВОДСТВО ПО РЕАЛИЗАЦИИ

## Обзор проблемы
Страница `http://localhost:5173/inventory/management` не отображала остатки товаров из-за несоответствия между backend и frontend, а также критических ошибок в VIEW базы данных.

## Выполненные исправления

### 1. ✅ КРИТИЧЕСКАЯ ОШИБКА В VIEW ИСПРАВЛЕНА
**Проблема**: В оригинальном VIEW были строки `WHERE location_stock > 0` и `HAVING SUM(...) > 0`, которые скрывали отрицательные остатки.

**Почему это критично**: Отрицательные остатки - это важный сигнал о проблемах в данных (пропущенные операции внутреннего перемещения). Система должна показывать их, а не скрывать.

**Исправление**: Убраны условия фильтрации отрицательных остатков.

### 2. ✅ BACKEND КОНТРОЛЛЕР ПЕРЕПИСАН
- Убраны все mock данные (нарушение production-кода)
- Убрана сложная логика создания VIEW через API
- Реализована адаптация данных под формат frontend (Product с stock_by_location)
- Добавлена поддержка stock_by_location_view для детализации

### 3. ✅ АРХИТЕКТУРА УПРОЩЕНА
- Используются только 2 простых VIEW: `current_stock_view` и `stock_by_location_view`
- Убраны RPC-функции и сложные типы операций
- Принцип "Приход - Расход" для всех вычислений

## Инструкции по применению

### Шаг 1: Создание VIEW в базе данных

**ВАЖНО**: Выполните следующий SQL в Supabase Dashboard > SQL Editor:

```sql
-- STEP 1: Create stock_by_location_view
CREATE OR REPLACE VIEW public.stock_by_location_view AS
SELECT 
    o.organization_id,
    o.product_id,
    p.name as product_name,
    o.location_id,
    l.name as location_name,
    SUM(
        CASE 
            WHEN o.operation_type = 'supply' THEN o.quantity
            WHEN o.operation_type = 'sale' THEN -o.quantity
            WHEN o.operation_type = 'write_off' THEN -o.quantity
            ELSE 0
        END
    ) as stock
FROM public.operations o
JOIN public.locations l ON o.location_id = l.id
JOIN public.products p ON o.product_id = p.id
GROUP BY 
    o.organization_id, 
    o.product_id, 
    p.name,
    o.location_id, 
    l.name;
```

```sql
-- STEP 2: Create current_stock_view
CREATE OR REPLACE VIEW public.current_stock_view AS
SELECT
    p.id as product_id,
    p.organization_id,
    p.name as product_name,
    p.sku,
    p.code,
    p.price,
    COALESCE(SUM(slv.stock), 0) as current_stock,
    COUNT(slv.location_id) FILTER (WHERE slv.stock != 0) as locations_with_stock,
    CASE 
        WHEN COALESCE(SUM(slv.stock), 0) = 0 THEN 'Нет в наличии'
        WHEN COALESCE(SUM(slv.stock), 0) <= 10 THEN 'Мало'
        WHEN COALESCE(SUM(slv.stock), 0) < 0 THEN 'Отрицательный остаток'
        ELSE 'В наличии'
    END as stock_status,
    NOW() as last_update,
    p.created_at,
    p.updated_at
FROM 
    public.products p
LEFT JOIN 
    public.stock_by_location_view slv ON p.id = slv.product_id AND p.organization_id = slv.organization_id
GROUP BY
    p.id,
    p.organization_id,
    p.name,
    p.sku,
    p.code,
    p.price,
    p.created_at,
    p.updated_at;
```

### Шаг 2: Проверка VIEW

После создания VIEW проверьте их работу:

```sql
-- Проверка основного VIEW
SELECT * FROM current_stock_view LIMIT 5;

-- Проверка детализации
SELECT * FROM stock_by_location_view LIMIT 5;
```

### Шаг 3: Запуск backend

```bash
cd backend
npm run build
npm start
```

### Шаг 4: Тестирование API

Протестируйте endpoint для получения остатков:

```bash
# Если включена аутентификация
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/inventory/products

# Если аутентификация временно отключена (для тестирования)
curl http://localhost:3000/api/inventory/products-test
```

### Шаг 5: Запуск frontend

```bash
cd frontend
npm run dev
```

Откройте `http://localhost:5173/inventory/management` и проверьте отображение остатков.

## Структура данных

### Frontend ожидает (Product):
```typescript
interface Product {
  product_id: number;
  product_name: string;
  price: number;
  sku: string;
  stock_by_location: StockByLocation[];
}

interface StockByLocation {
  location_id: number;
  location_name: string;
  stock: number;
}
```

### Backend возвращает:
```typescript
{
  data: Product[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
}
```

## Файлы изменены

1. **`backend/src/controllers/inventoryController.ts`**
   - Переписана функция `getProducts()`
   - Убраны mock данные и `initializeStockView()`
   - Добавлена адаптация под формат frontend

2. **`backend/src/routes/inventoryRoutes.ts`**
   - Убран endpoint `/initialize-stock-view`

3. **`database/create_current_stock_view_FIXED.sql`**
   - Исправленная версия VIEW без фильтрации отрицательных остатков

## Что показывают отрицательные остатки

Если в результатах видны отрицательные остатки - это **нормально** и **важно**:
- Они указывают на пропущенные операции внутреннего перемещения
- Помогают выявить проблемы в данных
- Показывают реальную картину, а не приукрашенную

Пример:
```
Центральный склад: +1400 батонов
Магазин на Ленина: -558 батонов
Общий остаток: 1400 - 558 = 842 батона
```

## Проверка работоспособности

1. **VIEW созданы**: Запросы к `current_stock_view` и `stock_by_location_view` работают
2. **Backend отвечает**: API endpoint `/api/inventory/products` возвращает данные
3. **Frontend отображает**: Страница `/inventory/management` показывает остатки
4. **Данные корректны**: Остатки соответствуют операциям в базе

## Следующие шаги

1. Добавить индексы для производительности (если не созданы)
2. Настроить мониторинг отрицательных остатков
3. Внедрить процедуры исправления пропущенных операций
4. Создать отчеты по проблемным остаткам

## Поддержка

Система теперь использует простой и надежный подход без скрытой логики. Все остатки вычисляются по принципу "Приход - Расход" и показывают реальную картину. 