import React, { lazy, Suspense, useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Интерфейсы для lazy loading
interface LazyWidgetConfig {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  loadCondition?: () => boolean;
  fallback?: React.ComponentType;
  preload?: boolean;
  visible?: boolean;
}

interface LazyWidgetProps {
  config: LazyWidgetConfig;
  onLoad?: (widgetId: string) => void;
  onError?: (widgetId: string, error: Error) => void;
  className?: string;
}

// Мемоизированный скелетон для загрузки
const WidgetSkeleton = memo(
  ({ className = '', animated = true }: { className?: string; animated?: boolean }) => (
    <div className={`widget-skeleton ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          {/* Заголовок */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>

          {/* Контент */}
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            </div>
          </div>

          {/* Индикатор загрузки */}
          {animated && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Загрузка виджета...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
);

WidgetSkeleton.displayName = 'WidgetSkeleton';

// Компонент ошибки для виджетов
const WidgetError = memo(
  ({
    error,
    onRetry,
    className = '',
  }: {
    error: Error;
    onRetry?: () => void;
    className?: string;
  }) => (
    <div className={`widget-error ${className}`}>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
              Ошибка загрузки виджета
            </h3>
            <p className="text-sm text-red-600 dark:text-red-500 mt-1">{error.message}</p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Повторить
          </button>
        )}
      </div>
    </div>
  )
);

WidgetError.displayName = 'WidgetError';

// Динамические импорты виджетов
const loadWidget = (widgetType: string) => {
  const widgetLoaders: Record<string, () => Promise<any>> = {
    // Основные виджеты
    chart: () => import('../widgets/ChartWidget'),
    table: () => import('../widgets/TableWidget'),
    metric: () => import('../widgets/MetricWidget'),
    calendar: () => import('../widgets/CalendarWidget'),

    // Специализированные виджеты
    sales: () => import('../widgets/SalesWidget'),
    analytics: () => import('../widgets/AnalyticsWidget'),
    inventory: () => import('../widgets/InventoryWidget'),
    weather: () => import('../widgets/WeatherWidget'),

    // Интерактивные виджеты
    todo: () => import('../widgets/TodoWidget'),
    notes: () => import('../widgets/NotesWidget'),
    calculator: () => import('../widgets/CalculatorWidget'),

    // Медиа виджеты
    image: () => import('../widgets/ImageWidget'),
    video: () => import('../widgets/VideoWidget'),
    audio: () => import('../widgets/AudioWidget'),

    // Социальные виджеты
    feed: () => import('../widgets/FeedWidget'),
    chat: () => import('../widgets/ChatWidget'),
    notifications: () => import('../widgets/NotificationsWidget'),
  };

  const loader = widgetLoaders[widgetType];
  if (!loader) {
    return Promise.reject(new Error(`Виджет типа "${widgetType}" не найден`));
  }

  return loader();
};

// Hook для отслеживания видимости
const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasBeenVisible, options]);

  return { isVisible, hasBeenVisible };
};

// Основной компонент для lazy loading виджетов
const LazyWidget = memo<LazyWidgetProps>(({ config, onLoad, onError, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [shouldLoad, setShouldLoad] = useState(config.preload || false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const { isVisible, hasBeenVisible } = useIntersectionObserver(widgetRef);

  // Создаем Lazy компонент
  const LazyComponent = lazy(() => {
    setIsLoading(true);
    return loadWidget(config.type)
      .then(module => {
        setIsLoading(false);
        onLoad?.(config.id);
        return module;
      })
      .catch(error => {
        setIsLoading(false);
        setError(error);
        onError?.(config.id, error);
        throw error;
      });
  });

  // Определяем, когда начать загрузку
  useEffect(() => {
    if (config.priority === 'high' || config.preload) {
      setShouldLoad(true);
    } else if (config.priority === 'medium' && hasBeenVisible) {
      setShouldLoad(true);
    } else if (config.priority === 'low' && isVisible) {
      setShouldLoad(true);
    }
  }, [config.priority, config.preload, isVisible, hasBeenVisible]);

  // Проверяем условие загрузки
  useEffect(() => {
    if (config.loadCondition && !config.loadCondition()) {
      setShouldLoad(false);
    }
  }, [config.loadCondition]);

  const handleRetry = useCallback(() => {
    setError(null);
    setShouldLoad(false);
    // Небольшая задержка для сброса состояния
    setTimeout(() => setShouldLoad(true), 100);
  }, []);

  const fallbackContent = useMemo(() => {
    if (error) {
      return <WidgetError error={error} onRetry={handleRetry} className={className} />;
    }

    if (config.fallback) {
      const FallbackComponent = config.fallback;
      return <FallbackComponent />;
    }

    return <WidgetSkeleton className={className} animated={isLoading} />;
  }, [error, config.fallback, className, isLoading, handleRetry]);

  return (
    <div
      ref={widgetRef}
      className={`lazy-widget ${className}`}
      data-widget-id={config.id}
      data-widget-type={config.type}
      data-testid={`lazy-widget-${config.id}`}
    >
      <AnimatePresence mode="wait">
        {shouldLoad ? (
          <motion.div
            key="widget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={fallbackContent}>
              <LazyComponent {...config} />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {fallbackContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

LazyWidget.displayName = 'LazyWidget';

// Контейнер для управления несколькими lazy виджетами
interface LazyWidgetContainerProps {
  widgets: LazyWidgetConfig[];
  onWidgetLoad?: (widgetId: string) => void;
  onWidgetError?: (widgetId: string, error: Error) => void;
  className?: string;
  gridCols?: number;
  gap?: number;
}

const LazyWidgetContainer = memo<LazyWidgetContainerProps>(
  ({ widgets, onWidgetLoad, onWidgetError, className = '', gridCols = 3, gap = 4 }) => {
    const [loadedWidgets, setLoadedWidgets] = useState<Set<string>>(new Set());
    const [errorWidgets, setErrorWidgets] = useState<Set<string>>(new Set());

    const handleWidgetLoad = useCallback(
      (widgetId: string) => {
        setLoadedWidgets(prev => new Set(prev).add(widgetId));
        onWidgetLoad?.(widgetId);
      },
      [onWidgetLoad]
    );

    const handleWidgetError = useCallback(
      (widgetId: string, error: Error) => {
        setErrorWidgets(prev => new Set(prev).add(widgetId));
        onWidgetError?.(widgetId, error);
      },
      [onWidgetError]
    );

    const gridClasses = useMemo(() => {
      const baseClasses = ['grid', 'auto-rows-fr', className];

      // Добавляем responsive grid columns
      if (gridCols === 1) {
        baseClasses.push('grid-cols-1');
      } else if (gridCols === 2) {
        baseClasses.push('grid-cols-1 md:grid-cols-2');
      } else if (gridCols === 3) {
        baseClasses.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
      } else if (gridCols === 4) {
        baseClasses.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
      }

      // Добавляем gap
      if (gap === 2) {
        baseClasses.push('gap-2');
      } else if (gap === 3) {
        baseClasses.push('gap-3');
      } else if (gap === 4) {
        baseClasses.push('gap-4');
      } else if (gap === 6) {
        baseClasses.push('gap-6');
      } else if (gap === 8) {
        baseClasses.push('gap-8');
      }

      return baseClasses.join(' ');
    }, [gridCols, gap, className]);

    // Сортируем виджеты по приоритету
    const sortedWidgets = useMemo(() => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return [...widgets].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }, [widgets]);

    return (
      <div className={gridClasses}>
        {sortedWidgets.map(widget => (
          <LazyWidget
            key={widget.id}
            config={widget}
            onLoad={handleWidgetLoad}
            onError={handleWidgetError}
            className="h-full"
          />
        ))}

        {/* Статистика загрузки (только в dev режиме) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="col-span-full mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <div className="flex gap-4 text-gray-600 dark:text-gray-400">
              <span>Всего виджетов: {widgets.length}</span>
              <span>Загружено: {loadedWidgets.size}</span>
              <span>Ошибок: {errorWidgets.size}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

LazyWidgetContainer.displayName = 'LazyWidgetContainer';

// Утилита для предварительной загрузки виджетов
export const preloadWidgets = (widgetTypes: string[]) => {
  return Promise.allSettled(widgetTypes.map(type => loadWidget(type)));
};

// Утилита для очистки кэша виджетов
export const clearWidgetCache = () => {
  // В реальном проекте здесь может быть логика очистки кэша
  if (typeof window !== 'undefined') {
    // Перезагружаем страницу как крайний случай
    window.location.reload();
  }
};

export {
  LazyWidget,
  LazyWidgetContainer,
  WidgetSkeleton,
  WidgetError,
  loadWidget,
  type LazyWidgetConfig,
  type LazyWidgetProps,
  type LazyWidgetContainerProps,
};
