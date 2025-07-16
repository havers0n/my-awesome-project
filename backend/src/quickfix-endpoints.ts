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

// Inventory products endpoint (mock)
app.get('/api/inventory/products', (req, res) => {
  console.log('Inventory products endpoint called');
  res.json([
    { id: 1, name: 'Product 1', quantity: 10, price: 19.99 },
    { id: 2, name: 'Product 2', quantity: 5, price: 29.99 },
    { id: 3, name: 'Product 3', quantity: 15, price: 9.99 }
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