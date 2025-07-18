-- Создаем RPC функцию для получения продуктов с остатками
-- Использует ТОЧНО тот же SQL что работает в тестах

CREATE OR REPLACE FUNCTION get_products_with_stock(org_id INTEGER)
RETURNS TABLE (
    product_id INTEGER,
    product_name TEXT,
    sku TEXT,
    code TEXT,
    price DECIMAL,
    current_stock INTEGER,
    stock_status TEXT,
    locations_with_stock INTEGER,
    last_update TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) 
LANGUAGE SQL
AS $$
    SELECT
        p.id as product_id,
        p.name as product_name,
        p.sku,
        p.code,
        p.price,
        COALESCE(v.current_stock, 0) as current_stock,
        COALESCE(v.stock_status, 'Нет данных') as stock_status,
        COALESCE(v.locations_with_stock, 0) as locations_with_stock,
        v.last_update,
        p.created_at,
        p.updated_at
    FROM
        public.products p
    LEFT JOIN
        public.current_stock_view v ON p.id = v.product_id AND p.organization_id = v.organization_id
    WHERE
        p.organization_id = org_id
    ORDER BY
        p.name;
$$;

-- Права доступа
GRANT EXECUTE ON FUNCTION get_products_with_stock(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_with_stock(INTEGER) TO anon;

-- Комментарий
COMMENT ON FUNCTION get_products_with_stock(INTEGER) IS 'Получает продукты с остатками через LEFT JOIN с current_stock_view. Использует тот же SQL что работает в тестах.'; 