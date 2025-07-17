import { Pool } from 'pg';
import { DB_CONFIG } from './config';
// import dns from 'dns';
// import { promisify } from 'util';

// Проверяем наличие DATABASE_URL
const connectionString = process.env.DATABASE_URL;

// Формируем строку подключения для Pooler, используя переменные окружения
// Это позволяет избежать хардкода учетных данных в коде
const POOLER_CONNECTION_STRING = process.env.POOLER_CONNECTION_STRING || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST_POOLER}:${process.env.DB_PORT_POOLER}/${process.env.DB_NAME_POOLER}`;

// Создаем pool с расширенной конфигурацией для Supabase
const pool = new Pool({
  // Приоритет отдается DATABASE_URL, затем POOLER_CONNECTION_STRING
  connectionString: connectionString || POOLER_CONNECTION_STRING,
  // ВАЖНО: Включаем SSL верификацию для безопасности в production
  ssl: { rejectUnauthorized: process.env.NODE_ENV !== 'production' },
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