-- Seed script to populate database with test data for forecasting

-- First, let's insert some organizations
INSERT INTO organizations (id, name, status) VALUES 
(1, 'Test Organization', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert some locations
INSERT INTO locations (id, organization_id, name, address, type, status) VALUES 
(1, 1, 'Main Store', '123 Test Street', 'shop', 'operating'),
(2, 1, 'Warehouse', '456 Storage Ave', 'warehouse', 'operating')
ON CONFLICT (id) DO NOTHING;

-- Insert some product categories
INSERT INTO product_categories (name, organization_id) VALUES 
('Продукты', 1),
('Напитки', 1)
ON CONFLICT (name, organization_id) DO NOTHING;

-- Get category ID for products
DO $$
DECLARE
    category_id INTEGER;
BEGIN
    SELECT id INTO category_id FROM product_categories WHERE name = 'Продукты' AND organization_id = 1;
    
    -- Insert some products including ML-model known products
    INSERT INTO products (organization_id, name, code, sku, price, product_category_id) VALUES 
    (1, 'Товар1', 'T001', 'SKU-T001', 100.00, category_id),
    (1, 'Товар2', 'T002', 'SKU-T002', 150.00, category_id),
    (1, 'Молоко', 'M001', 'SKU-M001', 80.00, category_id),
    (1, 'Хлеб', 'H001', 'SKU-H001', 50.00, category_id),
    (1, 'Яблоки', 'A001', 'SKU-A001', 120.00, category_id),
    -- ML-model known products
    (1, 'Хлеб белый', 'BREAD-001', 'SKU-BREAD-001', 45.00, category_id),
    (1, 'Молоко', 'MILK-001', 'SKU-MILK-001', 85.00, category_id),
    (1, 'Торт шоколадный', 'CAKE-001', 'SKU-CAKE-001', 350.00, category_id)
    ON CONFLICT (code) DO NOTHING;
END $$;

-- Get the product IDs for references
DO $$
DECLARE
    product1_id INTEGER;
    product2_id INTEGER;
    product3_id INTEGER;
    product4_id INTEGER;
    product5_id INTEGER;
    bread_id INTEGER;
    milk_id INTEGER;
    cake_id INTEGER;
BEGIN
    SELECT id INTO product1_id FROM products WHERE code = 'T001';
    SELECT id INTO product2_id FROM products WHERE code = 'T002';
    SELECT id INTO product3_id FROM products WHERE code = 'M001';
    SELECT id INTO product4_id FROM products WHERE code = 'H001';
    SELECT id INTO product5_id FROM products WHERE code = 'A001';
    -- ML-model products
    SELECT id INTO bread_id FROM products WHERE code = 'BREAD-001';
    SELECT id INTO milk_id FROM products WHERE code = 'MILK-001';
    SELECT id INTO cake_id FROM products WHERE code = 'CAKE-001';
    
    -- Insert some operations (sales data)
    INSERT INTO operations (organization_id, operation_type, operation_date, product_id, location_id, quantity, total_amount, cost_price, shelf_price) VALUES
    -- Sales for Товар1
    (1, 'sale', '2024-01-01', product1_id, 1, 10, 1000.00, 80.00, 100.00),
    (1, 'sale', '2024-01-02', product1_id, 1, 12, 1200.00, 80.00, 100.00),
    (1, 'sale', '2024-01-03', product1_id, 1, 8, 800.00, 80.00, 100.00),
    (1, 'sale', '2024-01-04', product1_id, 1, 15, 1500.00, 80.00, 100.00),
    (1, 'sale', '2024-01-05', product1_id, 1, 9, 900.00, 80.00, 100.00),
    (1, 'sale', '2024-01-06', product1_id, 1, 11, 1100.00, 80.00, 100.00),
    (1, 'sale', '2024-01-07', product1_id, 1, 13, 1300.00, 80.00, 100.00),
    (1, 'sale', '2024-01-08', product1_id, 1, 7, 700.00, 80.00, 100.00),
    (1, 'sale', '2024-01-09', product1_id, 1, 14, 1400.00, 80.00, 100.00),
    (1, 'sale', '2024-01-10', product1_id, 1, 10, 1000.00, 80.00, 100.00),

    -- Sales for Товар2
    (1, 'sale', '2024-01-01', product2_id, 1, 20, 3000.00, 120.00, 150.00),
    (1, 'sale', '2024-01-02', product2_id, 1, 18, 2700.00, 120.00, 150.00),
    (1, 'sale', '2024-01-03', product2_id, 1, 22, 3300.00, 120.00, 150.00),
    (1, 'sale', '2024-01-04', product2_id, 1, 25, 3750.00, 120.00, 150.00),
    (1, 'sale', '2024-01-05', product2_id, 1, 19, 2850.00, 120.00, 150.00),
    (1, 'sale', '2024-01-06', product2_id, 1, 21, 3150.00, 120.00, 150.00),
    (1, 'sale', '2024-01-07', product2_id, 1, 23, 3450.00, 120.00, 150.00),
    (1, 'sale', '2024-01-08', product2_id, 1, 17, 2550.00, 120.00, 150.00),
    (1, 'sale', '2024-01-09', product2_id, 1, 24, 3600.00, 120.00, 150.00),
    (1, 'sale', '2024-01-10', product2_id, 1, 20, 3000.00, 120.00, 150.00),

    -- Some supplies
    (1, 'supply', '2024-01-01', product1_id, 2, 50, 4000.00, 80.00, 100.00),
    (1, 'supply', '2024-01-05', product2_id, 2, 75, 9000.00, 120.00, 150.00),
    (1, 'supply', '2024-01-08', product3_id, 2, 100, 6000.00, 60.00, 80.00),
    (1, 'supply', '2024-01-08', product4_id, 2, 200, 8000.00, 30.00, 50.00),
    (1, 'supply', '2024-01-08', product5_id, 2, 80, 7200.00, 90.00, 120.00),

    -- Sales for ML-model products
    -- Хлеб белый (BREAD-001) sales
    (1, 'sale', '2024-01-15', bread_id, 1, 25, 1125.00, 35.00, 45.00),
    (1, 'sale', '2024-01-14', bread_id, 1, 30, 1350.00, 35.00, 45.00),
    (1, 'sale', '2024-01-13', bread_id, 1, 28, 1260.00, 35.00, 45.00),
    (1, 'sale', '2024-01-12', bread_id, 1, 35, 1575.00, 35.00, 45.00),
    (1, 'sale', '2024-01-11', bread_id, 1, 20, 900.00, 35.00, 45.00),
    
    -- Молоко (MILK-001) sales
    (1, 'sale', '2024-01-15', milk_id, 1, 15, 1275.00, 65.00, 85.00),
    (1, 'sale', '2024-01-14', milk_id, 1, 18, 1530.00, 65.00, 85.00),
    (1, 'sale', '2024-01-13', milk_id, 1, 12, 1020.00, 65.00, 85.00),
    (1, 'sale', '2024-01-12', milk_id, 1, 20, 1700.00, 65.00, 85.00),
    (1, 'sale', '2024-01-11', milk_id, 1, 16, 1360.00, 65.00, 85.00),
    
    -- Торт шоколадный (CAKE-001) sales
    (1, 'sale', '2024-01-15', cake_id, 1, 3, 1050.00, 280.00, 350.00),
    (1, 'sale', '2024-01-14', cake_id, 1, 5, 1750.00, 280.00, 350.00),
    (1, 'sale', '2024-01-13', cake_id, 1, 2, 700.00, 280.00, 350.00),
    (1, 'sale', '2024-01-12', cake_id, 1, 4, 1400.00, 280.00, 350.00),
    (1, 'sale', '2024-01-11', cake_id, 1, 3, 1050.00, 280.00, 350.00),
    
    -- Supplies for ML-model products
    (1, 'supply', '2024-01-10', bread_id, 2, 100, 3500.00, 35.00, 45.00),
    (1, 'supply', '2024-01-10', milk_id, 2, 50, 3250.00, 65.00, 85.00),
    (1, 'supply', '2024-01-10', cake_id, 2, 20, 5600.00, 280.00, 350.00);
END $$;

-- Note: User organization mapping should be done through your auth system
-- The user ID '2e4f4865-7c31-456a-bf14-77dd9eaf78fc' should already be linked to organization 1

-- Seed data populated successfully
