-- Monetization Schema for User Profiles

-- Table for storing different monetization types
CREATE TABLE monetization_types (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic monetization types
INSERT INTO monetization_types (type_code, type_name, description) VALUES
('subscription', 'Подписка', 'Фиксированная плата за период использования'),
('savings_percentage', 'Процент от экономии', 'Комиссия от сэкономленных средств'),
('pay_per_use', 'Оплата по использованию', 'Оплата за каждую единицу использования');

-- Table for storing user monetization details
CREATE TABLE user_monetization (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monetization_type_id INTEGER NOT NULL REFERENCES monetization_types(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, monetization_type_id)
);

-- Table for subscription-specific details
CREATE TABLE subscription_details (
    id SERIAL PRIMARY KEY,
    user_monetization_id INTEGER NOT NULL REFERENCES user_monetization(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Активна', 'Просрочена', 'Тестовый период'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE,
    cost_per_period DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for savings percentage details
CREATE TABLE savings_percentage_details (
    id SERIAL PRIMARY KEY,
    user_monetization_id INTEGER NOT NULL REFERENCES user_monetization(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    period VARCHAR(50) NOT NULL, -- 'Июнь 2025', etc.
    current_savings DECIMAL(15, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL, -- Stored as percentage (e.g., 10.00 for 10%)
    commission_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for pay-per-use details
CREATE TABLE pay_per_use_details (
    id SERIAL PRIMARY KEY,
    user_monetization_id INTEGER NOT NULL REFERENCES user_monetization(id) ON DELETE CASCADE,
    period VARCHAR(50) NOT NULL, -- 'Июнь 2025', etc.
    usage INTEGER NOT NULL,
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing user roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic user roles
INSERT INTO user_roles (role_code, role_name, description) VALUES
('employee', 'Сотрудник', 'Обычный сотрудник точки'),
('franchisee', 'Владелец/Управляющий', 'Владелец или управляющий точки'),
('admin', 'Администратор', 'Супер-администратор системы');

-- Add role_id to users table (if not already exists)
ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES user_roles(id);

-- Create indexes for better performance
CREATE INDEX idx_user_monetization_user_id ON user_monetization(user_id);
CREATE INDEX idx_subscription_details_user_monetization_id ON subscription_details(user_monetization_id);
CREATE INDEX idx_savings_percentage_details_user_monetization_id ON savings_percentage_details(user_monetization_id);
CREATE INDEX idx_pay_per_use_details_user_monetization_id ON pay_per_use_details(user_monetization_id);

-- Create a view for easy access to user monetization details
CREATE OR REPLACE VIEW user_monetization_view AS
SELECT 
    u.id AS user_id,
    u.email,
    ur.role_code AS user_role,
    mt.type_code AS monetization_type,
    mt.type_name AS monetization_type_name,
    um.is_active AS monetization_active,
    CASE 
        WHEN mt.type_code = 'subscription' THEN
            json_build_object(
                'type', 'subscription',
                'planName', sd.plan_name,
                'status', sd.status,
                'expiresAt', sd.end_date,
                'costPerPeriod', sd.cost_per_period || ' ' || sd.currency || '/' || sd.billing_cycle,
                'renewalDate', sd.renewal_date
            )
        WHEN mt.type_code = 'savings_percentage' THEN
            json_build_object(
                'type', 'savings_percentage',
                'metricName', spd.metric_name,
                'currentSavings', spd.current_savings || ' ' || spd.currency,
                'period', spd.period,
                'commissionRate', spd.commission_rate || '%',
                'commissionAmount', spd.commission_amount || ' ' || spd.currency
            )
        WHEN mt.type_code = 'pay_per_use' THEN
            json_build_object(
                'type', 'pay_per_use',
                'period', ppud.period,
                'usage', ppud.usage,
                'costPerUnit', ppud.cost_per_unit || ' ' || ppud.currency,
                'totalCost', ppud.total_cost || ' ' || ppud.currency
            )
        ELSE NULL
    END AS monetization_details
FROM 
    users u
JOIN 
    user_roles ur ON u.role_id = ur.id
LEFT JOIN 
    user_monetization um ON u.id = um.user_id
LEFT JOIN 
    monetization_types mt ON um.monetization_type_id = mt.id
LEFT JOIN 
    subscription_details sd ON um.id = sd.user_monetization_id AND mt.type_code = 'subscription'
LEFT JOIN 
    savings_percentage_details spd ON um.id = spd.user_monetization_id AND mt.type_code = 'savings_percentage'
LEFT JOIN 
    pay_per_use_details ppud ON um.id = ppud.user_monetization_id AND mt.type_code = 'pay_per_use'
WHERE 
    um.is_active = TRUE;

-- Example of how to query the view to get all monetization details for a user
-- SELECT user_id, email, user_role, monetization_type, monetization_details 
-- FROM user_monetization_view 
-- WHERE user_id = 123;

-- Example of how to query the view to get all monetization details for a user as a JSON array
-- SELECT 
--     user_id, 
--     email, 
--     user_role, 
--     json_agg(monetization_details) AS monetization_details_array
-- FROM user_monetization_view 
-- WHERE user_id = 123
-- GROUP BY user_id, email, user_role; 