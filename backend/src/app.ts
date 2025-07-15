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
import userPreferencesRoutes from './routes/userPreferencesRoutes';
import userRoutes from './routes/userRoutes'; // Import user routes
import inventoryRoutes from './routes/inventoryRoutes'; // Импортируем новые роуты
import organizationRoutes from './routes/organizationRoutes'; // Импорт роутов организаций
import mlRoutes from './routes/mlRoutes'; // Импорт ML роутов
import { authenticateSupabaseToken } from './middleware/supabaseAuthMiddleware';
import { handleZodError, handleSupabaseError } from './controllers/organizationController'; // Импорт обработчиков ошибок
import { addQuickFixEndpoints } from './quickfix-endpoints'; // Импорт быстрого исправления

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

// Test JSON endpoint
app.post('/test-json', (req, res) => {
  res.json({ received: true });
});

// Test error endpoint
app.get('/test-error', (req, res) => {
  throw new Error('Test error');
});

// Test routes for each module
app.get('/api/auth/test', (_req: express.Request, res: express.Response) => {
  res.json({ route: 'auth' });
});
app.get('/api/forecast/test', (_req: express.Request, res: express.Response) => {
  res.json({ route: 'forecast' });
});
app.get('/api/health/test', (_req: express.Request, res: express.Response) => {
  res.json({ route: 'health' });
});
app.get('/api/admin/test', (_req: express.Request, res: express.Response) => {
  res.json({ route: 'admin' });
});
app.get('/api/upload/test', (_req: express.Request, res: express.Response) => {
  res.json({ route: 'upload' });
});
app.get('/api/monetization/test', (_req: express.Request, res: express.Response) => {
  res.json({ route: 'monetization' });
});

// Добавляем недостающие test endpoints
app.get('/api/inventory/test', (_req: express.Request, res: express.Response) => {
  res.json({ route: 'inventory' });
});

app.get('/api/ml/test', (_req: express.Request, res: express.Response) => {
  res.json({ route: 'ml' });
});

// Добавляем прямые endpoints для исправления 404
// app.get('/api/inventory/products', (_req: express.Request, res: express.Response) => {
//   res.json({ 
//     message: 'Products endpoint works (direct)',
//     data: [
//       { id: 1, name: 'Тестовый товар 1', code: 'TEST001' },
//       { id: 2, name: 'Тестовый товар 2', code: 'TEST002' }
//     ],
//     timestamp: new Date()
//   });
// });

// app.get('/api/forecast/metrics', (_req: express.Request, res: express.Response) => {
//   res.json({ 
//     message: 'Forecast metrics endpoint works (direct)',
//     data: {
//       overallMAPE: 15.5,
//       overallMAE: 0.8,
//       totalForecasts: 42,
//       lastUpdated: new Date()
//     },
//     timestamp: new Date()
//   });
// });

// Main routes
app.use('/api/health', healthRoutes); // Health check routes (no auth required)
app.use('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/user-preferences', userPreferencesRoutes);
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/inventory', inventoryRoutes); // Регистрируем новые роуты
app.use('/api/organizations', organizationRoutes); // Регистрация роутов организаций
app.use('/api/ml', mlRoutes); // Регистрация ML роутов

// Test endpoints для проверки routing
app.get('/api/inventory/test', (req, res) => {
  console.log('🔍 TEST: /api/inventory/test endpoint reached');
  res.json({ message: 'Inventory test endpoint works', timestamp: new Date() });
});

app.get('/api/forecast/test', (req, res) => {
  console.log('🔍 TEST: /api/forecast/test endpoint reached');
  res.json({ message: 'Forecast test endpoint works', timestamp: new Date() });
});

// Direct endpoints для исправления 404
// app.get('/api/inventory/products', (req, res) => {
//   console.log('🔍 DIRECT: /api/inventory/products endpoint reached');
//   res.json({ 
//     message: 'Products endpoint works (direct)',
//     data: [],
//     timestamp: new Date()
//   });
// });

// Временный endpoint для metrics без аутентификации
// app.get('/api/forecast/metrics', (req, res) => {
//   console.log('🔍 DIRECT: /api/forecast/metrics endpoint reached');
//   res.json({ 
//     message: 'Forecast metrics endpoint works (direct)',
//     data: {
//       overallMAPE: 15.5,
//       overallMAE: 0.8,
//       totalForecasts: 42,
//       lastUpdated: new Date()
//     },
//     timestamp: new Date()
//   });
// });

// Temporary test route
app.post('/test-direct', (req, res) => {
  console.log('TEST DIRECT - Body:', req.body);
  console.log('TEST DIRECT - Type:', typeof req.body);
  console.log('TEST DIRECT - Is Array:', Array.isArray(req.body));
  res.json({ received: req.body, type: typeof req.body });
});

// Simple ML test route
app.post('/api/simple-ml-test', async (req, res) => {
  try {
    console.log('SIMPLE ML TEST - Body:', req.body);
    res.json({ success: true, message: 'Simple ML test endpoint working', body: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Simple ML test failed', details: error });
  }
});

// Test route without /api/ prefix
app.post('/real-ml-predict', async (req, res) => {
  try {
    console.log('=== REAL ML PREDICT called (no /api/) ===');
    console.log('Request body:', req.body);
    
    const { DaysCount = 7 } = req.body;
    
    // Создаем тестовые данные для отправки в ML микросервис
    const mlRequestData = {
      DaysCount: DaysCount,
      events: [
        {
          Type: "Sale",
          Period: "2025-07-11",
          ItemName: "Test Item",
          Code: "TEST001",
          Quantity: 10,
          Price: 100.0
        }
      ]
    };
    
    console.log('Sending to ML service:', JSON.stringify(mlRequestData, null, 2));
    
    // Отправляем запрос к реальному ML микросервису
    const axios = require('axios');
    const ML_SERVICE_URL = 'http://localhost:8000/predict';
    
    const mlResponse = await axios.post(ML_SERVICE_URL, mlRequestData, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('ML service response:', JSON.stringify(mlResponse.data, null, 2));
    
    // Возвращаем ответ от ML сервиса
    res.json({
      success: true,
      ml_response: mlResponse.data,
      request_data: mlRequestData
    });
    
  } catch (error) {
    console.error('Real ML predict error:', error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      error: 'Real ML prediction failed', 
      details: message,
      ml_service_url: 'http://localhost:8000/predict'
    });
  }
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

// Тестовый маршрут для прогнозов без аутентификации
app.get('/api/test-forecast-no-auth', async (req, res) => {
  try {
    console.log('TEST FORECAST NO AUTH - Query:', req.query);
    res.json({
      trend: {
        points: [
          { date: '2024-05-01', value: 120 },
          { date: '2024-05-02', value: 123 },
          { date: '2024-05-03', value: 130 }
        ]
      },
      topProducts: [
        { name: 'Молоко', amount: 140, colorClass: 'bg-green-500', barWidth: '80%' },
        { name: 'Хлеб', amount: 90, colorClass: 'bg-yellow-500', barWidth: '60%' },
        { name: 'Яблоки', amount: 60, colorClass: 'bg-red-500', barWidth: '40%' }
      ],
      history: {
        items: [
          { date: '2024-05-01 - 2024-05-07', product: 'Молоко', category: 'Общая', forecast: 140, accuracy: 'Высокая' },
          { date: '2024-05-01 - 2024-05-07', product: 'Хлеб', category: 'Общая', forecast: 90, accuracy: 'Средняя' },
          { date: '2024-05-01 - 2024-05-07', product: 'Яблоки', category: 'Общая', forecast: 60, accuracy: 'Высокая' }
        ],
        total: 3
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Test failed', details: error });
  }
});

app.use('/api/predictions', authenticateSupabaseToken, forecastRoutes);

// Временные маршруты без аутентификации для тестирования интеграции
app.get('/api/test-predictions/forecast', async (req, res) => {
  try {
    res.json({
      trend: {
        points: [
          { date: '2025-07-01', value: 120 },
          { date: '2025-07-02', value: 135 },
          { date: '2025-07-03', value: 142 },
          { date: '2025-07-04', value: 138 },
          { date: '2025-07-05', value: 155 }
        ]
      },
      topProducts: [
        { name: 'Тестовый товар 1', amount: 45, colorClass: 'bg-green-500', barWidth: '90%' },
        { name: 'Тестовый товар 2', amount: 32, colorClass: 'bg-yellow-500', barWidth: '65%' },
        { name: 'Тестовый товар 3', amount: 28, colorClass: 'bg-red-500', barWidth: '55%' }
      ],
      history: {
        items: [
          { date: '2025-07-01 - 2025-07-07', product: 'Тестовый товар 1', category: 'Общая', forecast: 45, accuracy: 'Высокая' },
          { date: '2025-07-01 - 2025-07-07', product: 'Тестовый товар 2', category: 'Общая', forecast: 32, accuracy: 'Средняя' }
        ],
        total: 2
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Test forecast failed', details: error });
  }
});

app.get('/api/test-predictions/history', async (req, res) => {
  try {
    res.json({
      items: [
        { date: '2025-07-01 - 2025-07-07', product: 'Тестовый товар 1', category: 'Общая', forecast: 45, accuracy: 'Высокая' },
        { date: '2025-07-02 - 2025-07-08', product: 'Тестовый товар 2', category: 'Общая', forecast: 32, accuracy: 'Средняя' },
        { date: '2025-07-03 - 2025-07-09', product: 'Тестовый товар 3', category: 'Общая', forecast: 28, accuracy: 'Высокая' }
      ],
      total: 3
    });
  } catch (error) {
    res.status(500).json({ error: 'Test history failed', details: error });
  }
});

app.post('/api/test-predictions/predict', async (req, res) => {
  try {
    console.log('TEST PREDICT - Body:', req.body);
    const { DaysCount = 7 } = req.body;
    
    // Try to call the real ML service
    try {
      const axios = require('axios');
      
      // Создаем тестовые данные для отправки в ML микросервис
      const mlRequestData = {
        DaysCount: DaysCount,
        events: [
          {
            Период: "2025-07-11",
            Номенклатура: "Test Item"
          }
        ]
      };
      
      console.log('Calling real ML service:', JSON.stringify(mlRequestData, null, 2));
      
      const ML_SERVICE_URL = 'http://localhost:8000/predict';
      const mlResponse = await axios.post(ML_SERVICE_URL, mlRequestData, {
        timeout: 30000,
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        }
      });
      
      console.log('ML service response:', JSON.stringify(mlResponse.data, null, 2));
      
      // Возвращаем ответ от ML сервиса
      res.json({
        success: true,
        source: 'real_ml_service',
        ml_response: mlResponse.data,
        request_data: mlRequestData
      });
      
    } catch (mlError) {
      console.error('ML service error, falling back to mock:', mlError);
      
      // Fallback to mock data if ML service fails
      res.json([
        {
          MAPE: 12.5,
          MAE: 0.8,
          DaysPredict: DaysCount,
          source: 'mock_fallback',
          ml_error: mlError instanceof Error ? mlError.message : String(mlError)
        },
        {
          Период: `2025-07-11 - 2025-07-${11 + DaysCount - 1}`,
          Номенклатура: 'Тестовый товар',
          Код: 'TEST001',
          MAPE: '12.5%',
          MAE: 0.8,
          Количество: DaysCount * 5,
          source: 'mock_fallback'
        }
      ]);
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Test predict failed', details: error });
  }
});

// Real ML prediction endpoint that the frontend is calling
app.post('/api/real-ml-predict', async (req, res) => {
  try {
    console.log('REAL ML PREDICT - Body:', req.body);
    const { DaysCount = 7 } = req.body;
    
    const axios = require('axios');
    
    // Создаем данные для отправки в ML микросервис
    const mlRequestData = {
      DaysCount: DaysCount,
      events: [
        {
          Период: "2025-07-11",
          Номенклатура: "Test Item"
        }
      ]
    };
    
    console.log('Calling ML service:', JSON.stringify(mlRequestData, null, 2));
    
    const ML_SERVICE_URL = 'http://localhost:8000/predict';
    const mlResponse = await axios.post(ML_SERVICE_URL, mlRequestData, {
      timeout: 30000,
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
      }
    });
    
    console.log('ML service response:', JSON.stringify(mlResponse.data, null, 2));
    
    // Возвращаем ответ от ML сервиса
    res.json({
      success: true,
      source: 'real_ml_service',
      ml_response: mlResponse.data,
      request_data: mlRequestData
    });
    
  } catch (error) {
    console.error('Real ML predict error:', error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      error: 'Real ML prediction failed', 
      details: message,
      ml_service_url: 'http://localhost:8000/predict'
    });
  }
});

app.use('/api/upload', uploadRoutes); // Upload routes

// Static file serving
app.use(express.static('public'));

// Error Handling Middleware
// These should be added after all routes
// TODO: Fix TypeScript errors for these handlers
// app.use(handleZodError);
// app.use(handleSupabaseError);

// Добавляем quickfix endpoints для исправления 404 
addQuickFixEndpoints(app);

// ПОСЛЕДНИЙ ШАНС - добавляем endpoints напрямую перед обработчиком ошибок
console.log('🚨 Adding LAST RESORT endpoints...');

app.get('/api/inventory/products', (req, res) => {
  console.log('🔍 LAST RESORT: /api/inventory/products called');
  res.json({ 
    message: 'Products endpoint works (last resort)',
    data: [
      { id: 1, name: 'Молоко "Домик в деревне" 1л', code: 'MILK001', price: 89.99 },
      { id: 2, name: 'Хлеб "Бородинский" 500г', code: 'BREAD001', price: 45.50 },
      { id: 3, name: 'Масло сливочное 200г', code: 'BUTTER001', price: 159.99 }
    ],
    timestamp: new Date()
  });
});

app.get('/api/forecast/metrics', (req, res) => {
  console.log('🔍 LAST RESORT: /api/forecast/metrics called');
  res.json({ 
    message: 'Forecast metrics endpoint works (last resort)',
    data: {
      overallMAPE: 15.5,
      overallMAE: 0.8,
      totalForecasts: 42,
      lastUpdated: new Date()
    },
    timestamp: new Date()
  });
});

app.get('/api/inventory/test', (req, res) => {
  console.log('🔍 LAST RESORT: /api/inventory/test called');
  res.json({ route: 'inventory', status: 'last resort working' });
});

app.get('/api/ml/test', (req, res) => {
  console.log('🔍 LAST RESORT: /api/ml/test called');
  res.json({ route: 'ml', status: 'last resort working' });
});

console.log('✅ LAST RESORT endpoints added successfully');

// Generic error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start server
const PORT = process.env.PORT || 3000; // PORT тоже может быть в .env
console.log('PORT from process.env:', process.env.PORT); // Проверим и его

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;