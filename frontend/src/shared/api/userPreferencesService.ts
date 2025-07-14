import axios from "axios";

const API_BASE_URL = '/api/user-preferences';

export interface SidebarPreferences {
  order: string[];
  hiddenItems: string[];
}

export interface UserPreferences {
  sidebar?: SidebarPreferences;
  theme?: string;
  language?: string;
  [key: string]: any;
}

// Создаем axios instance с автоматической авторизацией
const createAuthorizedAxios = () => {
  const token = localStorage.getItem('supabase.auth.token') || 
                sessionStorage.getItem('supabase.auth.token');
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Получить настройки пользователя
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const api = createAuthorizedAxios();
    const response = await api.get('/');
    return response.data.preferences || {};
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

// Сохранить все настройки пользователя
export const saveUserPreferences = async (preferences: UserPreferences): Promise<void> => {
  try {
    const api = createAuthorizedAxios();
    await api.post('/', { preferences });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
};

// Сохранить настройки сайдбара
export const saveSidebarPreferences = async (
  order: string[], 
  hiddenItems: string[]
): Promise<void> => {
  try {
    const api = createAuthorizedAxios();
    await api.post('/sidebar', { order, hiddenItems });
  } catch (error) {
    console.error('Error saving sidebar preferences:', error);
    throw error;
  }
};

// Получить настройки сайдбара
export const getSidebarPreferences = async (): Promise<SidebarPreferences> => {
  try {
    const preferences = await getUserPreferences();
    return preferences.sidebar || { order: [], hiddenItems: [] };
  } catch (error) {
    console.error('Error fetching sidebar preferences:', error);
    return { order: [], hiddenItems: [] };
  }
};

// Утилита для получения токена из Supabase
export const getSupabaseToken = (): string | null => {
  // Попробуем получить токен из localStorage или sessionStorage
  const localToken = localStorage.getItem('supabase.auth.token');
  const sessionToken = sessionStorage.getItem('supabase.auth.token');
  
  // Также попробуем получить из более сложной структуры Supabase
  try {
    const supabaseAuth = localStorage.getItem('sb-' + window.location.hostname.replace(/\./g, '-') + '-auth-token');
    if (supabaseAuth) {
      const parsed = JSON.parse(supabaseAuth);
      if (parsed.access_token) {
        return parsed.access_token;
      }
    }
  } catch (e) {
    // Игнорируем ошибки парсинга
  }
  
  return localToken || sessionToken;
};

// Улучшенная версия создания авторизованного axios
export const createAuthenticatedAxios = async () => {
  // Попробуем получить токен из Supabase напрямую
  const { supabase } = await import('@/services/supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();
  
  const token = session?.access_token || getSupabaseToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Обновленные функции с улучшенной авторизацией
export const getUserPreferencesAuth = async (): Promise<UserPreferences> => {
  try {
    const api = await createAuthenticatedAxios();
    const response = await api.get('/');
    return response.data.preferences || {};
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    // Возвращаем пустые настройки в случае ошибки
    return {};
  }
};

export const saveSidebarPreferencesAuth = async (
  order: string[], 
  hiddenItems: string[]
): Promise<void> => {
  try {
    const api = await createAuthenticatedAxios();
    await api.post('/sidebar', { order, hiddenItems });
    console.log('Sidebar preferences saved successfully');
  } catch (error) {
    console.error('Error saving sidebar preferences:', error);
    // Не бросаем ошибку, чтобы не ломать UX
  }
}; 