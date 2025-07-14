import { useState, useEffect, useCallback } from 'react';
import { DashboardConfig, DEFAULT_DASHBOARD_CONFIG, UseDashboardPersistenceReturn } from '../types/dashboard.types';

const STORAGE_KEY = 'dashboard-config-v3'; // Изменен ключ для очистки старых данных

export function useDashboardPersistence(): UseDashboardPersistenceReturn {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для проверки валидности конфигурации
  const isValidConfig = (config: DashboardConfig): boolean => {
    try {
      // Проверяем, что все layout items имеют соответствующие виджеты
      for (const layoutItem of config.layout) {
        if (!config.widgets[layoutItem.i]) {
          console.warn(`Layout item ${layoutItem.i} has no corresponding widget`);
          return false;
        }
      }
      
      // Проверяем, что все виджеты имеют правильную структуру
      for (const [widgetId, widget] of Object.entries(config.widgets)) {
        if (!widget.id || !widget.widgetType || typeof widget.visible !== 'boolean') {
          console.warn(`Widget ${widgetId} has invalid structure`);
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error validating config:', err);
      return false;
    }
  };

  // Загрузка конфигурации из localStorage при инициализации
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      
      console.log('🔄 Loading dashboard config from localStorage:', savedConfig);
      
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig) as DashboardConfig;
        
        console.log('📋 Parsed config:', parsedConfig);
        console.log('📋 Default config version:', DEFAULT_DASHBOARD_CONFIG.version);
        console.log('📋 Saved config version:', parsedConfig.version);
        
        // Проверка версии и валидности конфигурации
        if (parsedConfig.version === DEFAULT_DASHBOARD_CONFIG.version && isValidConfig(parsedConfig)) {
          console.log('✅ Using saved config');
          setConfig(parsedConfig);
        } else {
          // Если версия не совпадает или конфигурация невалидна, используем конфигурацию по умолчанию
          console.warn('⚠️ Dashboard config invalid or version mismatch, using default config');
          setConfig(DEFAULT_DASHBOARD_CONFIG);
          // Сохраняем новую конфигурацию
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DASHBOARD_CONFIG));
        }
      } else {
        // Если нет сохраненной конфигурации, создаем конфигурацию по умолчанию
        console.log('🆕 No saved config found, using default config');
        setConfig(DEFAULT_DASHBOARD_CONFIG);
        // Сохраняем конфигурацию по умолчанию
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DASHBOARD_CONFIG));
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Error loading dashboard config:', err);
      setError('Ошибка загрузки конфигурации дашборда');
      setConfig(DEFAULT_DASHBOARD_CONFIG);
      // Сохраняем конфигурацию по умолчанию при ошибке
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DASHBOARD_CONFIG));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Сохранение конфигурации в localStorage
  const saveConfig = useCallback((newConfig: DashboardConfig) => {
    try {
      console.log('💾 Saving dashboard config:', newConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
      setError(null);
    } catch (err) {
      console.error('❌ Error saving dashboard config:', err);
      setError('Ошибка сохранения конфигурации дашборда');
    }
  }, []);

  // Сброс конфигурации к значениям по умолчанию
  const resetConfig = useCallback(() => {
    try {
      console.log('🔄 Resetting dashboard config to default');
      localStorage.removeItem(STORAGE_KEY);
      setConfig(DEFAULT_DASHBOARD_CONFIG);
      setError(null);
    } catch (err) {
      console.error('❌ Error resetting dashboard config:', err);
      setError('Ошибка сброса конфигурации дашборда');
    }
  }, []);

  return {
    config,
    saveConfig,
    resetConfig,
    isLoading,
    error,
  };
} 