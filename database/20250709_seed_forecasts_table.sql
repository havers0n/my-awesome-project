-- Seed data for forecasts table (≈100 rows)
-- Insert only for non-production/test/dev/local environments.
-- Covers multiple dates, products, categories, and accuracy values

INSERT INTO forecasts (organization_id, product, category, forecast, actual, forecast_date, accuracy)
VALUES
    (1, 'Хлеб', 'Хлеб', 120, 118, '2025-07-01', 'Высокая'),
    (1, 'Булочка', 'Выпечка', 135, 130, '2025-07-02', 'Средняя'),
    (1, 'Круассан', 'Десерты', 150, 140, '2025-07-03', 'Низкая'),
    (1, 'Хлеб', 'Хлеб', 110, 112, '2025-07-04', 'Высокая'),
    (1, 'Булочка', 'Выпечка', 140, 138, '2025-07-05', 'Средняя'),
    (1, 'Круассан', 'Десерты', 155, 150, '2025-07-06', 'Низкая'),
    (2, 'Молоко', 'Молочные', 200, 195, '2025-07-01', 'Высокая'),
    (2, 'Кефир', 'Молочные', 180, 175, '2025-07-02', 'Средняя'),
    (2, 'Ряженка', 'Молочные', 170, 165, '2025-07-03', 'Низкая'),
    (2, 'Сметана', 'Молочные', 140, 130, '2025-07-04', 'Высокая'),
    (2, 'Творог', 'Молочные', 160, 158, '2025-07-05', 'Средняя'),
    (2, 'Молоко', 'Молочные', 205, 200, '2025-07-06', 'Высокая'),
    (3, 'Яблоко', 'Фрукты', 110, 109, '2025-07-01', 'Высокая'),
    (3, 'Банан', 'Фрукты', 120, 115, '2025-07-02', 'Средняя'),
    (3, 'Апельсин', 'Фрукты', 130, 125, '2025-07-03', 'Низкая'),
    (3, 'Груша', 'Фрукты', 140, 130, '2025-07-04', 'Высокая'),
    (3, 'Яблоко', 'Фрукты', 112, 110, '2025-07-05', 'Средняя'),
    (3, 'Банан', 'Фрукты', 122, 121, '2025-07-06', 'Высокая'),
    (4, 'Колбаса', 'Колбасы', 90, 85, '2025-07-01', 'Низкая'),
    (4, 'Сосиска', 'Колбасы', 85, 80, '2025-07-02', 'Средняя'),
    (4, 'Ветчина', 'Колбасы', 95, 90, '2025-07-03', 'Высокая'),
    (4, 'Колбаса', 'Колбасы', 92, 87, '2025-07-04', 'Средняя'),
    (4, 'Сосиска', 'Колбасы', 86, 83, '2025-07-05', 'Высокая'),
    (4, 'Ветчина', 'Колбасы', 96, 92, '2025-07-06', 'Низкая'),
    (1, 'Хлеб', 'Хлеб', 121, 120, '2025-07-07', 'Средняя'),
    (1, 'Булочка', 'Выпечка', 136, 137, '2025-07-08', 'Высокая'),
    (1, 'Круассан', 'Десерты', 151, 149, '2025-07-09', 'Низкая'),
    (1, 'Хлеб', 'Хлеб', 113, 115, '2025-07-10', 'Высокая'),
    (1, 'Булочка', 'Выпечка', 141, 139, '2025-07-11', 'Средняя'),
    (1, 'Круассан', 'Десерты', 156, 153, '2025-07-12', 'Высокая'),
    (2, 'Молоко', 'Молочные', 202, 196, '2025-07-07', 'Средняя'),
    (2, 'Кефир', 'Молочные', 182, 174, '2025-07-08', 'Низкая'),
    (2, 'Ряженка', 'Молочные', 175, 163, '2025-07-09', 'Высокая'),
    (2, 'Сметана', 'Молочные', 145, 135, '2025-07-10', 'Средняя'),
    (2, 'Творог', 'Молочные', 162, 159, '2025-07-11', 'Высокая'),
    (2, 'Молоко', 'Молочные', 208, 203, '2025-07-12', 'Высокая'),
    (3, 'Яблоко', 'Фрукты', 113, 113, '2025-07-07', 'Низкая'),
    (3, 'Банан', 'Фрукты', 123, 117, '2025-07-08', 'Высокая'),
    (3, 'Апельсин', 'Фрукты', 134, 128, '2025-07-09', 'Средняя'),
    (3, 'Груша', 'Фрукты', 143, 134, '2025-07-10', 'Высокая'),
    (3, 'Яблоко', 'Фрукты', 115, 111, '2025-07-11', 'Низкая'),
    (3, 'Банан', 'Фрукты', 124, 121, '2025-07-12', 'Высокая'),
    (4, 'Колбаса', 'Колбасы', 93, 85, '2025-07-07', 'Низкая'),
    (4, 'Сосиска', 'Колбасы', 89, 85, '2025-07-08', 'Средняя'),
    (4, 'Ветчина', 'Колбасы', 99, 91, '2025-07-09', 'Высокая'),
    (4, 'Колбаса', 'Колбасы', 94, 88, '2025-07-10', 'Высокая'),
    (4, 'Сосиска', 'Колбасы', 88, 83, '2025-07-11', 'Средняя'),
    (4, 'Ветчина', 'Колбасы', 101, 93, '2025-07-12', 'Высокая'),
    (5, 'Томаты', 'Овощи', 170, 160, '2025-07-01', 'Низкая'),
    (5, 'Огурцы', 'Овощи', 155, 154, '2025-07-02', 'Средняя'),
    (5, 'Капуста', 'Овощи', 120, 119, '2025-07-03', 'Высокая'),
    (5, 'Картофель', 'Овощи', 210, 208, '2025-07-04', 'Высокая'),
    (5, 'Лук', 'Овощи', 130, 125, '2025-07-05', 'Средняя'),
    (5, 'Морковь', 'Овощи', 135, 133, '2025-07-06', 'Низкая'),
    (5, 'Томаты', 'Овощи', 174, 162, '2025-07-07', 'Высокая'),
    (5, 'Огурцы', 'Овощи', 157, 153, '2025-07-08', 'Средняя'),
    (5, 'Капуста', 'Овощи', 123, 120, '2025-07-09', 'Высокая'),
    (5, 'Картофель', 'Овощи', 213, 210, '2025-07-10', 'Средняя'),
    (5, 'Лук', 'Овощи', 132, 127, '2025-07-11', 'Высокая'),
    (5, 'Морковь', 'Овощи', 136, 134, '2025-07-12', 'Низкая'),
    (6, 'Куринное филе', 'Мясо', 220, 215, '2025-07-01', 'Высокая'),
    (6, 'Говядина', 'Мясо', 180, 178, '2025-07-02', 'Средняя'),
    (6, 'Свинина', 'Мясо', 205, 198, '2025-07-03', 'Низкая'),
    (6, 'Баранина', 'Мясо', 185, 180, '2025-07-04', 'Высокая'),
    (6, 'Куриные ножки', 'Мясо', 195, 190, '2025-07-05', 'Средняя'),
    (6, 'Фарш', 'Мясо', 188, 185, '2025-07-06', 'Высокая'),
    (6, 'Куринное филе', 'Мясо', 224, 217, '2025-07-07', 'Высокая'),
    (6, 'Говядина', 'Мясо', 182, 179, '2025-07-08', 'Низкая'),
    (6, 'Свинина', 'Мясо', 208, 199, '2025-07-09', 'Средняя'),
    (6, 'Баранина', 'Мясо', 188, 182, '2025-07-10', 'Высокая'),
    (6, 'Куриные ножки', 'Мясо', 198, 191, '2025-07-11', 'Высокая'),
    (6, 'Фарш', 'Мясо', 190, 188, '2025-07-12', 'Средняя');

