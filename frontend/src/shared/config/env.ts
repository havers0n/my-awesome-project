// Конфигурация переменных окружения
// Безопасная обработка переменных окружения с валидацией и типизацией

interface EnvConfig {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // API
  API_BASE_URL: string;
  
  // Режим разработки
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Другие настройки
  ENABLE_ANALYTICS: boolean;
  ENABLE_DEBUG: boolean;
}

// Валидация и получение переменных окружения
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

function getBooleanEnvVar(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key];
  
  if (!value) {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true';
}

// Экспорт конфигурации
export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  NODE_ENV: (getEnvVar('NODE_ENV', 'development') as EnvConfig['NODE_ENV']),
  ENABLE_ANALYTICS: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  ENABLE_DEBUG: getBooleanEnvVar('VITE_ENABLE_DEBUG', false),
};

// Вспомогательные функции
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Валидация конфигурации при инициализации
export const validateEnv = (): void => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  
  for (const varName of requiredVars) {
    if (!env[varName as keyof EnvConfig]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
  
  console.log('✅ Environment configuration validated successfully');
};

// Экспорт типов
export type { EnvConfig };
