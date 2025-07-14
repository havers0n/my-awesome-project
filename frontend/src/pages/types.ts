/**
 * Топовый продукт для блока "Топ продуктов"
 */
export interface TopProduct {
  name: string;
  amount: number;
  colorClass: string;
  barWidth: string;
}

/**
 * Точка тренда продаж (для графика)
 */
export interface TrendPoint {
  date: string; // ISO string или форматированная дата
  value: number;
}

/**
 * Запись истории прогнозов
 */
export interface ForecastHistoryItem {
  date: string;
  product: string;
  category: string;
  forecast: number;
  accuracy: 'Высокая' | 'Средняя' | 'Низкая';
}

/**
 * Данные тренда продаж
 */
export interface TrendData {
  points: TrendPoint[];
}

/**
 * Ответ API для страницы прогноза
 */
export interface ForecastApiResponse {
  trend: TrendData;
  topProducts: TopProduct[];
  history: {
    items: ForecastHistoryItem[];
    total: number;
  };
}
