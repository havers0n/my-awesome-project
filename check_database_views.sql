-- Проверка данных для модального окна деталей товара

-- 1. Проверяем current_stock_view (основные данные товаров)
SELECT 'CURRENT_STOCK_VIEW' as check_name, COUNT(*) as total_records
FROM public.current_stock_view;

-- Показываем первые 3 товара
SELECT 
  product_id,
  product_name,
  current_stock,
  stock_status,
  organization_id
FROM public.current_stock_view 
LIMIT 3;

-- 2. Проверяем stock_by_location_view (детализация по локациям)
SELECT 'STOCK_BY_LOCATION_VIEW' as check_name, COUNT(*) as total_records
FROM public.stock_by_location_view;

-- Показываем первые 5 записей по локациям
SELECT 
  product_id,
  location_id,
  location_name,
  product_name,
  stock,
  organization_id
FROM public.stock_by_location_view 
LIMIT 5;

-- 3. Проверяем operations с JOIN к связанным таблицам
SELECT 'OPERATIONS_WITH_JOINS' as check_name, COUNT(*) as total_records
FROM public.operations o
JOIN public.locations l ON o.location_id = l.id
JOIN public.products p ON o.product_id = p.id
LEFT JOIN public.suppliers s ON o.supplier_id = s.id;

-- Показываем первые 5 операций с полной информацией
SELECT 
  o.id,
  o.operation_type,
  o.operation_date,
  o.quantity,
  o.product_id,
  p.name as product_name,
  o.location_id,
  l.name as location_name,
  o.supplier_id,
  s.name as supplier_name
FROM public.operations o
JOIN public.locations l ON o.location_id = l.id
JOIN public.products p ON o.product_id = p.id
LEFT JOIN public.suppliers s ON o.supplier_id = s.id
ORDER BY o.operation_date DESC
LIMIT 5;

-- 4. Проверяем suppliers
SELECT 'SUPPLIERS' as check_name, COUNT(*) as total_records
FROM public.suppliers;

-- Показываем первые 5 поставщиков
SELECT id, name, organization_id, created_at
FROM public.suppliers 
LIMIT 5;

-- 5. Проверяем locations
SELECT 'LOCATIONS' as check_name, COUNT(*) as total_records
FROM public.locations;

-- Показываем первые 5 локаций
SELECT id, name, organization_id, type, status
FROM public.locations 
LIMIT 5;

-- 6. Тест для конкретного товара (симулируем модальное окно)
-- Берем первый товар из current_stock_view
WITH first_product AS (
  SELECT product_id 
  FROM public.current_stock_view 
  LIMIT 1
)
SELECT 'TEST_SPECIFIC_PRODUCT' as check_name, 
       fp.product_id,
       'Operations count' as data_type,
       COUNT(o.id) as count
FROM first_product fp
LEFT JOIN public.operations o ON o.product_id = fp.product_id
GROUP BY fp.product_id;

-- Операции для первого товара
WITH first_product AS (
  SELECT product_id 
  FROM public.current_stock_view 
  LIMIT 1
)
SELECT 
  o.operation_type,
  o.operation_date,
  o.quantity,
  l.name as location_name,
  s.name as supplier_name
FROM first_product fp
JOIN public.operations o ON o.product_id = fp.product_id
JOIN public.locations l ON o.location_id = l.id
LEFT JOIN public.suppliers s ON o.supplier_id = s.id
ORDER BY o.operation_date DESC
LIMIT 10;

-- Остатки по локациям для первого товара
WITH first_product AS (
  SELECT product_id 
  FROM public.current_stock_view 
  LIMIT 1
)
SELECT 
  slv.location_id,
  slv.location_name,
  slv.stock
FROM first_product fp
JOIN public.stock_by_location_view slv ON slv.product_id = fp.product_id; 