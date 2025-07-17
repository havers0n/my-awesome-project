-- Создание тестовых данных для разработки
-- Запустите это в Supabase SQL Editor

-- 1. Создаем тестовую организацию
INSERT INTO organizations (id, name, inn_or_ogrn, status, created_at, updated_at)
VALUES (1, 'Тестовая Компания ООО', '1234567890', 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Создаем тестовую локацию
INSERT INTO locations (id, organization_id, name, address, type, status, created_at, updated_at)
VALUES (1, 1, 'Главный офис', 'ул. Тестовая, 123', 'office', 'operating', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Обновляем существующих пользователей, добавляя им organization_id
-- Находим пользователя с email user@example.com и назначаем ему организацию
UPDATE users 
SET organization_id = 1, default_location_id = 1, role = 'employee'
WHERE email = 'user@example.com';

-- Если пользователя нет, создаем его (предполагая, что ID известен из Supabase Auth)
-- ЗАМЕНИТЬ '1dd51450-1296-4d68-9a71-81bbe9cef114' НА РЕАЛЬНЫЙ ID ПОЛЬЗОВАТЕЛЯ
INSERT INTO users (id, email, organization_id, default_location_id, role, full_name, is_active, created_at, updated_at)
VALUES ('1dd51450-1296-4d68-9a71-81bbe9cef114', 'user@example.com', 1, 1, 'employee', 'Тестовый Пользователь', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
    organization_id = EXCLUDED.organization_id,
    default_location_id = EXCLUDED.default_location_id,
    role = EXCLUDED.role;

-- 4. Создаем тестовые продукты
INSERT INTO products (id, organization_id, name, sku, price, weight, created_at, updated_at)
VALUES 
    (1, 1, 'Тестовый продукт 1', 'TEST001', 100.00, 1.0, NOW(), NOW()),
    (2, 1, 'Тестовый продукт 2', 'TEST002', 200.00, 2.0, NOW(), NOW()),
    (3, 1, 'Тестовый продукт 3', 'TEST003', 300.00, 3.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Создаем тестовые операции для прогнозирования
INSERT INTO operations (organization_id, operation_type, operation_date, product_id, location_id, quantity, total_amount, cost_price, shelf_price, stock_on_hand, user_id, created_at, updated_at)
VALUES 
    (1, 'purchase', NOW() - INTERVAL '30 days', 1, 1, 50, 5000, 100, 120, 50, '1dd51450-1296-4d68-9a71-81bbe9cef114', NOW(), NOW()),
    (1, 'sale', NOW() - INTERVAL '25 days', 1, 1, 10, 1200, 100, 120, 40, '1dd51450-1296-4d68-9a71-81bbe9cef114', NOW(), NOW()),
    (1, 'sale', NOW() - INTERVAL '20 days', 1, 1, 15, 1800, 100, 120, 25, '1dd51450-1296-4d68-9a71-81bbe9cef114', NOW(), NOW()),
    (1, 'purchase', NOW() - INTERVAL '15 days', 2, 1, 30, 6000, 200, 240, 30, '1dd51450-1296-4d68-9a71-81bbe9cef114', NOW(), NOW()),
    (1, 'sale', NOW() - INTERVAL '10 days', 2, 1, 8, 1920, 200, 240, 22, '1dd51450-1296-4d68-9a71-81bbe9cef114', NOW(), NOW()),
    (1, 'sale', NOW() - INTERVAL '5 days', 1, 1, 5, 600, 100, 120, 20, '1dd51450-1296-4d68-9a71-81bbe9cef114', NOW(), NOW());

SELECT 'Тестовые данные созданы успешно!' as result; 