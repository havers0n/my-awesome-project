-- Создание простой имитации PGMQ
CREATE SCHEMA IF NOT EXISTS pgmq;

CREATE TABLE IF NOT EXISTS pgmq.queue (
    msg_id SERIAL PRIMARY KEY,
    queue_name VARCHAR(255) NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visible_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_ct INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_queue_visible ON pgmq.queue (queue_name, visible_at) WHERE visible_at <= CURRENT_TIMESTAMP;

-- Функция для чтения сообщений
CREATE OR REPLACE FUNCTION pgmq.read(queue_name_param VARCHAR, batch_size INTEGER, visibility_timeout INTEGER)
RETURNS TABLE(msg_id INTEGER, message JSONB) AS $$
BEGIN
    RETURN QUERY 
    SELECT q.msg_id, q.message
    FROM pgmq.queue q
    WHERE q.queue_name = queue_name_param
      AND q.visible_at <= CURRENT_TIMESTAMP
    ORDER BY q.created_at
    LIMIT batch_size;
    
    -- Обновляем время видимости
    UPDATE pgmq.queue
    SET visible_at = CURRENT_TIMESTAMP + (visibility_timeout || ' seconds')::INTERVAL,
        read_ct = read_ct + 1
    WHERE queue_name = queue_name_param
      AND visible_at <= CURRENT_TIMESTAMP
      AND msg_id IN (
          SELECT q.msg_id
          FROM pgmq.queue q
          WHERE q.queue_name = queue_name_param
            AND q.visible_at <= CURRENT_TIMESTAMP
          ORDER BY q.created_at
          LIMIT batch_size
      );
END;
$$ LANGUAGE plpgsql;

-- Функция для отправки сообщений
CREATE OR REPLACE FUNCTION pgmq.send(queue_name_param VARCHAR, message_param JSONB)
RETURNS INTEGER AS $$
DECLARE
    new_msg_id INTEGER;
BEGIN
    INSERT INTO pgmq.queue (queue_name, message)
    VALUES (queue_name_param, message_param)
    RETURNING msg_id INTO new_msg_id;
    
    RETURN new_msg_id;
END;
$$ LANGUAGE plpgsql;
