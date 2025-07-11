require('dotenv').config();
const { Pool } = require('pg');
const {
  findOrCreateProduct,
  findOrCreateSupplier,
  findOrCreateLocation,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
} = require('./services/etlHelpers');
const {
  getSalesInputById,
  createOperation,
  markSalesInputProcessed
} = require('./services/etlDb');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const QUEUE_NAME = 'sales_etl_queue';

async function processSaleRecord(jobData) {
  const { recordId } = jobData;
  console.info(`[INFO] Начало обработки записи sales_input с ID: ${recordId}`);
  let tx;
  try {
    tx = await beginTransaction();
    const salesInput = await getSalesInputById(recordId, tx);
    if (!salesInput) throw new Error('sales_input not found');
    const [productId, supplierId, locationId] = await Promise.all([
      findOrCreateProduct(salesInput, tx),
      findOrCreateSupplier(salesInput, tx),
      findOrCreateLocation(salesInput, tx)
    ]);
    const operationId = await createOperation({
      organization_id: salesInput.organization_id,
      operation_type: salesInput.type,
      operation_date: salesInput.period,
      product_id: productId,
      supplier_id: supplierId,
      location_id: locationId,
      quantity: salesInput.quantity,
      total_amount: salesInput.sum,
      shelf_price: salesInput.shelf_price,
      stock_on_hand: salesInput.store_remainder,
      delivery_delay_days: salesInput.delivery_delay_days,
      was_out_of_stock: salesInput.product_ran_out,
    }, tx);
    await markSalesInputProcessed(recordId, tx);
    await commitTransaction(tx);
    console.info(`[INFO] sales_input ID: ${recordId} обработан. Создана операция ID: ${operationId}`);
    return true;
  } catch (error) {
    if (tx) await rollbackTransaction(tx);
    console.error(`[ERROR] Ошибка при обработке sales_input ID: ${recordId}. Ошибка: ${error.message}`);
    throw error;
  }
}

async function processMessage(msg) {
  // msg.message — это наш { recordId: ... }
  const jobData = msg.message;
  await processSaleRecord(jobData);
}

async function main() {
  console.log(`PGMQ worker started, listening to queue: ${QUEUE_NAME}`);
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  while (true) {
    const client = await pool.connect();
    try {
      // Читаем одно сообщение из очереди, 30 секунд — время видимости
      const result = await client.query(
        `SELECT msg_id, message FROM pgmq.read($1, 1, 30)`,
        [QUEUE_NAME]
      );

      if (result.rows.length > 0) {
        const msg = result.rows[0];
        console.log(`Received message ${msg.msg_id}`);
        console.log('Message content:', msg.message);
        
        // Упрощенная обработка - просто логируем
        console.log(`Processing message ${msg.msg_id}...`);
        
        // Удаляем сообщение
        await client.query(`DELETE FROM pgmq.queue WHERE msg_id = $1`, [msg.msg_id]);
        console.log(`Message ${msg.msg_id} processed and deleted.`);
      } else {
        // Если сообщений нет, ждем немного
        console.log('No messages in queue, waiting...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('Error in worker loop:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } finally {
      client.release();
    }
  }
}

main();