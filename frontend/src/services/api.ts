import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Если заголовок Authorization УЖЕ установлен, ничего не делаем.
    if (config.headers.Authorization) {
      return config;
    }

    // Если заголовок не был установлен вручную, пытаемся взять его из localStorage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error("VITE_SUPABASE_URL is not defined in .env file");
      return config;
    }
    const projectRef = supabaseUrl.split('.')[0].replace('https://', '');
    const localStorageKey = `sb-${projectRef}-auth-token`;
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
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  checkEmailUnique: async (email: string) => {
    try {
      const res = await api.get(`/admin/users/check-email?email=${encodeURIComponent(email)}`);
      return res.data?.unique === true;
    } catch {
      return false;
    }
  },
  getProfile: () => {
    return api.get('/auth/me');
  },
  register: (userData: {
    email: string;
    password: string;
    full_name?: string;
    organization_id?: number;
    role?: string;
    phone?: string;
    position?: string;
  }) => {
    return api.post('/admin/users', userData);
  },
  updateProfile: (userData: { fullName?: string; }) => {
    return api.put('/users/profile', userData);
  },
  logout: () => {
    return api.post('/auth/logout');
  },
  resetPassword: (email: string) => {
    return api.post('/auth/reset-password', { email });
  }
};

export default api; 