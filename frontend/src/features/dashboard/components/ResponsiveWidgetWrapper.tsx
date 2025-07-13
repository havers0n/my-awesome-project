import React, { Suspense, useState, useCallback, useRef } from 'react';
import { X, Settings, Move, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardWidget, WidgetDefinition } from '../types/dashboard.types';

interface ResponsiveWidgetWrapperProps {
  widget: DashboardWidget;
  widgetDefinition: WidgetDefinition;
  isEditMode: boolean;
  onRemove: (widgetId: string) => void;
  onConfig?: (widgetId: string) => void;
  onResize?: (widgetId: string, size: { w: number; h: number }) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function ResponsiveWidgetWrapper({
  widget,
  widgetDefinition,
  isEditMode,
  onRemove,
  onConfig,
  onResize,
  className = '',
  style = {},
  children,
}: ResponsiveWidgetWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Получаем компонент виджета
  const WidgetComponent = widgetDefinition.component;

  // Обработчики событий
  const handleRemove = useCallback(() => {
    onRemove(widget.id);
  }, [onRemove, widget.id]);

  const handleConfig = useCallback(() => {
    if (onConfig && widgetDefinition.configurable) {
      onConfig(widget.id);
    }
  }, [onConfig, widget.id, widgetDefinition.configurable]);

  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    if (onResize) {
      onResize(widget.id, widgetDefinition.defaultSize);
    }
  }, [onResize, widget.id, widgetDefinition.defaultSize]);

  // Обработчик клавиатурных событий
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isEditMode) return;

      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          handleRemove();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (event.shiftKey && widgetDefinition.configurable) {
            handleConfig();
          }
          break;
        case 'Escape':
          // Снять фокус
          (event.target as HTMLElement).blur();
          break;
        case 'r':
        case 'R':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleReset();
          }
          break;
      }
    },
    [isEditMode, handleRemove, handleConfig, handleReset, widgetDefinition.configurable]
  );

  // Обработчик загрузки
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // Компонент для отображения ошибки
  const ErrorFallback = ({ error }: { error: Error }) => (
    <div className="flex items-center justify-center h-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="text-center">
        <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">❌ Ошибка виджета</p>
        <p className="text-red-500 dark:text-red-300 text-xs">{error.message}</p>
      </div>
    </div>
  );

  // Компонент загрузки
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
    </div>
  );

  return (
    <motion.div
      ref={containerRef}
      style={style}
      layout
      className={`
        relative h-full w-full transition-all duration-200 group
        ${isEditMode ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}
        ${isHovered && isEditMode ? 'border-brand-400 bg-brand-50/30 dark:bg-brand-900/10' : ''}
        ${isExpanded ? 'z-50 fixed inset-4 bg-white dark:bg-gray-800 shadow-2xl rounded-lg' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      role="widget"
      aria-label={`Виджет ${widgetDefinition.title}`}
      aria-describedby={`widget-${widget.id}-description`}
      tabIndex={isEditMode ? 0 : undefined}
      aria-keyshortcuts="Delete Backspace Enter Escape Ctrl+R"
    >
      {/* Панель управления виджетом */}
      <AnimatePresence>
        {isEditMode && (isHovered || isExpanded) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-2 right-2 z-20 flex gap-1"
          >
            {/* Кнопка перемещения */}
            <div
              className="drag-handle flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-move"
              title="Переместить виджет"
            >
              <Move className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>

            {/* Кнопка сброса размера */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Сбросить размер (Ctrl+R)"
            >
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Кнопка развертывания */}
            <button
              onClick={handleExpand}
              className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={isExpanded ? 'Свернуть' : 'Развернуть'}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Кнопка настройки */}
            {widgetDefinition.configurable && (
              <button
                onClick={handleConfig}
                className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Настроить виджет"
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {/* Кнопка удаления */}
            <button
              onClick={handleRemove}
              className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Удалить виджет"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Заголовок виджета */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-brand-400 rounded-full"></div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {widgetDefinition.title}
          </h3>
        </div>
        {isEditMode && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">{widget.id}</span>
          </div>
        )}
      </div>

      {/* Контент виджета */}
      <div
        className={`
        h-full w-full p-4 bg-white dark:bg-gray-800 rounded-b-lg
        ${isEditMode ? 'pointer-events-none' : ''}
        ${isExpanded ? 'overflow-auto' : ''}
      `}
      >
        <React.Suspense fallback={<LoadingFallback />}>
          <React.ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={error => {
              console.error('Widget error:', error);
            }}
          >
            {children ||
              (widget.visible ? (
                <WidgetComponent
                  id={widget.id}
                  config={widget.config}
                  onConfigChange={config => {
                    console.log('Widget config changed:', config);
                  }}
                  onLoadingChange={handleLoadingChange}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Виджет скрыт</p>
                </div>
              ))}
          </React.ErrorBoundary>
        </React.Suspense>
      </div>

      {/* Скрытое описание для screen readers */}
      <div id={`widget-${widget.id}-description`} className="sr-only">
        {widgetDefinition.description}
        {isEditMode && (
          <span>
            {' '}
            Режим редактирования: используйте клавиши Delete для удаления, Enter для настройки,
            Escape для снятия фокуса.
          </span>
        )}
      </div>

      {/* Overlay для загрузки */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Загрузка...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop для развернутого виджета */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleExpand}
        />
      )}
    </motion.div>
  );
}

// Добавляем поддержку ErrorBoundary для React 18+
class WidgetErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error }>;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Widget error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Экспортируем также ErrorBoundary
export { WidgetErrorBoundary };
