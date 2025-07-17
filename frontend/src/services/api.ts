import axios from 'axios';

// 1. Создаем инстанс Axios с базовым URL нашего бэкенда
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', // URL нашего бэкенда
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Настраиваем перехватчик (interceptor)
// Он будет выполняться перед каждым запросом
api.interceptors.request.use(
  (config) => {
    // --- НАЧАЛО ИСПРАВЛЕНИЯ ---

    // 1. Получаем ID проекта Supabase из переменной окружения.
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error("VITE_SUPABASE_URL is not defined in .env file");
      return config;
    }
    const projectRef = supabaseUrl.split('.')[0].replace('https://', '');

    // 2. Формируем ключ для localStorage динамически.
    const localStorageKey = `sb-${projectRef}-auth-token`;

    // 3. Пытаемся получить токен по правильному, динамическому ключу.
    const supabaseAuthToken = localStorage.getItem(localStorageKey);
    
    if (supabaseAuthToken) {
      try {
        const tokenData = JSON.parse(supabaseAuthToken);
        if (tokenData && tokenData.access_token) {
          config.headers.Authorization = `Bearer ${tokenData.access_token}`;
        }
      } catch (e) {
         console.error("Failed to parse Supabase auth token from localStorage", e);
      }
    }
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Реализуем объект authAPI
export const authAPI = {
  // Проверка уникальности email (true — если email свободен, false — если занят)
  checkEmailUnique: async (email: string) => {
    try {
      const res = await api.get(`/admin/users/check-email?email=${encodeURIComponent(email)}`);
      return res.data?.unique === true;
    } catch {
      return false; // если ошибка — считаем, что email занят
    }
  },
  // Получение профиля текущего пользователя
  getProfile: () => {
    return api.get('/auth/me'); // Запрос на эндпоинт бэкенда GET /auth/me
  },

  // Регистрация нового пользователя (админом)
  register: (userData: {
    email: string;
    password: string;
    full_name?: string;
    organization_id?: number;
    role?: string;
    phone?: string;
    position?: string;
  }) => {
    return api.post('/admin/users', userData); // POST /admin/users — примерный эндпоинт, скорректируйте при необходимости
  },

  // Обновление профиля пользователя
  updateProfile: (userData: { fullName?: string; /* другие поля */ }) => {
    return api.put('/users/profile', userData); // Запрос на PUT /users/profile
  },

  // Выход из системы (если для этого есть эндпоинт на бэкенде)
  // Если выхода на бэкенде нет, этот метод можно удалить,
  // так как выход обрабатывается Supabase на клиенте.
  logout: () => {
    return api.post('/auth/logout');
  },
  
  // Сброс пароля
  resetPassword: (email: string) => {
    return api.post('/auth/reset-password', { email });
  }
};

export default api; 