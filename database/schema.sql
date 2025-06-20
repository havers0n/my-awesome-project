-- Таблица для организаций (точек)
-- Если у вас уже есть таблица организаций, адаптируйте эту или используйте вашу.
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    -- Другие поля, описывающие организацию (например, ИНН, контакты и т.д.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица для пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL, -- Пользователь может быть привязан к организации
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'employee', -- Например: 'employee', 'owner', 'admin', 'superadmin'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Справочник типов моделей монетизации
CREATE TABLE IF NOT EXISTS monetization_model_types (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE NOT NULL, -- Короткий код (например, 'SUBSCRIPTION', 'SAVINGS_PERCENTAGE')
    name VARCHAR(255) NOT NULL,            -- Человекочитаемое название
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Основная таблица для хранения соглашений по монетизации с организациями
CREATE TABLE IF NOT EXISTS organization_monetization_agreements (
    id SERIAL PRIMARY KEY, -- Или UUID, если предпочитаете: id UUID PRIMARY KEY DEFAULT gen_random_uuid()
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    model_type_id INTEGER NOT NULL REFERENCES monetization_model_types(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- Например: 'ACTIVE', 'INACTIVE', 'EXPIRED', 'PENDING_PAYMENT', 'TRIAL'
    start_date DATE,
    end_date DATE,
    details JSONB NOT NULL DEFAULT '{}'::jsonb, -- Здесь будут все специфические атрибуты модели
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT check_dates CHECK (end_date IS NULL OR start_date IS NULL OR start_date <= end_date)
);

-- Индексы для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_oma_organization_id ON organization_monetization_agreements(organization_id);
CREATE INDEX IF NOT EXISTS idx_oma_model_type_id ON organization_monetization_agreements(model_type_id);
CREATE INDEX IF NOT EXISTS idx_oma_status ON organization_monetization_agreements(status);

-- GIN-индекс для эффективного поиска по содержимому JSONB поля 'details'
-- Полезен, если вы будете фильтровать или искать по значениям внутри JSON
CREATE INDEX IF NOT EXISTS idx_gin_oma_details ON organization_monetization_agreements USING GIN (details);

-- Триггер для автоматического обновления поля updated_at (стандартная практика)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применение триггера к таблицам
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = current_schema()
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_timestamp ON %I;', t_name); -- Удаляем старый, если есть
        EXECUTE format('CREATE TRIGGER set_timestamp
                        BEFORE UPDATE ON %I
                        FOR EACH ROW
                        EXECUTE FUNCTION trigger_set_timestamp();', t_name);
    END LOOP;
END;
$$;

-- Пример заполнения справочника типов моделей монетизации
INSERT INTO monetization_model_types (type_code, name, description) VALUES
    ('SUBSCRIPTION', 'Подписка', 'Фиксированная плата за определенный период использования сервиса.')
    ON CONFLICT (type_code) DO NOTHING; -- Не вставлять, если такой type_code уже существует

INSERT INTO monetization_model_types (type_code, name, description) VALUES
    ('SAVINGS_PERCENTAGE', 'Процент от экономии', 'Комиссия, рассчитываемая как процент от суммы, сэкономленной клиентом благодаря использованию сервиса.')
    ON CONFLICT (type_code) DO NOTHING;

INSERT INTO monetization_model_types (type_code, name, description) VALUES
    ('PAY_PER_USE', 'Оплата за использование', 'Оплата на основе фактического использования определенных функций или ресурсов сервиса.')
    ON CONFLICT (type_code) DO NOTHING;

COMMIT; -- Если вы выполняете это в транзакции 