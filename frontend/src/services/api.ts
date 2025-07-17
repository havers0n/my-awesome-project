import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    console.log('[API Interceptor] Running for request:', config.method?.toUpperCase(), config.url);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('[API Interceptor] VITE_SUPABASE_URL is not set. Cannot get auth token.');
      return config;
    }
    
    const projectRef = supabaseUrl.split('.')[0].replace('https://', '');
    const localStorageKey = `sb-${projectRef}-auth-token`;
    const supabaseAuthToken = localStorage.getItem(localStorageKey);
    
    if (supabaseAuthToken) {
      try {
        const tokenData = JSON.parse(supabaseAuthToken);
        if (tokenData?.access_token) {
          console.log('[API Interceptor] Auth token found. Setting Authorization header.');
          config.headers.Authorization = `Bearer ${tokenData.access_token}`;
        } else {
          console.warn('[API Interceptor] Auth token found in localStorage, but access_token is missing.');
        }
      } catch (error) {
        console.error('[API Interceptor] Failed to parse auth token from localStorage:', error);
      }
    } else {
      console.warn(`[API Interceptor] No auth token found in localStorage (key: ${localStorageKey}). Request will be unauthenticated.`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API methods
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
    organization_id?: number;
    role?: string;
    phone?: string;
    position?: string;
  }) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  checkEmailUnique: async (email: string) => {
    const response = await api.get(`/admin/users/check-email?email=${encodeURIComponent(email)}`);
    return response.data.isUnique;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (updateData: any) => {
    const response = await api.put('/auth/me', updateData);
    return response.data;
  },

  resetPassword: async (email: string) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export default api;