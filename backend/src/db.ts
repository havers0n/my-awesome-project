import { Pool } from 'pg';
import { DB_CONFIG } from './config';
// import dns from 'dns';
// import { promisify } from 'util';

// Проверяем наличие DATABASE_URL
const connectionString = process.env.DATABASE_URL;

// ВРЕМЕННОЕ РЕШЕНИЕ: используем Transaction pooler connection string
// Этот адрес всегда использует IPv4 и решает проблему с IPv6
const POOLER_CONNECTION_STRING = `postgresql://postgres.uxcsziylmyogvcqyyuiw:${process.env.DB_PASSWORD}@aws-0-eu-north-1.pooler.supabase.com:5432/postgres`;

// Создаем pool с расширенной конфигурацией для Supabase
const pool = new Pool({
  connectionString: connectionString || POOLER_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  keepAlive: true,
  // Важно: держим минимум 1 соединение активным
  min: 1,
  max: 10,
  idleTimeoutMillis: 30000,
  // Отключаем автоматическое завершение при отсутствии клиентов
  allowExitOnIdle: false,
});

// Test the connection with retry logic
const connectWithRetry = async (retries = 3) => {
  console.log('Attempting to connect to database...');
  console.log('Using Supabase Transaction Pooler (IPv4 compatible)');
  
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('Connected to the database successfully via Transaction Pooler!');
      
      // Проверяем версию PostgreSQL
      const result = await client.query('SELECT version()');
      console.log('PostgreSQL version:', result.rows[0].version);
      
      client.release();
      console.log('Database connection test completed, client released');
      return;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err);
      if (i === retries - 1) {
        console.error('Error connecting to the database after all retries:', err);
        console.log('Server will continue to run, but database operations will fail');
      } else {
        console.log(`Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
};

// Добавляем обработчики событий pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('New client connected to pool');
});

pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

// Инициализируем подключение
console.log('Starting database connection initialization...');
connectWithRetry()
  .then(() => {
    console.log('Database initialization completed');
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
  });

// Экспортируем функцию для получения pool
export const getPool = () => pool;
export { pool }; 