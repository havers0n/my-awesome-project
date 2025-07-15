import { Express } from 'express';

// Быстрое исправление для недостающих endpoints
export function addQuickFixEndpoints(app: Express) {
  console.log('🔧 Adding quick fix endpoints...');

  // Inventory endpoints
  // app.get('/api/inventory/products', (req, res) => {
  //   console.log('🔍 QUICKFIX: /api/inventory/products called');
  //   res.json({ 
  //     message: 'Products endpoint works (quickfix)',
  //     data: [
  //       { id: 1, name: 'Молоко "Домик в деревне" 1л', code: 'MILK001', price: 89.99 },
  //       { id: 2, name: 'Хлеб "Бородинский" 500г', code: 'BREAD001', price: 45.50 },
  //       { id: 3, name: 'Масло сливочное 200г', code: 'BUTTER001', price: 159.99 },
  //       { id: 4, name: 'Сыр "Российский" 1кг', code: 'CHEESE001', price: 699.99 },
  //       { id: 5, name: 'Яйца куриные 10шт', code: 'EGGS001', price: 119.99 }
  //     ],
  //     timestamp: new Date()
  //   });
  // });

  app.get('/api/inventory/test', (req, res) => {
    console.log('🔍 QUICKFIX: /api/inventory/test called');
    res.json({ route: 'inventory', status: 'quickfix working' });
  });

  // Forecast endpoints
  // app.get('/api/forecast/metrics', (req, res) => {
  //   console.log('🔍 QUICKFIX: /api/forecast/metrics called');
  //   res.json({ 
  //     message: 'Forecast metrics endpoint works (quickfix)',
  //     data: {
  //       overallMAPE: 15.5,
  //       overallMAE: 0.8,
  //       totalForecasts: 42,
  //       lastUpdated: new Date(),
  //       activeProducts: 5,
  //       avgAccuracy: 84.5
  //     },
  //     timestamp: new Date()
  //   });
  // });

  // ML endpoints
  app.get('/api/ml/test', (req, res) => {
    console.log('🔍 QUICKFIX: /api/ml/test called');
    res.json({ route: 'ml', status: 'quickfix working' });
  });

  console.log('✅ Quick fix endpoints added successfully');
} 