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
    
    // Запрос к реальной таблице products
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
      console.error('❌ Database error:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found in database');
      return res.json([]);
    }
    
    // Преобразуем в нужный формат для frontend
    const formattedProducts = products.map((product, index) => ({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku || `SKU-${product.id}`,
      price: product.price || 0,
      stock_by_location: [
        // Временно добавляем случайные остатки
        { 
          location_id: 1, 
          location_name: 'Основной склад', 
          stock: Math.floor(Math.random() * 50) + (index % 3 === 0 ? 0 : 1) // иногда 0 для демо
        }
      ]
    }));
    
    console.log(`✅ Successfully fetched ${formattedProducts.length} REAL products from database:`);
    formattedProducts.forEach(p => console.log(`  - ${p.product_name} (ID: ${p.product_id})`));
    
    res.json(formattedProducts);
    
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