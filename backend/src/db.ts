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

// Код инициализации удален, так как он мешал запуску сервера.
// Пул соединений будет создаваться автоматически при первом запросе.

// Экспортируем функцию для получения pool
export const getPool = () => pool;
export { pool };