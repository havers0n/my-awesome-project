

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

// Безопасная конфигурация CORS
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5174,http://localhost:5173').split(',');

const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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

// Helmet для базовых заголовков безопасности
app.use(helmet());

// Ограничение скорости запросов для предотвращения брутфорс-атак
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Ограничение каждого IP до 100 запросов за 15 минут
  message: 'Слишком много запросов с этого IP, пожалуйста, попробуйте снова через 15 минут',
});
app.use(limiter);


app.use(express.json());

// Enhanced request logger for debugging API endpoints
if (!isProduction) {
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
}

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
  console.error("--- ERROR ---", err); // Always log the full error

  if (isProduction) {
    // In production, send a generic message
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    // In development, send detailed error
    res.status(500).json({ error: 'Something went wrong!', details: err.message, stack: err.stack });
  }
});

// Start server
const PORT = process.env.PORT || 3000;//Changed to 3001 to avoid conflicts
if (isProduction) {
  // In a production environment, we expect the server to be run via a process manager (like PM2)
  // that handles clustering and restarts.
  app.listen(PORT, () => {
    console.log(`[SERVER START] 🚀 Server successfully started and listening on port ${PORT}`);
    console.log(`[SERVER START] Start time: ${new Date().toISOString()}`);
  });
} else {
  // In a development environment, we can simply listen on the port.
  app.listen(PORT, () => {
    console.log(`[SERVER START] 🚀 Server successfully started and listening on port ${PORT}`);
    console.log(`[SERVER START] Start time: ${new Date().toISOString()}`);
  }).on('error', (error) => {
    console.error('[SERVER ERROR] ❌ Failed to start server:', error);
    process.exit(1);
  });
}

console.log('[APP END] app.ts script has finished execution.');

export default app;