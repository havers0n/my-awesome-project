import axios from 'axios';
import { ForecastApiResponse } from '../pages/types';

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
  const headers = getAuthHeaders();
  const res = await axios.get(`/api/predictions/forecast?days=${days}`, { headers });
  return res.data;
};

/**
 * Запросить новый прогноз (POST)
 * @returns Данные для графика, топ-продуктов и истории
 */
export const postForecast = async (): Promise<ForecastApiResponse> => {
  const headers = getAuthHeaders();
  const res = await axios.post(`/api/predictions/forecast`, {}, { headers });
  return res.data;
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
  const headers = getAuthHeaders();
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  const res = await axios.get(`/api/predictions/history?${params.toString()}`, { headers });
  return res.data;
};
