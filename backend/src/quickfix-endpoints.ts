import express from 'express';
import cors from 'cors';

// Create a simple Express app
const app = express();
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ success: true, message: 'Test endpoint works', timestamp: new Date().toISOString() });
});

// Inventory test endpoint
app.get('/api/inventory/test', (req, res) => {
  console.log('Inventory test endpoint called');
  res.json({ 
    success: true, 
    message: 'Inventory test endpoint works', 
    timestamp: new Date().toISOString() 
  });
});

// Inventory products endpoint (mock) - ИСПРАВЛЕНО: правильная структура данных
app.get('/api/inventory/products', (req, res) => {
  console.log('Inventory products endpoint called');
  res.json([
    {
      product_id: 1,
      product_name: 'Колбаса докторская',
      price: 450.00,
      sku: 'KOL001',
      stock_by_location: [
        { location_id: 1, location_name: 'Центральный склад', stock: 36 },
        { location_id: 2, location_name: 'Магазин на Ленина', stock: 12 }
      ]
    },
    {
      product_id: 2,
      product_name: 'Сыр российский',
      price: 380.00,
      sku: 'SYR001',
      stock_by_location: [
        { location_id: 1, location_name: 'Центральный склад', stock: 7 }
      ]
    },
    {
      product_id: 3,
      product_name: 'Молоко 3.2%',
      price: 65.00,
      sku: 'MOL001',
      stock_by_location: [
        { location_id: 1, location_name: 'Центральный склад', stock: 0 }
      ]
    },
    {
      product_id: 4,
      product_name: 'Хлеб белый',
      price: 45.00,
      sku: 'HLB001',
      stock_by_location: [
        { location_id: 1, location_name: 'Центральный склад', stock: 33 }
      ]
    },
    {
      product_id: 5,
      product_name: 'Масло сливочное',
      price: 280.00,
      sku: 'MAS001',
      stock_by_location: [
        { location_id: 1, location_name: 'Центральный склад', stock: 14 }
      ]
    }
  ]);
});

// Forecast metrics endpoint (mock)
app.get('/api/forecast/metrics', (req, res) => {
  console.log('Forecast metrics endpoint called');
  res.json({
    totalPredictions: 25,
    averageAccuracy: 85.7,
    lastUpdated: new Date().toISOString(),
    avgMAPE: 14.3,
    avgMAE: 5.2,
    accuracyTrend: 'improving',
    predictionCount: 25
  });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Quick fix server running on port ${PORT}`);
});