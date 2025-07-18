const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Inventory products endpoint (РЕАЛЬНЫЕ ДАННЫЕ ИЗ БД)
app.get('/api/inventory/products', async (req, res) => {
  console.log('📦 Fetching REAL data from database...');
  
  try {
    // Импорт supabase для подключения к БД
    const { createClient } = require('@supabase/supabase-js');
    
    // Создаем клиент supabase (используем переменные окружения)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration missing');
      return res.status(500).json({ error: 'Database configuration missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Получаем параметры пагинации
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Увеличили лимит по умолчанию
    const offset = (page - 1) * limit;
    
    console.log(`📄 Pagination: page=${page}, limit=${limit}, offset=${offset}`);
    
    // Запрос к реальной таблице products с подсчетом общего количества
    const { data: products, error, count } = await supabase
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
      return res.json([]);
    }
    
    // Получаем реальные остатки из таблицы operations для каждого продукта
    const productIds = products.map(p => p.id);
    
    const { data: stockData, error: stockError } = await supabase
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
    const stockByProduct = {};
    if (stockData) {
      stockData.forEach(stock => {
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
    const formattedProducts = products.map((product) => {
      // Находим все остатки для этого продукта
      const productStocks = Object.values(stockByProduct).filter(stock => 
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
        totalPages: Math.ceil(count / limit),
        hasNext: page * limit < count,
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

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ success: true, message: 'Real data server works', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = 3000; // Изменено с 3001 на 3000 для совместимости с frontend
app.listen(PORT, () => {
  console.log(`✅ Real data server running on port ${PORT}`);
  console.log(`📊 Products endpoint: http://localhost:${PORT}/api/inventory/products`);
}); 