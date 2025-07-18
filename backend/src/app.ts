

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from './supabaseClient';

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

// PRODUCTS ENDPOINT: Реальные данные из БД с пагинацией
app.get('/api/inventory/products', async (req, res) => {
  console.log('📦 Fetching REAL data from database...');
  
  try {
    // Получаем параметры пагинации
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // Увеличили лимит по умолчанию
    const offset = (page - 1) * limit;
    
    console.log(`📄 Pagination: page=${page}, limit=${limit}, offset=${offset}`);
    
    // Запрос к реальной таблице products с подсчетом общего количества
    const { data: products, error, count } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        sku,
        price,
        organization_id
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found in database');
      return res.json({
        data: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }
    
    // Получаем реальные остатки из таблицы operations для каждого продукта
    const productIds = products.map(p => p.id);
    
    const { data: stockData, error: stockError } = await supabaseAdmin
      .from('operations')
      .select(`
        product_id,
        location_id,
        stock_on_hand,
        locations (
          id,
          name,
          type
        )
      `)
      .in('product_id', productIds)
      .not('stock_on_hand', 'is', null)
      .order('operation_date', { ascending: false });
    
    if (stockError) {
      console.warn('⚠️ Could not fetch stock data:', stockError.message);
    }
    
    // Группируем остатки по продуктам и локациям (берем последние записи)
    const stockByProduct: any = {};
    if (stockData) {
      stockData.forEach((stock: any) => {
        const productId = stock.product_id;
        const locationId = stock.location_id;
        const key = `${productId}_${locationId}`;
        
        // Берем только первую запись для каждой комбинации продукт-локация (самая свежая)
        if (!stockByProduct[key]) {
          stockByProduct[key] = {
            location_id: locationId,
            location_name: stock.locations?.name || `Локация ${locationId}`,
            location_type: stock.locations?.type || 'unknown',
            stock: stock.stock_on_hand || 0
          };
        }
      });
    }
    
    // Преобразуем в нужный формат для frontend
    const formattedProducts = products.map((product: any) => {
      // Находим все остатки для этого продукта
      const productStocks = Object.values(stockByProduct).filter((stock: any) => 
        Object.keys(stockByProduct).some(key => 
          key.startsWith(`${product.id}_`) && stockByProduct[key] === stock
        )
      );
      
      // Если нет реальных остатков, добавляем заглушку
      if (productStocks.length === 0) {
        productStocks.push({
          location_id: 1,
          location_name: 'Основной склад',
          location_type: 'warehouse',
          stock: 0
        });
      }
      
      return {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku || `SKU-${product.id}`,
        price: product.price || 0,
        organization_id: product.organization_id,
        stock_by_location: productStocks
      };
    });
    
    console.log(`✅ Successfully fetched ${formattedProducts.length} of ${count} REAL products from database`);
    console.log(`📊 Pagination info: page ${page}, showing ${formattedProducts.length} items, total ${count}`);
    
    // Возвращаем данные с метаинформацией для пагинации
    res.json({
      data: formattedProducts,
      pagination: {
        page: page,
        limit: limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products from database', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// ТЕСТОВЫЙ МАРШРУТ: Проверка БД без аутентификации (для отладки)
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('=== Testing database connection (no auth) ===');
    
    // Простой запрос к таблице products
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        sku,
        price,
        organization_id
      `)
      .limit(5);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    // Преобразуем в нужный формат
    const formattedProducts = products?.map((product: any) => ({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku || `SKU-${product.id}`,
      price: product.price || 0,
      stock_by_location: [
        // Временно добавляем моковые остатки, так как для получения реальных остатков нужен сложный JOIN
        { location_id: 1, location_name: 'Основной склад', stock: Math.floor(Math.random() * 50) }
      ]
    })) || [];
    
    console.log(`✅ Found ${formattedProducts.length} products in database:`, formattedProducts.map((p: any) => p.product_name));
    res.json(formattedProducts);
    
  } catch (error) {
    console.error('❌ Route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products from database', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Simple test route directly in app.ts
app.get('/api/test', (req, res) => {
  console.log('=== Direct test route called ===');
  res.json({ success: true, message: 'Direct test route works', timestamp: new Date().toISOString() });
});

// ВРЕМЕННЫЙ ТЕСТОВЫЙ МАРШРУТ: для проверки реальных данных из БД
app.get('/api/inventory/products-direct', async (req, res) => {
  try {
    console.log('=== Testing direct database connection ===');
    
    // Импорт getSupabaseUserClient
    const { getSupabaseUserClient } = require('./supabaseUserClient');
    
    // Создаем временный токен или используем service role (НЕ для продакшена!)
    const supabase = getSupabaseUserClient(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
    
    // Простой запрос к таблице products
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        price,
        organization_id
      `)
      .limit(10);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    // Преобразуем в нужный формат
    const formattedProducts = products?.map((product: any) => ({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku || `SKU-${product.id}`,
      price: product.price || 0,
      stock_by_location: [
        // Временно добавляем моковые остатки, так как для получения реальных остатков нужен сложный JOIN
        { location_id: 1, location_name: 'Основной склад', stock: Math.floor(Math.random() * 50) }
      ]
    })) || [];
    
    console.log(`Found ${formattedProducts.length} products in database`);
    res.json(formattedProducts);
    
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products from database', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
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