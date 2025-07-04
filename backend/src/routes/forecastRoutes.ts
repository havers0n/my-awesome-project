import express from 'express';
const router = express.Router();

// Тестовые данные для фронта
const mockForecast = {
  trend: {
    points: [
      { date: '2025-07-01', value: 120 },
      { date: '2025-07-02', value: 135 },
      { date: '2025-07-03', value: 150 }
    ]
  },
  topProducts: [
    { name: 'Хлеб', amount: 50, colorClass: 'bg-green-500', barWidth: '80%' },
    { name: 'Булочка', amount: 30, colorClass: 'bg-yellow-500', barWidth: '60%' },
    { name: 'Круассан', amount: 20, colorClass: 'bg-red-500', barWidth: '40%' }
  ],
  history: {
    items: [
      { date: '2025-07-01', product: 'Хлеб', category: 'Хлеб', forecast: 120, accuracy: 'Высокая' },
      { date: '2025-07-02', product: 'Булочка', category: 'Выпечка', forecast: 135, accuracy: 'Средняя' },
      { date: '2025-07-03', product: 'Круассан', category: 'Десерты', forecast: 150, accuracy: 'Низкая' }
    ],
    total: 3
  }
};

// GET /api/predictions/forecast
router.get('/api/predictions/forecast', (req, res) => {
  res.json(mockForecast);
});

// POST /api/predictions/forecast
router.post('/api/predictions/forecast', (req, res) => {
  res.json(mockForecast);
});

// GET /api/predictions/history
router.get('/api/predictions/history', (req, res) => {
  res.json({ items: mockForecast.history.items, total: mockForecast.history.total });
});

export default router;
