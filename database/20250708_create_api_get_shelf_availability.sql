CREATE OR REPLACE FUNCTION api_get_shelf_availability(
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_sort TEXT DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 10
)
RETURNS TABLE(
  id BIGINT,
  product_name TEXT,
  total_stock INT,
  available_stock INT,
  reserved_stock INT,
  out_of_stock_hours INT,
  shelf_location TEXT,
  status TEXT
)
AS $$
BEGIN
  RETURN QUERY
  WITH stock_calcs AS (
    SELECT
      operations.product_id,
      SUM(CASE WHEN operations.operation_type = 'purchase' THEN operations.quantity ELSE 0 END) as total_purchased,
      SUM(CASE WHEN operations.operation_type = 'sale' THEN operations.quantity ELSE 0 END) as total_sold
    FROM public.operations
    GROUP BY operations.product_id
  ),
  stock AS (
    SELECT
      stock_calcs.product_id,
      stock_calcs.total_purchased AS total_stock,
      (stock_calcs.total_purchased - stock_calcs.total_sold) AS available_stock
    FROM stock_calcs
  ),
  out_of_stock_info AS (
    SELECT
      out_of_stock_items.product_id,
      EXTRACT(EPOCH FROM (NOW() - MIN(out_of_stock_items.created_at))) / 3600 AS hours
    FROM public.out_of_stock_items
    WHERE out_of_stock_items.status = 'pending'
    GROUP BY out_of_stock_items.product_id
  ),
  shelf_availability_data AS (
    SELECT
      p.id,
      p.name AS product_name,
      p.sku,
      s.total_stock,
      s.available_stock,
      0 AS reserved_stock,
      COALESCE(oosi.hours, 0) AS out_of_stock_hours,
      (SELECT l.name FROM public.operations op JOIN public.locations l ON op.location_id = l.id WHERE op.product_id = p.id ORDER BY op.operation_date DESC LIMIT 1) AS shelf_location,
      CASE
        WHEN COALESCE(s.available_stock, 0) <= 0 THEN 'out_of_stock'
        WHEN COALESCE(s.total_stock, 0) > 0 AND COALESCE(s.available_stock, 0) < (COALESCE(s.total_stock, 0) * 0.1) THEN 'critical'
        WHEN COALESCE(s.total_stock, 0) > 0 AND COALESCE(s.available_stock, 0) < (COALESCE(s.total_stock, 0) * 0.3) THEN 'low_stock'
        ELSE 'available'
      END AS status
    FROM public.products p
    LEFT JOIN stock s ON p.id = s.product_id
    LEFT JOIN out_of_stock_info oosi ON p.id = oosi.product_id
  )
  SELECT
    sad.id,
    sad.product_name::TEXT,
    COALESCE(sad.total_stock, 0)::INT,
    COALESCE(sad.available_stock, 0)::INT,
    sad.reserved_stock::INT,
    sad.out_of_stock_hours::INT,
    sad.shelf_location::TEXT,
    sad.status::TEXT
  FROM shelf_availability_data sad
  WHERE
    (p_search IS NULL OR sad.product_name ILIKE '%' || p_search || '%' OR sad.sku ILIKE '%' || p_search || '%')
    AND (p_status IS NULL OR sad.status = p_status)
  ORDER BY
    CASE WHEN p_sort = 'name' THEN sad.product_name END,
    CASE WHEN p_sort = 'stock' THEN sad.available_stock END DESC,
    CASE WHEN p_sort = 'status'
      THEN (
        CASE sad.status
          WHEN 'out_of_stock' THEN 0
          WHEN 'critical' THEN 1
          WHEN 'low_stock' THEN 2
          ELSE 3
        END
      )
    END
  LIMIT p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$ LANGUAGE plpgsql;
