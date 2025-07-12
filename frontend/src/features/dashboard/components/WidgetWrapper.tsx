import { Suspense, useState } from 'react';
import { X, Settings, Move } from 'lucide-react';
import { DashboardWidget, WidgetDefinition } from '../types/dashboard.types';

interface WidgetWrapperProps {
  widget: DashboardWidget;
  widgetDefinition: WidgetDefinition;
  isEditMode: boolean;
  onRemove: (widgetId: string) => void;
  onConfig?: (widgetId: string) => void;
  className?: string;
}

export default function WidgetWrapper({
  widget,
  widgetDefinition,
  isEditMode,
  onRemove,
  onConfig,
  className = '',
}: WidgetWrapperProps) {
  console.log('🎭 [WidgetWrapper] Rendering widget:', {
    widgetId: widget.id,
    widgetType: widget.widgetType,
    visible: widget.visible,
    title: widgetDefinition.title
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const WidgetComponent = widgetDefinition.component;

  const handleRemove = () => {
    onRemove(widget.id);
  };

  const handleConfig = () => {
    if (onConfig && widgetDefinition.configurable) {
      onConfig(widget.id);
    }
  };

  const handleError = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`
        relative h-full
        ${isEditMode ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}
        ${isHovered && isEditMode ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/20' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Панель управления виджетом (показывается только в режиме редактирования) */}
      {isEditMode && (
        <div className={`
          absolute top-2 right-2 z-10 flex gap-1 transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          {/* Кнопка перемещения */}
          <button
            className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-move"
            title="Переместить виджет"
          >
            <Move className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Кнопка настройки (только если виджет настраиваемый) */}
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
        </div>
      )}

      {/* Заголовок виджета (показывается только в режиме редактирования) */}
      {isEditMode && (
        <div className="absolute top-2 left-2 z-10">
          <div className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {widgetDefinition.title}
            </span>
          </div>
        </div>
      )}

      {/* Контент виджета */}
      <div className={`
        h-full w-full
        ${isEditMode ? 'pointer-events-none' : ''}
      `}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          }
        >
          <div className="h-full w-full">
            {widget.visible ? (
              <WidgetComponent
                id={widget.id}
                config={widget.config}
                onConfigChange={(config) => {
                  // Обновление конфигурации виджета
                  console.log('Widget config changed:', config);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Виджет скрыт (visible: {widget.visible ? 'true' : 'false'})
                </p>
              </div>
            )}
          </div>
        </Suspense>
      </div>

      {/* Overlay для загрузки */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      )}
    </div>
  );
} 