import React, { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, Layout as RGLLayout } from 'react-grid-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayoutItem, DashboardWidget, WidgetDefinition } from '../types/dashboard.types';
import { getWidgetById } from '../widgetRegistry';
import WidgetWrapper from './WidgetWrapper';

// Подключаем стили для react-grid-layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/react-grid-layout.css';

// Создаем адаптивную сетку
const ResponsiveGridLayout = WidthProvider(Responsive);

interface ResponsiveGridLayoutProps {
  layout: DashboardLayoutItem[];
  widgets: Record<string, DashboardWidget>;
  isEditMode: boolean;
  onLayoutChange: (layout: DashboardLayoutItem[]) => void;
  onRemoveWidget: (widgetId: string) => void;
  onConfigWidget?: (widgetId: string) => void;
  onResizeWidget?: (widgetId: string, size: { w: number; h: number }) => void;
  className?: string;
}

// Конфигурация breakpoints для адаптивности
const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

// Конфигурация колонок для разных размеров экрана
const COLUMNS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

// Высота строки в пикселях
const ROW_HEIGHT = 30;

// Отступы между элементами
const MARGIN: [number, number] = [10, 10];

// Отступы контейнера
const CONTAINER_PADDING: [number, number] = [10, 10];

export default function ResponsiveGridLayoutComponent({
  layout,
  widgets,
  isEditMode,
  onLayoutChange,
  onRemoveWidget,
  onConfigWidget,
  onResizeWidget,
  className = '',
}: ResponsiveGridLayoutProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('lg');
  const [compactType, setCompactType] = useState<'vertical' | 'horizontal' | null>('vertical');

  // Фильтрация только видимых виджетов
  const visibleLayout = useMemo(() => {
    return layout.filter(item => {
      const widget = widgets[item.i];
      return widget && widget.visible;
    });
  }, [layout, widgets]);

  // Преобразование layouts для разных breakpoints
  const layouts = useMemo(() => {
    const baseLayout = visibleLayout.map(item => ({
      ...item,
      isDraggable: isEditMode,
      isResizable: isEditMode,
      // Добавляем минимальные и максимальные размеры
      minW: 2,
      minH: 2,
      maxW: 12,
      maxH: 20,
    }));

    // Создаем адаптивные layouts для разных breakpoints
    const responsiveLayouts = {
      lg: baseLayout,
      md: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, COLUMNS.md),
        x: Math.min(item.x, COLUMNS.md - item.w),
      })),
      sm: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, COLUMNS.sm),
        x: Math.min(item.x, COLUMNS.sm - item.w),
      })),
      xs: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, COLUMNS.xs),
        x: Math.min(item.x, COLUMNS.xs - item.w),
      })),
      xxs: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, COLUMNS.xxs),
        x: 0, // На очень маленьких экранах все виджеты в одну колонку
      })),
    };

    return responsiveLayouts;
  }, [visibleLayout, isEditMode]);

  // Обработчик изменения layout
  const handleLayoutChange = useCallback(
    (currentLayout: RGLLayout[], allLayouts: { [key: string]: RGLLayout[] }) => {
      // Преобразуем RGLLayout обратно в DashboardLayoutItem
      const newLayout: DashboardLayoutItem[] = currentLayout.map(item => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      }));

      onLayoutChange(newLayout);
    },
    [onLayoutChange]
  );

  // Обработчик изменения breakpoint
  const handleBreakpointChange = useCallback((breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  }, []);

  // Обработчик изменения размера виджета
  const handleResize = useCallback(
    (layout: RGLLayout[], oldItem: RGLLayout, newItem: RGLLayout) => {
      if (onResizeWidget) {
        onResizeWidget(newItem.i, { w: newItem.w, h: newItem.h });
      }
    },
    [onResizeWidget]
  );

  // Обработчик drag события
  const handleDrag = useCallback((layout: RGLLayout[], oldItem: RGLLayout, newItem: RGLLayout) => {
    // Можно добавить дополнительную логику для drag события
    console.log('Dragging widget:', newItem.i, 'to position:', { x: newItem.x, y: newItem.y });
  }, []);

  // Функция для переключения типа компоновки
  const toggleCompactType = useCallback(() => {
    setCompactType(prev => {
      if (prev === 'vertical') return 'horizontal';
      if (prev === 'horizontal') return null;
      return 'vertical';
    });
  }, []);

  // Рендер пустого состояния
  if (visibleLayout.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Дашборд пуст</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {isEditMode
              ? 'Добавьте виджеты для начала работы'
              : 'Перейдите в режим редактирования для добавления виджетов'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`responsive-grid-container ${className}`}>
      {/* Панель управления сеткой (только в режиме редактирования) */}
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Текущий breakpoint:{' '}
                <span className="font-semibold text-brand-600">{currentBreakpoint}</span>
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Колонки: {COLUMNS[currentBreakpoint as keyof typeof COLUMNS]}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleCompactType}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Переключить тип компоновки"
              >
                Компоновка:{' '}
                {compactType === 'vertical'
                  ? 'Вертикальная'
                  : compactType === 'horizontal'
                    ? 'Горизонтальная'
                    : 'Свободная'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Адаптивная сетка */}
      <ResponsiveGridLayout
        className="responsive-grid-layout"
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLUMNS}
        rowHeight={ROW_HEIGHT}
        margin={MARGIN}
        containerPadding={CONTAINER_PADDING}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={handleBreakpointChange}
        onResize={handleResize}
        onDrag={handleDrag}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType={compactType}
        preventCollision={false}
        useCSSTransforms={true}
        measureBeforeMount={false}
        // Настройки для улучшения производительности
        transformScale={1}
        allowOverlap={false}
        isBounded={false}
        // Кастомные CSS классы
        draggableHandle=".drag-handle"
        resizeHandles={['se', 'e', 's', 'n', 'w', 'ne', 'nw', 'sw']}
      >
        {visibleLayout.map(layoutItem => {
          const widget = widgets[layoutItem.i];
          const widgetDefinition = getWidgetById(widget.widgetType);

          if (!widget || !widgetDefinition) {
            return (
              <div key={layoutItem.i} className="widget-error">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    ❌ Виджет "{widget?.widgetType || 'неизвестный'}" не найден
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={layoutItem.i} className="widget-container">
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
                className="h-full w-full"
              >
                <WidgetWrapper
                  widget={widget}
                  widgetDefinition={widgetDefinition}
                  isEditMode={isEditMode}
                  onRemove={onRemoveWidget}
                  onConfig={onConfigWidget}
                  onResize={onResizeWidget}
                  className="h-full w-full"
                />
              </motion.div>
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {/* Кастомные стили для интеграции с Tailwind */}
      <style jsx>{`
        .responsive-grid-container {
          position: relative;
        }

        .responsive-grid-layout {
          position: relative;
        }

        .widget-container {
          position: relative;
        }

        .widget-error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }

        /* Кастомизация handles для изменения размера */
        :global(.react-resizable-handle) {
          @apply bg-brand-400 opacity-0 transition-opacity duration-200;
        }

        :global(.react-resizable-handle:hover) {
          @apply opacity-100;
        }

        /* Кастомизация placeholder для drag and drop */
        :global(.react-grid-placeholder) {
          @apply bg-brand-100 border-2 border-dashed border-brand-400 rounded-lg opacity-50;
        }

        /* Темная тема для placeholder */
        :global(.dark .react-grid-placeholder) {
          @apply bg-brand-900/20 border-brand-400;
        }

        /* Стили для улучшения производительности */
        :global(.react-grid-item) {
          @apply transition-all duration-200 ease-in-out;
        }

        :global(.react-grid-item.react-grid-item--dragging) {
          @apply z-50 shadow-lg;
        }

        :global(.react-grid-item.react-grid-item--resizing) {
          @apply z-40;
        }

        /* Адаптивные стили для мобильных устройств */
        @media (max-width: 768px) {
          :global(.react-grid-layout) {
            margin: 0 -5px;
          }

          :global(.react-grid-item) {
            margin: 5px;
          }
        }

        /* Улучшенные стили для handles */
        :global(.react-resizable-handle-se) {
          @apply bg-brand-400 w-3 h-3 rounded-tl-lg;
        }

        :global(.react-resizable-handle-e) {
          @apply bg-brand-400 w-2 rounded-l-lg;
        }

        :global(.react-resizable-handle-s) {
          @apply bg-brand-400 h-2 rounded-t-lg;
        }
      `}</style>
    </div>
  );
}

// Экспортируем также типы и константы для использования в других компонентах
export { BREAKPOINTS, COLUMNS, ROW_HEIGHT };
export type { ResponsiveGridLayoutProps };
