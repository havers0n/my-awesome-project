// src/config.ts

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// --- ОТЛАДОЧНЫЕ CONSOLE.LOG ---
console.log('--- Reading .env variables for DB_CONFIG ---');
console.log('Attempting to read DB_HOST from process.env:', process.env.DB_HOST);
console.log('Attempting to read DB_PORT from process.env:', process.env.DB_PORT);
console.log('Attempting to read DB_NAME from process.env:', process.env.DB_NAME);
console.log('Attempting to read DB_USER from process.env:', process.env.DB_USER);
console.log('Attempting to read DB_PASSWORD from process.env (exists?):', !!process.env.DB_PASSWORD);
console.log('-------------------------------------------');
// --- КОНЕЦ ОТЛАДОЧНЫХ CONSOLE.LOG ---

// Функция для получения обязательных переменных окружения
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[FATAL] Missing required environment variable: ${key}`);
  }
  return value;
};

// Безопасная конфигурация БД: требует наличия переменных окружения
export const DB_CONFIG = {
  user: getRequiredEnv('DB_USER'),
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'luckniteshoots',
  password: getRequiredEnv('DB_PASSWORD'),
  port: parseInt(process.env.DB_PORT || '5432'),
  family: 4, // Force IPv4 to avoid ENETUNREACH errors
};

// Безопасная конфигурация JWT: требует наличия секрета
export const JWT_CONFIG = {
  secret: getRequiredEnv('JWT_SECRET'),
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

// Other configuration constants
export const APP_NAME = 'LuckNiteShoots';
export const APP_VERSION = '1.0.0';