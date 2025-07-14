import { ForecastApiResponse } from '@/shared/lib/types/forecast';

// Mock API for forecast data
export const fetchForecastData = async (days: number): Promise<ForecastApiResponse> => {
  // Симуляция API запроса
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    days,
    predictions: [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 120 },
      { date: '2024-01-03', value: 90 },
    ],
    accuracy: 85.5,
    confidence: 92.3,
    generatedAt: new Date().toISOString(),
  };
};

export const postForecast = async (): Promise<ForecastApiResponse> => {
  // Симуляция создания прогноза
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    days: 7,
    predictions: [
      { date: '2024-01-01', value: 150 },
      { date: '2024-01-02', value: 160 },
      { date: '2024-01-03', value: 140 },
    ],
    accuracy: 88.2,
    confidence: 94.1,
    generatedAt: new Date().toISOString(),
  };
};

export const fetchForecastHistory = async (
  page: number,
  limit: number,
  search: string,
  category: string
): Promise<{ items: any[]; total: number }> => {
  // Симуляция получения истории прогнозов
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    items: [
      {
        id: '1',
        title: 'Прогноз продаж на неделю',
        createdAt: '2024-01-01T10:00:00Z',
        accuracy: 85.5,
        days: 7,
      },
      {
        id: '2',
        title: 'Прогноз спроса на месяц',
        createdAt: '2024-01-02T14:00:00Z',
        accuracy: 92.3,
        days: 30,
      },
    ],
    total: 2,
  };
};
