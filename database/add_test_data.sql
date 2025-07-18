-- Добавление тестовых данных для производителей и категорий в существующие продукты
-- Сначала добавляем производителей

INSERT INTO public.manufacturers (name, organization_id) 
VALUES 
  ('Mistral', 1),
  ('Premium Foods', 1),
  ('Barilla', 1),
  ('Sweet Co', 1),
  ('Mediterranean Oil Co', 1),
  ('Tropicana', 1),
  ('Aquafina', 1),
  ('Lipton', 1),
  ('Ariel', 1),
  ('Fairy', 1)
ON CONFLICT (id) DO NOTHING;

-- Добавляем категории продуктов

INSERT INTO public.product_categories (name, organization_id)
VALUES 
  ('Крупы и злаки', 1),
  ('Макаронные изделия', 1),
  ('Сахар и подсластители', 1),
  ('Масла и жиры', 1),
  ('Напитки', 1),
  ('Чай и кофе', 1),
  ('Бытовая химия', 1),
  ('Моющие средства', 1)
ON CONFLICT (id) DO NOTHING;

-- Обновляем существующие продукты, связывая их с производителями и категориями

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Mistral' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Крупы и злаки' AND organization_id = 1)
WHERE name = 'Mistral Japonica Rice 900g';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Premium Foods' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Крупы и злаки' AND organization_id = 1)
WHERE name = 'Premium Buckwheat 900g';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Barilla' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Макаронные изделия' AND organization_id = 1)
WHERE name = 'Barilla Spaghetti 500g';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Sweet Co' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Сахар и подсластители' AND organization_id = 1)
WHERE name = 'Granulated Sugar 1kg';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Mediterranean Oil Co' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Масла и жиры' AND organization_id = 1)
WHERE name = 'Olive Oil Extra Virgin 500ml';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Tropicana' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Напитки' AND organization_id = 1)
WHERE name = 'Tropicana Apple Juice 1L';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Aquafina' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Напитки' AND organization_id = 1)
WHERE name = 'Aquafina Purified Water 1.5L';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Lipton' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Чай и кофе' AND organization_id = 1)
WHERE name = 'Lipton Green Tea 25 bags';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Ariel' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Бытовая химия' AND organization_id = 1)
WHERE name = 'Ariel Washing Powder 3kg';

UPDATE public.products 
SET 
  manufacturer_id = (SELECT id FROM public.manufacturers WHERE name = 'Fairy' AND organization_id = 1),
  product_category_id = (SELECT id FROM public.product_categories WHERE name = 'Моющие средства' AND organization_id = 1)
WHERE name = 'Fairy Dish Soap 1L';

-- Проверяем результат
SELECT 
  p.id,
  p.name as product_name,
  m.name as manufacturer_name,
  pc.name as category_name
FROM public.products p
LEFT JOIN public.manufacturers m ON p.manufacturer_id = m.id
LEFT JOIN public.product_categories pc ON p.product_category_id = pc.id
WHERE p.organization_id = 1
ORDER BY p.name; 