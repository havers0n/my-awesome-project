-- Функция для отправки задачи в очередь pgmq
CREATE OR REPLACE FUNCTION trigger_sales_input_etl()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pgmq.send('sales_etl_queue', jsonb_build_object('recordId', NEW.id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на вставку в sales_input
DROP TRIGGER IF EXISTS sales_input_after_insert ON public.sales_input;
CREATE TRIGGER sales_input_after_insert
    AFTER INSERT ON public.sales_input
    FOR EACH ROW
    EXECUTE FUNCTION trigger_sales_input_etl();
