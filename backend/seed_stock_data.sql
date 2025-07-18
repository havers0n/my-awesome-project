-- Скрипт для заполнения таблицы operations тестовыми данными с остатками товаров
-- Это создаст данные для демонстрации функционала страницы инвентаря

-- Сначала проверим, что у нас есть основные данные
DO $$
DECLARE
    org_id bigint;
    loc_id bigint;
    user_uuid uuid;
    product_ids bigint[];
    p_id bigint;
BEGIN
    -- Получаем ID первой организации
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    IF org_id IS NULL THEN
        RAISE NOTICE 'No organizations found, creating test organization...';
        INSERT INTO public.organizations (name, inn_or_ogrn, description, status)
        VALUES ('Тестовая организация', '1234567890', 'Организация для демонстрации', 'active')
        RETURNING id INTO org_id;
    END IF;
    
    -- Получаем ID первой локации этой организации
    SELECT id INTO loc_id FROM public.locations WHERE organization_id = org_id LIMIT 1;
    IF loc_id IS NULL THEN
        RAISE NOTICE 'No locations found, creating test location...';
        INSERT INTO public.locations (organization_id, name, address, type, status)
        VALUES (org_id, 'Основной склад', 'ул. Тестовая, д. 1', 'warehouse', 'operating')
        RETURNING id INTO loc_id;
    END IF;
    
    -- Получаем ID первого пользователя
    SELECT id INTO user_uuid FROM public.users LIMIT 1;
    
    -- Получаем продукты этой организации
    SELECT ARRAY(SELECT id FROM public.products WHERE organization_id = org_id LIMIT 10) INTO product_ids;
    
    -- Если нет продуктов, создаем тестовые
    IF array_length(product_ids, 1) IS NULL OR array_length(product_ids, 1) = 0 THEN
        RAISE NOTICE 'No products found, creating test products...';
        
        INSERT INTO public.products (organization_id, name, sku, code, price)
        VALUES 
            (org_id, 'Колбаса докторская', 'KOL001', 'P001', 450.00),
            (org_id, 'Сыр российский', 'SYR001', 'P002', 380.00),
            (org_id, 'Молоко 3.2%', 'MOL001', 'P003', 65.00),
            (org_id, 'Хлеб белый', 'HLB001', 'P004', 45.00),
            (org_id, 'Масло сливочное', 'MAS001', 'P005', 280.00),
            (org_id, 'Яйца куриные (десяток)', 'YAI001', 'P006', 90.00),
            (org_id, 'Рис круглозерный 1кг', 'RIS001', 'P007', 85.00),
            (org_id, 'Гречка 1кг', 'GRE001', 'P008', 95.00),
            (org_id, 'Макароны 500г', 'MAK001', 'P009', 55.00),
            (org_id, 'Сахар 1кг', 'SAH001', 'P010', 70.00);
            
        SELECT ARRAY(SELECT id FROM public.products WHERE organization_id = org_id) INTO product_ids;
    END IF;
    
    RAISE NOTICE 'Organization ID: %, Location ID: %, User ID: %, Products count: %', 
                 org_id, loc_id, user_uuid, array_length(product_ids, 1);
    
    -- Удаляем старые операции для этой организации
    DELETE FROM public.operations WHERE organization_id = org_id;
    
    -- Создаем операции с остатками для каждого продукта
    FOREACH p_id IN ARRAY product_ids
    LOOP
        -- Создаем начальную операцию поступления для каждого товара
        INSERT INTO public.operations (
            organization_id,
            operation_type,
            operation_date,
            product_id,
            location_id,
            quantity,
            stock_on_hand,
            user_id,
            shelf_price
        ) VALUES (
            org_id,
            'приход',
            NOW() - INTERVAL '30 days' + (p_id % 10) * INTERVAL '1 day',
            p_id,
            loc_id,
            CASE 
                WHEN p_id % 5 = 0 THEN 0   -- 20% товаров нет в наличии
                WHEN p_id % 3 = 0 THEN FLOOR(RANDOM() * 10) + 1  -- 30% мало товара (1-10)
                ELSE FLOOR(RANDOM() * 50) + 11  -- 50% товара в наличии (11-60)
            END,
            CASE 
                WHEN p_id % 5 = 0 THEN 0   -- 20% товаров нет в наличии
                WHEN p_id % 3 = 0 THEN FLOOR(RANDOM() * 10) + 1  -- 30% мало товара (1-10)
                ELSE FLOOR(RANDOM() * 50) + 11  -- 50% товара в наличии (11-60)
            END,
            user_uuid,
            (SELECT price FROM public.products WHERE id = p_id)
        );
        
        -- Добавляем несколько случайных операций продаж для реалистичности
        IF p_id % 3 != 0 THEN  -- Не для всех товаров
            INSERT INTO public.operations (
                organization_id,
                operation_type,
                operation_date,
                product_id,
                location_id,
                quantity,
                stock_on_hand,
                user_id,
                shelf_price
            ) VALUES (
                org_id,
                'продажа',
                NOW() - INTERVAL '7 days' + (p_id % 5) * INTERVAL '1 day',
                p_id,
                loc_id,
                -(FLOOR(RANDOM() * 5) + 1),  -- Продали 1-5 штук
                GREATEST(0, (
                    SELECT stock_on_hand FROM public.operations 
                    WHERE product_id = p_id AND organization_id = org_id 
                    ORDER BY operation_date DESC LIMIT 1
                ) - (FLOOR(RANDOM() * 5) + 1)),
                user_uuid,
                (SELECT price FROM public.products WHERE id = p_id)
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Created operations for % products', array_length(product_ids, 1);
    
END $$; 