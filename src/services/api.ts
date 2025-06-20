import axios from 'axios';
import { supabase } from './supabaseClient';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для добавления токена из Supabase
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обработка ошибок авторизации
    if (error.response && error.response.status === 401) {
      // Очищаем токен и перенаправляем на страницу входа
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// API для аутентификации
export const authAPI = {
  // Регистрация пользователя
  register: async (userData: { email: string; password: string; full_name?: string; organization_id?: number; role?: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Вход пользователя
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    // Сохраняем токен в localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Получение профиля пользователя
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Обновление профиля пользователя
  updateProfile: async (userData: { full_name?: string; current_password?: string; new_password?: string }) => {
    const response = await api.put('/auth/me', userData);
    return response.data;
  },

  // Выход пользователя
  logout: () => {
    localStorage.removeItem('token');
  },

  // Сброс пароля пользователя
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },
};

// API для монетизации
export const monetizationAPI = {
  // Получение данных о монетизации текущего пользователя
  getUserMonetization: async () => {
    const response = await api.get('/api/me/monetization');
    return response.data;
  },

  // Получение данных о монетизации организации
  getOrganizationMonetization: async (organizationId: number) => {
    const response = await api.get(`/api/organizations/${organizationId}/monetization`);
    return response.data;
  },

  // Обновление настроек подписки
  updateSubscriptionSettings: async (subscriptionId: number, settings: any) => {
    const response = await api.put(`/api/monetization/subscription/${subscriptionId}`, { settings });
    return response.data;
  },

  // Отмена подписки
  cancelSubscription: async (subscriptionId: number, reason: string) => {
    const response = await api.post(`/api/monetization/subscription/${subscriptionId}/cancel`, { reason });
    return response.data;
  },

  // Получение данных о проценте от экономии
  getSavingsPercentageDetails: async () => {
    const response = await api.get('/api/monetization/savings');
    return response.data;
  },

  // Получение данных об оплате за использование
  getPayPerUseDetails: async () => {
    const response = await api.get('/api/monetization/pay-per-use');
    return response.data;
  },
};

export default api; 