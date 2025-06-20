-- Sample organizations
INSERT INTO organizations (name, address) VALUES
    ('ООО "ТехноСервис"', 'г. Москва, ул. Ленина, 10'),
    ('ИП Иванов И.И.', 'г. Санкт-Петербург, пр. Невский, 25'),
    ('АО "Инновации"', 'г. Казань, ул. Баумана, 15')
ON CONFLICT DO NOTHING;

-- Sample users (passwords are hashed versions of 'password123')
-- In a real application, you would use bcrypt to hash passwords
INSERT INTO users (email, password_hash, full_name, organization_id, role) VALUES
    ('admin@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7Zfz3MqX5Ux3JqX5Ux3JqX5Ux3Jq', 'Администратор Системы', 1, 'superadmin'),
    ('owner@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7Zfz3MqX5Ux3JqX5Ux3JqX5Ux3Jq', 'Владелец Организации', 1, 'owner'),
    ('manager@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7Zfz3MqX5Ux3JqX5Ux3JqX5Ux3Jq', 'Менеджер Организации', 1, 'admin'),
    ('employee@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7Zfz3MqX5Ux3JqX5Ux3JqX5Ux3Jq', 'Сотрудник Организации', 1, 'employee'),
    ('owner2@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7Zfz3MqX5Ux3JqX5Ux3JqX5Ux3Jq', 'Владелец Организации 2', 2, 'owner'),
    ('employee2@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7Zfz3MqX5Ux3JqX5Ux3JqX5Ux3Jq', 'Сотрудник Организации 2', 2, 'employee'),
    ('owner3@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7Zfz3MqX5Ux3JqX5Ux3JqX5Ux3Jq', 'Владелец Организации 3', 3, 'owner'),
    ('employee3@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7Zfz3MqX5Ux3JqX5Ux3JqX5Ux3Jq', 'Сотрудник Организации 3', 3, 'employee')
ON CONFLICT (email) DO NOTHING;

-- Sample monetization agreements
-- Get the model type IDs
DO $$
DECLARE
    subscription_id INTEGER;
    savings_percentage_id INTEGER;
    pay_per_use_id INTEGER;
BEGIN
    -- Get the model type IDs
    SELECT id INTO subscription_id FROM monetization_model_types WHERE type_code = 'SUBSCRIPTION';
    SELECT id INTO savings_percentage_id FROM monetization_model_types WHERE type_code = 'SAVINGS_PERCENTAGE';
    SELECT id INTO pay_per_use_id FROM monetization_model_types WHERE type_code = 'PAY_PER_USE';

    -- Organization 1: Subscription
    INSERT INTO organization_monetization_agreements (organization_id, model_type_id, status, start_date, end_date, details) VALUES
        (1, subscription_id, 'ACTIVE', '2023-01-01', '2023-12-31', '{"plan": "premium", "price": 1000, "currency": "RUB", "billing_cycle": "monthly", "features": ["feature1", "feature2", "feature3"]}'::jsonb)
    ON CONFLICT DO NOTHING;

    -- Organization 1: Savings Percentage
    INSERT INTO organization_monetization_agreements (organization_id, model_type_id, status, start_date, end_date, details) VALUES
        (1, savings_percentage_id, 'ACTIVE', '2023-01-01', NULL, '{"percentage": 15, "min_savings": 1000, "currency": "RUB"}'::jsonb)
    ON CONFLICT DO NOTHING;

    -- Organization 2: Pay Per Use
    INSERT INTO organization_monetization_agreements (organization_id, model_type_id, status, start_date, end_date, details) VALUES
        (2, pay_per_use_id, 'ACTIVE', '2023-01-01', NULL, '{"price_per_unit": 100, "currency": "RUB", "units": ["unit1", "unit2"]}'::jsonb)
    ON CONFLICT DO NOTHING;

    -- Organization 3: Subscription (Trial)
    INSERT INTO organization_monetization_agreements (organization_id, model_type_id, status, start_date, end_date, details) VALUES
        (3, subscription_id, 'TRIAL', '2023-01-01', '2023-03-31', '{"plan": "basic", "price": 500, "currency": "RUB", "billing_cycle": "monthly", "features": ["feature1"]}'::jsonb)
    ON CONFLICT DO NOTHING;
END $$; 