import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
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

export default api;

