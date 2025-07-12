-- Создание таблицы для хранения пользовательских настроек
-- Файл: 20250712_create_user_preferences_table.sql

-- Создаем таблицу user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальный индекс на user_id - у каждого пользователя только одна запись настроек
    CONSTRAINT unique_user_preferences UNIQUE(user_id)
);

-- Создаем индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Создаем индекс для поиска по содержимому JSONB (для будущих запросов)
CREATE INDEX IF NOT EXISTS idx_user_preferences_sidebar_order 
ON public.user_preferences USING GIN ((preferences->'sidebar'->'order'));

CREATE INDEX IF NOT EXISTS idx_user_preferences_sidebar_hidden 
ON public.user_preferences USING GIN ((preferences->'sidebar'->'hiddenItems'));

-- Добавляем комментарии для документации
COMMENT ON TABLE public.user_preferences IS 'Хранение пользовательских настроек (настройки сайдбара, темы, языка и т.д.)';
COMMENT ON COLUMN public.user_preferences.user_id IS 'ID пользователя из auth.users';
COMMENT ON COLUMN public.user_preferences.preferences IS 'JSON объект с настройками пользователя';
COMMENT ON COLUMN public.user_preferences.created_at IS 'Дата создания записи';
COMMENT ON COLUMN public.user_preferences.updated_at IS 'Дата последнего обновления';

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER trigger_update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- Включаем Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Создаем политику безопасности: пользователи могут видеть только свои настройки
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Политика для вставки: пользователи могут создавать только свои настройки
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика для обновления: пользователи могут обновлять только свои настройки
CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Политика для удаления: пользователи могут удалять только свои настройки
CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Предоставляем права доступа
GRANT ALL ON public.user_preferences TO authenticated;
GRANT USAGE ON SEQUENCE public.user_preferences_id_seq TO authenticated;

-- Примеры структуры данных для preferences JSONB:
-- {
--   "sidebar": {
--     "order": ["dashboard", "sales-forecast", "reports", "products"],
--     "hiddenItems": ["automation", "security"]
--   },
--   "theme": "dark",
--   "language": "ru",
--   "notifications": {
--     "email": true,
--     "push": false
--   }
-- } 