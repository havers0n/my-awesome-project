-- Проверка доступных значений enum operation_type
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'operation_type'
ORDER BY e.enumsortorder;

-- Альтернативный способ проверки
SELECT unnest(enum_range(NULL::operation_type)) AS operation_type_values;

-- Проверяем структуру таблицы operations
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'operations' 
    AND table_schema = 'public'
ORDER BY ordinal_position; 