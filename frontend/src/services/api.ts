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
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return config;
    
    const projectRef = supabaseUrl.split('.')[0].replace('https://', '');
    const localStorageKey = `sb-${projectRef}-auth-token`;
    const supabaseAuthToken = localStorage.getItem(localStorageKey);
    
    if (supabaseAuthToken) {
      try {
        const tokenData = JSON.parse(supabaseAuthToken);
        if (tokenData?.access_token) {
          config.headers.Authorization = `Bearer ${tokenData.access_token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth token:', error);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;