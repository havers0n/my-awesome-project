-- ФИНАЛЬНАЯ ПРАВИЛЬНАЯ ВЕРСИЯ VIEW ДЛЯ ОСТАТКОВ
-- ИСПРАВЛЕНА КРИТИЧЕСКАЯ ОШИБКА: убрана фильтрация отрицательных остатков
-- Отрицательные остатки = важный сигнал о проблемах в данных!

-- НАЧАЛО ТРАНЗАКЦИИ ДЛЯ БЕЗОПАСНОСТИ
BEGIN;

-- Сначала удаляем старые версии, если они есть
DROP VIEW IF EXISTS public.current_stock_view CASCADE;
DROP VIEW IF EXISTS public.stock_by_location_view CASCADE;

-- ПРАВИЛЬНОЕ ПРЕДСТАВЛЕНИЕ ДЛЯ ДЕТАЛИЗАЦИИ ПО ЛОКАЦИЯМ
-- Оно является основой для второго представления
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
            -- 'inventory' убрано, т.к. требует более сложной логики, чем простое суммирование
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
-- УБРАНО: HAVING SUM(...) > 0 -- эта строка скрывала отрицательные остатки!

-- ПРАВИЛЬНОЕ ПРЕДСТАВЛЕНИЕ ДЛЯ ОБЩИХ ОСТАТКОВ
-- Оно использует предыдущее представление, чтобы не дублировать логику (принцип DRY)
CREATE VIEW public.current_stock_view AS
SELECT
    p.id as product_id,
    p.organization_id,
    p.name as product_name,
    p.sku,
    p.code,
    p.price,
    -- Суммируем остатки из уже посчитанного представления (включая отрицательные!)
    COALESCE(SUM(slv.stock), 0) as current_stock,
    -- Считаем количество локаций, где есть хоть какой-то остаток (даже отрицательный)
    COUNT(slv.location_id) FILTER (WHERE slv.stock != 0) as locations_with_stock,
    -- Добавляем статус для совместимости с frontend
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
-- УБРАНО: WHERE ... > 0 -- эта строка скрывала продукты с отрицательными остатками!

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_operations_product_location_org 
ON public.operations (product_id, location_id, organization_id);

-- Комментарии
COMMENT ON VIEW public.stock_by_location_view IS 'Детализация остатков по локациям. Показывает реальные остатки, включая отрицательные, для выявления проблем в данных.';
COMMENT ON VIEW public.current_stock_view IS 'Агрегированные остатки товаров. Считает честную сумму по всем локациям, включая отрицательные остатки.'; 

-- ЗАВЕРШЕНИЕ ТРАНЗАКЦИИ
COMMIT; 