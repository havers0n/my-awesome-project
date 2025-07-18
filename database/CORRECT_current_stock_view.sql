-- ПРАВИЛЬНОЕ представление для подсчета остатков
-- Основано на принципе: SUM(Приходы - Расходы)
-- Простое, надежное, показывает реальную картину

CREATE OR REPLACE VIEW public.current_stock_view AS
WITH product_operations AS (
  SELECT 
    o.product_id,
    o.location_id,
    o.organization_id,
    l.name as location_name,
    -- Простой и надежный подсчет остатков
    SUM(
      CASE 
        WHEN o.operation_type = 'supply' THEN o.quantity
        WHEN o.operation_type = 'sale' THEN -o.quantity
        WHEN o.operation_type = 'write_off' THEN -o.quantity
        WHEN o.operation_type = 'inventory' THEN o.quantity  -- Инвентаризация ставит точное значение
        ELSE 0
      END
    ) as location_stock
  FROM public.operations o
  JOIN public.locations l ON o.location_id = l.id
  GROUP BY o.product_id, o.location_id, o.organization_id, l.name
),
product_totals AS (
  SELECT 
    product_id,
    organization_id,
    SUM(location_stock) as total_stock,
    COUNT(DISTINCT location_id) as locations_count,
    NOW() as last_update
  FROM product_operations
  WHERE location_stock > 0  -- Учитываем только локации с положительным остатком
  GROUP BY product_id, organization_id
)
SELECT 
  p.id as product_id,
  p.organization_id,
  p.name as product_name,
  p.sku,
  p.code,
  p.price,
  COALESCE(pt.total_stock, 0) as current_stock,
  COALESCE(pt.locations_count, 0) as locations_with_stock,
  pt.last_update,
  -- Статус товара
  CASE 
    WHEN COALESCE(pt.total_stock, 0) = 0 THEN 'Нет в наличии'
    WHEN COALESCE(pt.total_stock, 0) <= 10 THEN 'Мало'
    ELSE 'В наличии'
  END as stock_status,
  p.created_at,
  p.updated_at
FROM public.products p
LEFT JOIN product_totals pt ON p.id = pt.product_id AND p.organization_id = pt.organization_id
ORDER BY p.name;

-- Для получения детализации по локациям используем тот же принцип
CREATE OR REPLACE VIEW public.stock_by_location_view AS
SELECT 
  o.product_id,
  o.location_id,
  o.organization_id,
  l.name as location_name,
  p.name as product_name,
  SUM(
    CASE 
      WHEN o.operation_type = 'supply' THEN o.quantity
      WHEN o.operation_type = 'sale' THEN -o.quantity
      WHEN o.operation_type = 'write_off' THEN -o.quantity
      WHEN o.operation_type = 'inventory' THEN o.quantity
      ELSE 0
    END
  ) as stock
FROM public.operations o
JOIN public.locations l ON o.location_id = l.id
JOIN public.products p ON o.product_id = p.id
GROUP BY o.product_id, o.location_id, o.organization_id, l.name, p.name
HAVING SUM(
  CASE 
    WHEN o.operation_type = 'supply' THEN o.quantity
    WHEN o.operation_type = 'sale' THEN -o.quantity
    WHEN o.operation_type = 'write_off' THEN -o.quantity
    WHEN o.operation_type = 'inventory' THEN o.quantity
    ELSE 0
  END
) > 0  -- Показываем только локации с положительным остатком
ORDER BY p.name, l.name;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_operations_product_location_type
ON public.operations (product_id, location_id, operation_type, organization_id);

-- Комментарии
COMMENT ON VIEW public.current_stock_view IS 'Агрегированные остатки товаров по организациям (простой и надежный подход)';
COMMENT ON VIEW public.stock_by_location_view IS 'Детализация остатков по локациям (использует тот же принцип подсчета)'; 