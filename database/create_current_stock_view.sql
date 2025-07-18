-- Создание представления current_stock_view для агрегации остатков по локациям
-- Исходи из схемы в database/schema.sql и логики операций

CREATE OR REPLACE VIEW public.current_stock_view AS
WITH latest_operations AS (
  -- Берем последние операции для каждого продукта в каждой локации
  SELECT DISTINCT ON (product_id, location_id, organization_id)
    product_id,
    location_id,
    organization_id,
    COALESCE(stock_on_hand, 0) as current_stock,
    operation_date,
    operation_type
  FROM public.operations
  WHERE stock_on_hand IS NOT NULL
  ORDER BY product_id, location_id, organization_id, operation_date DESC
),
calculated_stock AS (
  -- Если нет stock_on_hand, вычисляем через операции
  SELECT 
    product_id,
    location_id,
    organization_id,
    SUM(
      CASE 
        WHEN operation_type IN ('purchase', 'receipt', 'incoming') THEN quantity
        WHEN operation_type IN ('sale', 'outgoing', 'write_off') THEN -quantity
        ELSE 0
      END
    ) as calculated_stock
  FROM public.operations
  WHERE stock_on_hand IS NULL
  GROUP BY product_id, location_id, organization_id
),
combined_stock AS (
  -- Объединяем последние stock_on_hand с вычисленными остатками
  SELECT 
    product_id,
    location_id,
    organization_id,
    current_stock as stock
  FROM latest_operations
  
  UNION ALL
  
  SELECT 
    product_id,
    location_id, 
    organization_id,
    GREATEST(calculated_stock, 0) as stock -- Не показываем отрицательные остатки
  FROM calculated_stock
  WHERE (product_id, location_id, organization_id) NOT IN (
    SELECT product_id, location_id, organization_id FROM latest_operations
  )
),
aggregated_stock AS (
  -- Агрегируем по продуктам и организациям
  SELECT 
    product_id,
    organization_id,
    SUM(stock) as total_stock,
    COUNT(DISTINCT location_id) as locations_count,
    NOW() as last_update
  FROM combined_stock
  GROUP BY product_id, organization_id
)
SELECT 
  p.id as product_id,
  p.organization_id,
  p.name as product_name,
  p.sku,
  p.code,
  p.price,
  COALESCE(ast.total_stock, 0) as current_stock,
  COALESCE(ast.locations_count, 0) as locations_with_stock,
  ast.last_update,
  CASE 
    WHEN COALESCE(ast.total_stock, 0) = 0 THEN 'Нет в наличии'
    WHEN COALESCE(ast.total_stock, 0) <= 10 THEN 'Мало'
    ELSE 'В наличии'
  END as stock_status,
  p.created_at,
  p.updated_at
FROM public.products p
LEFT JOIN aggregated_stock ast ON p.id = ast.product_id AND p.organization_id = ast.organization_id
ORDER BY p.name;

-- Создание RPC функции для получения остатков по локациям
CREATE OR REPLACE FUNCTION public.get_current_stock_by_location(
  product_ids bigint[],
  org_id bigint
)
RETURNS TABLE (
  product_id bigint,
  location_id bigint,
  location_name text,
  stock numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH latest_operations AS (
    SELECT DISTINCT ON (o.product_id, o.location_id)
      o.product_id,
      o.location_id,
      COALESCE(o.stock_on_hand, 0) as current_stock,
      o.operation_date,
      l.name as location_name
    FROM public.operations o
    JOIN public.locations l ON o.location_id = l.id
    WHERE o.product_id = ANY(product_ids)
      AND o.organization_id = org_id
      AND o.stock_on_hand IS NOT NULL
    ORDER BY o.product_id, o.location_id, o.operation_date DESC
  ),
  calculated_stock AS (
    SELECT 
      o.product_id,
      o.location_id,
      l.name as location_name,
      SUM(
        CASE 
          WHEN o.operation_type IN ('purchase', 'receipt', 'incoming') THEN o.quantity
          WHEN o.operation_type IN ('sale', 'outgoing', 'write_off') THEN -o.quantity
          ELSE 0
        END
      ) as calculated_stock
    FROM public.operations o
    JOIN public.locations l ON o.location_id = l.id
    WHERE o.product_id = ANY(product_ids)
      AND o.organization_id = org_id
      AND o.stock_on_hand IS NULL
    GROUP BY o.product_id, o.location_id, l.name
  )
  SELECT 
    lo.product_id,
    lo.location_id,
    lo.location_name,
    GREATEST(lo.current_stock, 0)::numeric as stock
  FROM latest_operations lo
  
  UNION ALL
  
  SELECT 
    cs.product_id,
    cs.location_id,
    cs.location_name,
    GREATEST(cs.calculated_stock, 0)::numeric as stock
  FROM calculated_stock cs
  WHERE (cs.product_id, cs.location_id) NOT IN (
    SELECT lo.product_id, lo.location_id FROM latest_operations lo
  );
END;
$$;

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_operations_product_location_date 
ON public.operations (product_id, location_id, organization_id, operation_date DESC)
WHERE stock_on_hand IS NOT NULL;

-- Комментарии для документации
COMMENT ON VIEW public.current_stock_view IS 'Представление для получения актуальных остатков товаров по организациям';
COMMENT ON COLUMN public.current_stock_view.current_stock IS 'Текущий остаток товара суммарно по всем локациям';
COMMENT ON COLUMN public.current_stock_view.stock_status IS 'Статус товара: В наличии, Мало, Нет в наличии';
COMMENT ON COLUMN public.current_stock_view.locations_with_stock IS 'Количество локаций где есть данный товар'; 