# SQL-запросы для бэкенда: Работа с простым VIEW

## 🎯 Принцип работы

Используем **один простой VIEW** `current_stock_view` и **JOIN** для получения всех необходимых данных.

## 📊 Примеры SQL-запросов

### 1. Получение общих остатков товаров

```sql
-- Запрос к VIEW для получения агрегированных остатков
SELECT 
    product_id,
    product_name,
    current_stock,
    locations_with_stock,
    stock_status
FROM current_stock_view 
WHERE organization_id = 1
ORDER BY product_name;
```

**Результат:**
```
product_id | product_name           | current_stock | locations_with_stock | stock_status
-----------|----------------------|---------------|-------------------|-------------
57         | Mistral Japonica Rice | 29            | 1                  | В наличии
58         | Premium Buckwheat     | 45            | 1                  | В наличии
```

### 2. Получение детализации по локациям

```sql
-- JOIN с operations для детализации по локациям
SELECT 
    o.product_id,
    o.location_id,
    l.name as location_name,
    SUM(
        CASE 
            WHEN o.operation_type = 'supply' THEN o.quantity
            WHEN o.operation_type = 'sale' THEN -o.quantity
            WHEN o.operation_type = 'write_off' THEN -o.quantity
            WHEN o.operation_type = 'inventory' THEN o.quantity
            ELSE 0
        END
    ) as stock
FROM operations o
JOIN locations l ON o.location_id = l.id
WHERE o.organization_id = 1
    AND o.product_id IN (57, 58, 59)
GROUP BY o.product_id, o.location_id, l.name
HAVING SUM(
    CASE 
        WHEN o.operation_type = 'supply' THEN o.quantity
        WHEN o.operation_type = 'sale' THEN -o.quantity
        WHEN o.operation_type = 'write_off' THEN -o.quantity
        WHEN o.operation_type = 'inventory' THEN o.quantity
        ELSE 0
    END
) > 0
ORDER BY o.product_id, l.name;
```

**Результат:**
```
product_id | location_id | location_name    | stock
-----------|-------------|------------------|-------
57         | 1           | Основной склад   | 29
58         | 1           | Основной склад   | 45
59         | 1           | Основной склад   | 25
```

### 3. Получение продуктов с производителями и категориями

```sql
-- JOIN с связанными таблицами
SELECT 
    p.id,
    p.name as product_name,
    p.sku,
    p.price,
    m.name as manufacturer_name,
    pc.name as category_name
FROM products p
LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
LEFT JOIN product_categories pc ON p.product_category_id = pc.id
WHERE p.organization_id = 1
ORDER BY p.name;
```

**Результат:**
```
id | product_name           | sku          | price | manufacturer_name | category_name
---|----------------------|--------------|-------|------------------|---------------
57 | Mistral Japonica Rice | SKU-ENG-5001 | 180   | Mistral           | Крупы и злаки
58 | Premium Buckwheat     | SKU-ENG-5002 | 120   | Premium Foods     | Крупы и злаки
```

### 4. Комбинированный запрос (если нужен один запрос)

```sql
-- Получение всего в одном запросе (более сложный, но эффективный)
WITH product_info AS (
    SELECT 
        p.id,
        p.name as product_name,
        p.sku,
        p.price,
        m.name as manufacturer_name,
        pc.name as category_name
    FROM products p
    LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
    LEFT JOIN product_categories pc ON p.product_category_id = pc.id
    WHERE p.organization_id = 1
),
stock_info AS (
    SELECT 
        o.product_id,
        o.location_id,
        l.name as location_name,
        SUM(
            CASE 
                WHEN o.operation_type = 'supply' THEN o.quantity
                WHEN o.operation_type = 'sale' THEN -o.quantity
                WHEN o.operation_type = 'write_off' THEN -o.quantity
                WHEN o.operation_type = 'inventory' THEN o.quantity
                ELSE 0
            END
        ) as stock
    FROM operations o
    JOIN locations l ON o.location_id = l.id
    WHERE o.organization_id = 1
    GROUP BY o.product_id, o.location_id, l.name
    HAVING SUM(
        CASE 
            WHEN o.operation_type = 'supply' THEN o.quantity
            WHEN o.operation_type = 'sale' THEN -o.quantity
            WHEN o.operation_type = 'write_off' THEN -o.quantity
            WHEN o.operation_type = 'inventory' THEN o.quantity
            ELSE 0
        END
    ) > 0
)
SELECT 
    pi.*,
    si.location_id,
    si.location_name,
    si.stock
FROM product_info pi
LEFT JOIN stock_info si ON pi.id = si.product_id
ORDER BY pi.product_name, si.location_name;
```

## 🔧 Реализация в TypeScript (Supabase)

### Получение общих остатков

```typescript
const { data: stockData } = await supabase
    .from('current_stock_view')
    .select('product_id, current_stock, locations_with_stock, stock_status')
    .eq('organization_id', organizationId)
    .in('product_id', productIds);
```

### Получение детализации по локациям

```typescript
const { data: locationStockData } = await supabase
    .from('operations')
    .select(`
        product_id,
        location_id,
        quantity,
        operation_type,
        locations:location_id (
            id,
            name
        )
    `)
    .eq('organization_id', organizationId)
    .in('product_id', productIds)
    .order('operation_date', { ascending: false });
```

### Получение продуктов с связями

```typescript
const { data: products } = await supabase
    .from('products')
    .select(`
        id,
        name,
        sku,
        price,
        manufacturers:manufacturer_id (
            id,
            name
        ),
        product_categories:product_category_id (
            id,
            name
        )
    `)
    .eq('organization_id', organizationId)
    .order('name');
```

## 📈 Преимущества этого подхода

1. **Простота**: Один VIEW, простая логика
2. **Производительность**: Эффективные JOIN-ы
3. **Гибкость**: Можно получать данные по частям или все сразу
4. **Поддерживаемость**: Одна логика подсчета остатков
5. **Масштабируемость**: Легко добавлять новые поля и связи

## 🚀 Готово к использованию

Backend контроллер уже адаптирован для работы с этой архитектурой. Просто выполните SQL для создания VIEW и все заработает! 