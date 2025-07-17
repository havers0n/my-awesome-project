-- Check operations table
SELECT COUNT(*) as operations_count FROM operations;

-- Check products table
SELECT COUNT(*) as products_count FROM products;

-- Check organization with id=1
SELECT id, name FROM organizations WHERE id = 1;

-- Sample operations data
SELECT id, product_id, date, quantity, unit_price 
FROM operations 
ORDER BY date DESC 
LIMIT 5;

-- Sample products data
SELECT id, name, product_code, unit_of_measure 
FROM products 
LIMIT 5;
