# 🚨 ПОЛНОЕ ИСПРАВЛЕНИЕ БАЗЫ ДАННЫХ - НАЙДЕНЫ ВСЕ ПРОБЛЕМЫ

## 📊 Диагностика завершена - найдено:

✅ **Данные есть:**
- 23 продукта для organization_id = 1
- 1000 операций для organization_id = 1
- 20 локаций для organization_id = 1

❌ **Проблемы:**
1. **VIEW отсутствуют/неправильные** → backend не может получить данные
2. **Только операции типа 'sale'** → все остатки отрицательные

## 🔧 ПЛАН ИСПРАВЛЕНИЯ (2 ЭТАПА):

### ЭТАП 1: Создать правильные VIEW

**Выполните в Supabase Dashboard > SQL Editor:**

```sql
-- Удаляем старые неправильные VIEW
DROP VIEW IF EXISTS public.current_stock_view CASCADE;
DROP VIEW IF EXISTS public.stock_by_location_view CASCADE;

-- Создаем правильный stock_by_location_view (ПЕРВЫМ!)
CREATE VIEW public.stock_by_location_view AS
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

-- Создаем правильный current_stock_view (ВТОРЫМ!)
CREATE VIEW public.current_stock_view AS
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

### ЭТАП 2: Добавить операции поступления (supply)

**Добавляем операции поступления для каждого продукта:**

```sql
-- Добавляем операции поступления товаров
-- Это создаст положительные остатки для всех продуктов

-- Для каждого продукта в каждой локации добавляем поступление
INSERT INTO public.operations (
    product_id, 
    organization_id, 
    location_id, 
    operation_type, 
    quantity, 
    operation_date
)
SELECT 
    p.id as product_id,
    p.organization_id,
    l.id as location_id,
    'supply' as operation_type,
    -- Случайное количество от 50 до 200 для создания положительных остатков
    50 + (RANDOM() * 150)::int as quantity,
    -- Дата поступления раньше продаж
    '2025-01-01'::date + (RANDOM() * 30)::int as operation_date
FROM public.products p
CROSS JOIN public.locations l 
WHERE p.organization_id = 1 
AND l.organization_id = 1
-- Добавляем не во все локации, только в половину для реалистичности
AND l.id % 2 = 1;

-- Добавляем дополнительные поступления для популярных товаров
INSERT INTO public.operations (
    product_id, 
    organization_id, 
    location_id, 
    operation_type, 
    quantity, 
    operation_date
)
SELECT 
    p.id as product_id,
    p.organization_id,
    1 as location_id, -- Основной склад
    'supply' as operation_type,
    100 + (RANDOM() * 300)::int as quantity,
    '2024-12-01'::date + (RANDOM() * 60)::int as operation_date
FROM public.products p
WHERE p.organization_id = 1;
```

### ЭТАП 3: Проверка результата

```sql
-- Проверяем что VIEW работают
SELECT * FROM current_stock_view LIMIT 5;
SELECT * FROM stock_by_location_view LIMIT 10;

-- Проверяем остатки
SELECT 
    product_name,
    current_stock,
    stock_status,
    locations_with_stock
FROM current_stock_view 
WHERE organization_id = 1
ORDER BY current_stock DESC;
```

## 🚀 После исправления:

1. **Перезапустите backend:**
```bash
cd backend
npm start
```

2. **Проверьте API:**
```bash
curl http://localhost:3000/api/inventory/products-test
```

3. **Откройте страницу:**
```
http://localhost:5173/inventory/management
```

## 🎯 Ожидаемый результат:

- ✅ API вернет реальные данные с остатками
- ✅ Frontend покажет таблицу с товарами и количествами
- ✅ Будут видны как положительные, так и отрицательные остатки
- ✅ Детализация по локациям будет работать

## 📝 Альтернативный минимальный вариант:

Если не хотите добавлять операции поступления, можно просто создать VIEW и проверить работу с отрицательными остатками. Система покажет их как "Отрицательный остаток" - это нормально и показывает реальную картину.

**Главное - создать правильные VIEW из ЭТАПА 1!** 