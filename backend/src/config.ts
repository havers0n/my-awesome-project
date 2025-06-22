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

// Database Configuration
export const DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'luckniteshoots',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
};

// JWT Configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

// Other configuration constants
export const APP_NAME = 'LuckNiteShoots';
export const APP_VERSION = '1.0.0';