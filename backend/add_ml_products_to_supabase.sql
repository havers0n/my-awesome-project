-- Скрипт для добавления тестовых продуктов ML-модели в Supabase
-- 
-- ВАЖНО: Перед выполнением этого скрипта:
-- 1. Подключитесь к вашей базе данных Supabase
-- 2. Узнайте ваш organization_id выполнив:
--    SELECT id, name FROM organizations WHERE name = 'Test Organization';
-- 3. Замените 'YOUR-ORG-ID' на реальный ID вашей организации

-- Сначала получаем ID категории "Продукты"
DO $$
DECLARE
    org_id UUID := 'YOUR-ORG-ID'::UUID; -- ЗАМЕНИТЕ на ваш реальный organization_id
    category_id INTEGER;
    bread_id UUID;
    milk_id UUID;
    cake_id UUID;
    location_id INTEGER;
BEGIN
    -- Получаем ID категории
    SELECT id INTO category_id 
    FROM product_categories 
    WHERE name = 'Продукты' AND organization_id = org_id;
    
    -- Если категории нет, создаем её
    IF category_id IS NULL THEN
        INSERT INTO product_categories (name, organization_id) 
        VALUES ('Продукты', org_id)
        RETURNING id INTO category_id;
    END IF;
    
    -- Добавляем продукты, которые знает ML-модель
    INSERT INTO products (organization_id, name, code, sku, price, product_category_id) VALUES 
    (org_id, 'Хлеб белый', 'BREAD-001', 'SKU-BREAD-001', 45.00, category_id),
    (org_id, 'Молоко', 'MILK-001', 'SKU-MILK-001', 85.00, category_id),
    (org_id, 'Торт шоколадный', 'CAKE-001', 'SKU-CAKE-001', 350.00, category_id)
    ON CONFLICT (code) DO NOTHING
    RETURNING id INTO bread_id, milk_id, cake_id;
    
    -- Получаем ID первой локации (магазина)
    SELECT id INTO location_id 
    FROM locations 
    WHERE organization_id = org_id AND type = 'shop' 
    LIMIT 1;
    
    -- Если локации нет, создаем её
    IF location_id IS NULL THEN
        INSERT INTO locations (organization_id, name, address, type, status) 
        VALUES (org_id, 'Main Store', '123 Test Street', 'shop', 'operating')
        RETURNING id INTO location_id;
    END IF;
    
    -- Получаем ID продуктов
    SELECT id INTO bread_id FROM products WHERE code = 'BREAD-001' AND organization_id = org_id;
    SELECT id INTO milk_id FROM products WHERE code = 'MILK-001' AND organization_id = org_id;
    SELECT id INTO cake_id FROM products WHERE code = 'CAKE-001' AND organization_id = org_id;
    
    -- Добавляем тестовые операции продаж
    INSERT INTO operations (organization_id, product_id, operation_type, operation_date, location_id, quantity, total_amount, cost_price, shelf_price) VALUES
    -- Продажи Хлеба белого
    (org_id, bread_id, 'sale', '2024-01-15', location_id, 25, 1125.00, 35.00, 45.00),
    (org_id, bread_id, 'sale', '2024-01-14', location_id, 30, 1350.00, 35.00, 45.00),
    (org_id, bread_id, 'sale', '2024-01-13', location_id, 28, 1260.00, 35.00, 45.00),
    (org_id, bread_id, 'sale', '2024-01-12', location_id, 35, 1575.00, 35.00, 45.00),
    (org_id, bread_id, 'sale', '2024-01-11', location_id, 20, 900.00, 35.00, 45.00),
    
    -- Продажи Молока
    (org_id, milk_id, 'sale', '2024-01-15', location_id, 15, 1275.00, 65.00, 85.00),
    (org_id, milk_id, 'sale', '2024-01-14', location_id, 18, 1530.00, 65.00, 85.00),
    (org_id, milk_id, 'sale', '2024-01-13', location_id, 12, 1020.00, 65.00, 85.00),
    (org_id, milk_id, 'sale', '2024-01-12', location_id, 20, 1700.00, 65.00, 85.00),
    (org_id, milk_id, 'sale', '2024-01-11', location_id, 16, 1360.00, 65.00, 85.00),
    
    -- Продажи Торта шоколадного
    (org_id, cake_id, 'sale', '2024-01-15', location_id, 3, 1050.00, 280.00, 350.00),
    (org_id, cake_id, 'sale', '2024-01-14', location_id, 5, 1750.00, 280.00, 350.00),
    (org_id, cake_id, 'sale', '2024-01-13', location_id, 2, 700.00, 280.00, 350.00),
    (org_id, cake_id, 'sale', '2024-01-12', location_id, 4, 1400.00, 280.00, 350.00),
    (org_id, cake_id, 'sale', '2024-01-11', location_id, 3, 1050.00, 280.00, 350.00);
    
    RAISE NOTICE 'Продукты и операции успешно добавлены!';
END $$;

-- Проверка добавленных продуктов
-- SELECT * FROM products WHERE code IN ('BREAD-001', 'MILK-001', 'CAKE-001');

-- Проверка добавленных операций
-- SELECT * FROM operations WHERE product_id IN (
--     SELECT id FROM products WHERE code IN ('BREAD-001', 'MILK-001', 'CAKE-001')
-- ) ORDER BY operation_date DESC;
