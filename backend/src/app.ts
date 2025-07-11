// src/app.ts
import path from 'path';
import 'dotenv/config';

// --- НАЧАЛО БЛОКА ДЛЯ ЯВНОЙ ЗАГРУЗКИ .ENV И ОТЛАДКИ ---
// Формируем абсолютный путь к .env файлу в корне проекта
const envPath = path.resolve(__dirname, '../.env'); // Если src/app.ts, то .env на один уровень выше
console.log(`Attempting to load .env file from: ${envPath}`);

// Теперь проверяем, что попало в process.env СРАЗУ ПОСЛЕ загрузки
console.log('DB_HOST directly after dotenv.config attempt:', process.env.DB_HOST);
console.log('DB_PORT directly after dotenv.config attempt:', process.env.DB_PORT);
console.log('DB_NAME directly after dotenv.config attempt:', process.env.DB_NAME);
console.log('DB_USER directly after dotenv.env attempt:', process.env.DB_USER);
console.log('DB_PASSWORD exists directly after dotenv.config attempt?:', !!process.env.DB_PASSWORD);
console.log('JWT_SECRET exists directly after dotenv.config attempt?:', !!process.env.JWT_SECRET);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);
// --- КОНЕЦ БЛОКА ДЛЯ ЯВНОЙ ЗАГРУЗКИ .ENV И ОТЛАДКИ ---

// --- Далее ваши обычные импорты ---
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import winston from 'winston';
import authRoutes from './routes/authRoutes';
import monetizationRoutes from './routes/monetizationRoutes';
import forecastRoutes from './routes/forecastRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { authenticateSupabaseToken } from './middleware/supabaseAuthMiddleware';

const app = express();

// Logger setup
const pinoLogger = pino({ level: process.env.LOG_LEVEL || 'info', transport: { target: 'pino-pretty' }, formatters: { level: label => ({ level: label }) }, base: undefined });
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to check request parsing
app.use((req, res, next) => {
  console.log('--- DEBUG MIDDLEWARE ---');
  console.log('Request Method:', req.method);
  console.log('Request Path:', req.path);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  console.log('Body Type:', typeof req.body);
  console.log('Is Body Array:', Array.isArray(req.body));
  console.log('----------------------');
  next();
});

app.use(pinoHttp({ logger: pinoLogger }));
// app.use(morgan('dev')); // Optionally remove morgan for JSON logs only
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
// Test route - MUST BE FIRST to bypass other routes
app.post('/test-forecast', (req, res) => {
  console.log('TEST FORECAST HIT!');
  console.log('Body:', req.body);
  res.json({ 
    success: true, 
    receivedBody: req.body,
    bodyType: typeof req.body,
    isArray: Array.isArray(req.body)
  });
});

app.use('/', healthRoutes); // Health check routes (no auth required)
app.use('/auth', authRoutes);
app.use('/monetization', authenticateSupabaseToken, monetizationRoutes);
app.use('/admin', adminRoutes);

// Temporary test route
app.post('/test-direct', (req, res) => {
  console.log('TEST DIRECT - Body:', req.body);
  console.log('TEST DIRECT - Type:', typeof req.body);
  console.log('TEST DIRECT - Is Array:', Array.isArray(req.body));
  res.json({ received: req.body, type: typeof req.body });
});

// Simple forecast test
app.post('/api/simple-forecast', authenticateSupabaseToken, async (req, res) => {
  try {
    console.log('SIMPLE FORECAST - Body:', req.body);
    const { DaysCount = 7 } = req.body;
    res.json({ success: true, daysCount: DaysCount, message: 'Test endpoint working' });
  } catch (error) {
    res.status(500).json({ error: 'Test failed', details: error });
  }
});

app.use('/api/predictions', authenticateSupabaseToken, forecastRoutes);
app.use('/api', uploadRoutes); // Upload routes

// Error handling middleware (surface 4xx/5xx)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // log error via both loggers
  pinoLogger.error({ err }, 'Error Handler Caught');
  winstonLogger.error('Error Handler Caught', { stack: err.stack, status: err.status, message: err.message });
  const code = err.status || err.statusCode || 500;
  // surface 4xx/5xx JSON error
  res.status(code).json({ error: err.message || 'Something went wrong!', code });
});

// Start server
const PORT = process.env.PORT || 3000; // PORT тоже может быть в .env
console.log('PORT from process.env:', process.env.PORT); // Проверим и его

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;