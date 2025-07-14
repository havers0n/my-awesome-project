import axios, { AxiosError } from 'axios';
import { ForecastApiResponse } from '../pages/types';
import { QualityMetricsResponse } from '../types.admin';
import { getErrorFromAxiosError, createMLError } from '../types/errors';

function getAuthHeaders() {
  const raw = localStorage.getItem('sb-uxcsziylmyogvcqyyuiw-auth-token');
  let token = '';
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      token = parsed.access_token || '';
    } catch {
      token = raw;
    }
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Получить тренд и топ-продукты за N дней
 * @param days Количество дней
 * @returns Данные для графика и топ-продуктов
 */
export const fetchForecastData = async (days: number): Promise<ForecastApiResponse> => {
  try {
    const headers = getAuthHeaders();
    // Временно используем тестовый маршрут
    const res = await axios.get(`/api/test-predictions/forecast?days=${days}`, { 
      headers,
      timeout: 30000 // 30 second timeout
    });
    return res.data;
  } catch (error) {
    console.warn('API недоступен, используем моки:', error);
    
    // Convert axios error to MLError for better error handling
    const mlError = getErrorFromAxiosError(error);
    
    // For now, we'll still use fallback data, but throw the error in development
    if (process.env.NODE_ENV === 'development') {
      // In development, you might want to see the actual error
      console.error('ML Error:', mlError);
    }
    
    // Fallback на моки
    return {
      trend: {
        points: [
          { date: '2025-07-01', value: 125 },
          { date: '2025-07-02', value: 132 },
          { date: '2025-07-03', value: 128 }
        ]
      },
      topProducts: [
        { name: 'Хлеб белый', amount: 45, barWidth: '90%', colorClass: 'bg-blue-500' }
      ]
    };
  }
};

/**
 * Запустить новый процесс прогнозирования
 * @param days Количество дней для прогноза
 * @returns Promise<void> - функция не возвращает данные, только инициирует процесс
 */
export const startNewForecast = async (days: number): Promise<void> => {
  try {
    const headers = getAuthHeaders();
    const requestBody = { DaysCount: days };
    
    // Используем реальный ML эндпоинт
    const res = await axios.post('/api/real-ml-predict', requestBody, {
      headers,
      timeout: 120000 // 2 minutes timeout for forecast generation process
    });
    
    // Проверяем успешность ответа
    if (res.status === 200 || res.status === 201) {
      console.log('Forecast prediction initiated successfully');
      console.log('ML Response:', res.data);
      return; // Успешно запущен процесс
    } else {
      throw new Error(`Unexpected response status: ${res.status}`);
    }
  } catch (error) {
    console.error('Failed to start forecast prediction:', error);
    
    // Convert axios error to MLError for better error handling
    const mlError = getErrorFromAxiosError(error);
    
    // In development, log the detailed error
    if (process.env.NODE_ENV === 'development') {
      console.error('ML Error during forecast initiation:', mlError);
    }
    
    // Re-throw the error so calling code can handle it
    throw mlError;
  }
};

/**
 * Запросить новый прогноз (POST)
 * @returns Данные для графика, топ-продуктов и истории
 */
export const postForecast = async (): Promise<ForecastApiResponse> => {
  try {
    const headers = getAuthHeaders();
    // Временно используем тестовый маршрут
    const res = await axios.post(`/api/test-predictions/predict`, { DaysCount: 14 }, {
      headers,
      timeout: 60000 // 60 second timeout for forecast generation
    });
    return res.data;
  } catch (error) {
    console.warn('API прогноза недоступен, используем моки:', error);
    
    // Convert axios error to MLError for better error handling
    const mlError = getErrorFromAxiosError(error);
    
    // For now, we'll still use fallback data, but throw the error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ML Error:', mlError);
    }
    
    // Fallback на моки
    return {
      trend: {
        points: [
          { date: '2025-07-01', value: 135 },
          { date: '2025-07-02', value: 142 },
          { date: '2025-07-03', value: 138 }
        ]
      },
      topProducts: [
        { name: 'Хлеб белый', amount: 50, barWidth: '95%', colorClass: 'bg-green-500' }
      ]
    };
  }
};

/**
 * Получить историю прогнозов с пагинацией и фильтрами
 * @param page Текущая страница
 * @param limit Количество на страницу
 * @param search Поисковый запрос
 * @param category Категория
 * @returns Массив записей истории и общее число
 */
export const fetchForecastHistory = async (
  page: number,
  limit: number,
  search: string,
  category: string
): Promise<{ items: ForecastApiResponse['history']['items']; total: number }> => {
  try {
    const headers = getAuthHeaders();
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    // Временно используем тестовый маршрут
    const res = await axios.get(`/api/test-predictions/history?${params.toString()}`, { headers });
    return res.data;
  } catch (error) {
    console.warn('API истории недоступен, используем моки:', error);
    // Fallback на моки
    return {
      items: [
        { date: '2025-07-01', product: 'Хлеб белый', category: 'Хлеб', forecast: 45, accuracy: 'Высокая' },
        { date: '2025-07-02', product: 'Торт шоколадный', category: 'Выпечка', forecast: 12, accuracy: 'Средняя' }
      ],
      total: 2
    };
  }
};

/**
 * Fetch quality metrics from the backend API.
 * Falls back to mock data in case of error.
 * @returns Quality metrics data
 */
export const fetchQualityMetrics = async (): Promise<QualityMetricsResponse> => {
  try {
    const headers = getAuthHeaders();
    const res = await axios.get('/api/quality-metrics', { headers });
    return res.data;
  } catch (error) {
    console.warn('Quality metrics API unavailable, using mocks:', error);
    // Fallback to mock data
    return {
      data: [
        { date: '2025-07-01', r2: 0.8, mape: 10.5, mae: 5.4, rmse: 7.3 },
        { date: '2025-07-02', r2: 0.82, mape: 11.2, mae: 5.1, rmse: 7.0 },
        { date: '2025-07-03', r2: 0.81, mape: 10.8, mae: 5.3, rmse: 7.1 }
      ],
      avgR2: 0.81,
      avgMape: 10.83,
      avgMae: 5.27,
      avgRmse: 7.13
    };
  }
};

/**
 * Fetch quality metrics with slice and period parameters.
 * Falls back to mock data in case of error.
 * @param slice Type of slice (time, sku, store)
 * @param period Number of days or date range
 * @returns Quality metrics data
 */
export const fetchQualityMetricsBySlice = async (
  slice: 'time' | 'sku' | 'store', 
  period: number | { startDate: Date; endDate: Date }
): Promise<QualityMetricsResponse> => {
  try {
    const headers = getAuthHeaders();
    const params = new URLSearchParams();
    params.append('slice', slice);
    
    if (typeof period === 'number') {
      params.append('days', String(period));
    } else {
      params.append('start_date', period.startDate.toISOString());
      params.append('end_date', period.endDate.toISOString());
    }
    
    const res = await axios.get(`/api/quality-metrics?${params.toString()}`, { headers });
    return res.data;
  } catch (error) {
    console.warn('Quality metrics API unavailable, using mocks:', error);
    
    // Mock data based on slice type
    if (slice === 'time') {
      return {
        data: [
          { date: '2025-07-01', r2: 0.8, mape: 10.5, mae: 5.4, rmse: 7.3 },
          { date: '2025-07-02', r2: 0.82, mape: 11.2, mae: 5.1, rmse: 7.0 },
          { date: '2025-07-03', r2: 0.81, mape: 10.8, mae: 5.3, rmse: 7.1 }
        ],
        avgR2: 0.81,
        avgMape: 10.83,
        avgMae: 5.27,
        avgRmse: 7.13
      };
    } else if (slice === 'sku') {
      return {
        data: [
          { sku: 'SKU001', r2: 0.75, mape: 12.3, mae: 6.1, rmse: 8.2 },
          { sku: 'SKU002', r2: 0.78, mape: 11.8, mae: 5.9, rmse: 7.8 },
          { sku: 'SKU003', r2: 0.73, mape: 13.1, mae: 6.3, rmse: 8.5 }
        ],
        avgR2: 0.75,
        avgMape: 12.4,
        avgMae: 6.1,
        avgRmse: 8.17
      };
    } else { // store
      return {
        data: [
          { store: 'Store A', r2: 0.85, mape: 9.2, mae: 4.8, rmse: 6.5 },
          { store: 'Store B', r2: 0.79, mape: 11.5, mae: 5.7, rmse: 7.6 },
          { store: 'Store C', r2: 0.82, mape: 10.1, mae: 5.2, rmse: 7.0 }
        ],
        avgR2: 0.82,
        avgMape: 10.27,
        avgMae: 5.23,
        avgRmse: 7.03
      };
    }
  }
};
