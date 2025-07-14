-- Таблица для хранения прогнозов/продаж
CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    product VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    forecast INTEGER NOT NULL,
    actual INTEGER,
    forecast_date DATE NOT NULL,
    accuracy VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Пример данных для тестирования
INSERT INTO forecasts (organization_id, product, category, forecast, actual, forecast_date, accuracy)
VALUES
    (1, 'Хлеб', 'Хлеб', 120, 118, '2025-07-01', 'Высокая'),
    (1, 'Булочка', 'Выпечка', 135, 130, '2025-07-02', 'Средняя'),
    (1, 'Круассан', 'Десерты', 150, 140, '2025-07-03', 'Низкая'),
    (1, 'Хлеб', 'Хлеб', 110, 112, '2025-07-04', 'Высокая'),
    (1, 'Булочка', 'Выпечка', 140, 138, '2025-07-05', 'Средняя'),
    (1, 'Круассан', 'Десерты', 155, 150, '2025-07-06', 'Низкая')
ON CONFLICT DO NOTHING;
