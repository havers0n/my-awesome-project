-- Создание представления для получения актуальных остатков товаров
-- Это представление объединяет данные из tables: products, operations, locations
-- и вычисляет текущие остатки на основе последних операций

CREATE OR REPLACE VIEW public.current_stock_view AS
WITH latest_operations AS (
  -- Получаем последнюю операцию для каждого товара в каждой локации
  SELECT DISTINCT ON (product_id, location_id, organization_id)
    product_id,
    location_id,
    organization_id,
    stock_on_hand as current_stock,
    operation_date,
    operation_type
  FROM public.operations
  WHERE stock_on_hand IS NOT NULL
  ORDER BY product_id, location_id, organization_id, operation_date DESC
),
aggregated_stock AS (
  -- Суммируем остатки по всем локациям для каждого товара
  SELECT 
    product_id,
    organization_id,
    SUM(COALESCE(current_stock, 0)) as total_stock,
    COUNT(location_id) as locations_count,
    MAX(operation_date) as last_update
  FROM latest_operations
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
  -- Определяем статус товара на основе остатка
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

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_operations_product_location_date 
ON public.operations (product_id, location_id, organization_id, operation_date DESC)
WHERE stock_on_hand IS NOT NULL;

-- Комментарии для документации
COMMENT ON VIEW public.current_stock_view IS 'Представление для получения актуальных остатков товаров по организациям';
COMMENT ON COLUMN public.current_stock_view.current_stock IS 'Текущий остаток товара суммарно по всем локациям';
COMMENT ON COLUMN public.current_stock_view.stock_status IS 'Статус товара: В наличии, Мало, Нет в наличии';
COMMENT ON COLUMN public.current_stock_view.locations_with_stock IS 'Количество локаций где есть данный товар'; 