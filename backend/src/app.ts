

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';

const envPath = path.resolve(process.cwd(), '.env');
console.log('[DEBUG] process.cwd():', process.cwd());
console.log('[DEBUG] .env exists:', fs.existsSync(envPath));
console.log('[DEBUG] envPath:', envPath);
console.log('[DEBUG] SUPABASE_JWT_SECRET:', process.env.SUPABASE_JWT_SECRET)// import xss from 'xss-clean';

// Безопасная конфигурация CORS
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5174,http://localhost:5173,http://158.160.190.103:5174').split(',');

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Разрешаем запросы без origin, например, от мобильных приложений или curl
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-supabase-auth'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: ['Content-Length', 'Authorization'],
};

const app = express();

// Apply CORS middleware
app.use(cors(corsOptions));


app.use(express.json());

// Добавляем middleware для защиты от XSS-атак
// Этот пакет очищает пользовательский ввод в req.body, req.query и req.params
// app.use(xss());

// Enhanced request logger for debugging API endpoints
app.use((req, res, next) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  console.log(`[${requestId}] === REQUEST === ${req.method} ${req.path}`);
  console.log(`[${requestId}] Headers: ${JSON.stringify(req.headers)}`);
  
  // Only log body for non-GET requests and if it exists
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    console.log(`[${requestId}] Body: ${JSON.stringify(req.body)}`);
  }
  
  // Log query parameters if they exist
  if (Object.keys(req.query).length > 0) {
    console.log(`[${requestId}] Query params: ${JSON.stringify(req.query)}`);
  }

  // Add response logging
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`[${requestId}] === RESPONSE === Status: ${res.statusCode}`);
    // Don't log large response bodies to avoid console clutter
    if (body && typeof body === 'string' && body.length < 1000) {
      try {
        const parsedBody = JSON.parse(body);
        console.log(`[${requestId}] Response body: ${JSON.stringify(parsedBody, null, 2)}`);
      } catch (e) {
        // If not JSON, don't log the body
        console.log(`[${requestId}] Response sent (non-JSON or too large to display)`);
      }
    } else {
      console.log(`[${requestId}] Response sent (too large to display)`);
    }
    return originalSend.call(this, body);
  };
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple test route directly in app.ts
app.get('/api/test', (req, res) => {
  console.log('=== Direct test route called ===');
  res.json({ success: true, message: 'Direct test route works', timestamp: new Date().toISOString() });
});

// Import all route files
import authRoutes from './routes/authRoutes';
import healthRoutes from './routes/healthRoutes';
import monetizationRoutes from './routes/monetizationRoutes';
import forecastRoutes from './routes/forecastRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import userPreferencesRoutes from './routes/userPreferencesRoutes';
import userRoutes from './routes/userRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import organizationRoutes from './routes/organizationRoutes';
import mlRoutes from './routes/mlRoutes';

// Mount all routes with explicit paths
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/preferences', userPreferencesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/ml', mlRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Простой обработчик ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("--- ОШИБКА ---", err);
    res.status(500).json({ error: 'Что-то пошло не так!', details: err.message });
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://158.160.190.103:5174");
  next();
});

// Запуск сервера
const PORT = process.env.PORT || 3000;//Changed to 3001 to avoid conflicts
const server = app.listen(PORT, () => {
  console.log(`[SERVER START] 🚀 Сервер успешно запущен и слушает порт ${PORT}`);
  console.log(`[SERVER START] Время запуска: ${new Date().toISOString()}`);
});

server.on('error', (error) => {
  console.error('[SERVER ERROR] ❌ Не удалось запустить сервер:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

console.log('[APP END] Скрипт app.ts завершил свое выполнение.');

export default app;