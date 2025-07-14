// API functions for sales forecast
export interface ForecastData {
  trend?: {
    points: Array<{ x: number; y: number; date: string }>;
  };
  topProducts?: Array<{ name: string; amount: number }>;
  qualityMetrics?: {
    mape?: number;
    mae?: number;
    confidence?: number;
    rmse?: number;
    r2?: number;
    dataQuality?: string;
    recommendations?: string[];
  };
}

export const fetchForecastData = async (): Promise<ForecastData> => {
  // This would typically make an HTTP request to your backend
  // For now, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        trend: {
          points: [
            { x: 1, y: 100, date: '2023-01-01' },
            { x: 2, y: 120, date: '2023-01-02' },
            { x: 3, y: 110, date: '2023-01-03' },
          ]
        },
        topProducts: [
          { name: 'Товар 1', amount: 150 },
          { name: 'Товар 2', amount: 120 },
          { name: 'Товар 3', amount: 100 },
        ],
        qualityMetrics: {
          mape: 5.2,
          mae: 12.5,
          confidence: 85,
          rmse: 15.3,
          r2: 0.87,
          dataQuality: 'Хорошее',
          recommendations: [
            'Увеличить количество данных',
            'Проверить сезонность'
          ]
        }
      });
    }, 1000);
  });
};
