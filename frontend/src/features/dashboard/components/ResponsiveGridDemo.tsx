import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Grid,
  Settings,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  Package,
  Zap,
  Info,
} from 'lucide-react';

import ResponsiveGridLayoutComponent from './ResponsiveGridLayout';
import { useResponsiveGrid } from '../hooks/useResponsiveGrid';
import { DEFAULT_DASHBOARD_CONFIG } from '../types/dashboard.types';

// Демонстрационные виджеты
const DEMO_WIDGETS = [
  { id: 'ecommerce-metrics', title: 'Метрики E-commerce', icon: BarChart3 },
  { id: 'monthly-sales-chart', title: 'График продаж', icon: TrendingUp },
  { id: 'inventory-alerts', title: 'Уведомления склада', icon: Package },
  { id: 'monthly-target', title: 'Месячные цели', icon: Zap },
];

export default function ResponsiveGridDemo() {
  const [showStats, setShowStats] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const {
    layout,
    widgets,
    currentBreakpoint,
    compactType,
    isEditMode,
    layouts,
    stats,
    setEditMode,
    setCompactType,
    updateLayout,
    updateLayouts,
    addWidget,
    removeWidget,
    resizeWidget,
    toggleWidgetVisibility,
    resetLayout,
    optimizeLayout,
  } = useResponsiveGrid({
    initialConfig: DEFAULT_DASHBOARD_CONFIG,
    autoSave: true,
    autoSaveDelay: 1000,
  });

  const handleAddWidget = useCallback(
    (widgetType: string) => {
      addWidget(widgetType);
    },
    [addWidget]
  );

  const handleLayoutChange = useCallback(
    (newLayout: any) => {
      updateLayout(newLayout);
    },
    [updateLayout]
  );

  const handleBreakpointChange = useCallback((breakpoint: string) => {
    console.log('Breakpoint changed to:', breakpoint);
  }, []);

  const handleToggleCompactType = useCallback(() => {
    if (compactType === 'vertical') {
      setCompactType('horizontal');
    } else if (compactType === 'horizontal') {
      setCompactType(null);
    } else {
      setCompactType('vertical');
    }
  }, [compactType, setCompactType]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Адаптивная сетка дашборда
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Демонстрация интеграции react-grid-layout с dnd-kit и Tailwind CSS
          </p>
        </div>

        {/* Панель управления */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Переключатель режима редактирования */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(!isEditMode)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    isEditMode
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <Settings className="w-4 h-4" />
                {isEditMode ? 'Выйти из редактирования' : 'Режим редактирования'}
              </button>
            </div>

            {/* Добавление виджетов */}
            {isEditMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Добавить:</span>
                {DEMO_WIDGETS.map(widget => (
                  <button
                    key={widget.id}
                    onClick={() => handleAddWidget(widget.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    title={widget.title}
                  >
                    <widget.icon className="w-3 h-3" />
                    {widget.title}
                  </button>
                ))}
              </div>
            )}

            {/* Утилиты */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Info className="w-4 h-4" />
                Статистика
              </button>

              {isEditMode && (
                <>
                  <button
                    onClick={optimizeLayout}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <Grid className="w-4 h-4" />
                    Оптимизировать
                  </button>

                  <button
                    onClick={resetLayout}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Сбросить
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Статистика */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalWidgets}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Всего виджетов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.visibleWidgets}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Видимых</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.hiddenWidgets}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Скрытых</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.layoutDensity.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Плотность</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Список виджетов (только в режиме редактирования) */}
        {isEditMode && Object.keys(widgets).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Управление виджетами
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(widgets).map(([widgetId, widget]) => (
                <div
                  key={widgetId}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-colors
                    ${
                      widget.visible
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${widget.visible ? 'bg-green-500' : 'bg-gray-400'}`}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {widget.widgetType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleWidgetVisibility(widgetId)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title={widget.visible ? 'Скрыть' : 'Показать'}
                    >
                      {widget.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeWidget(widgetId)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Адаптивная сетка */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ResponsiveGridLayoutComponent
            layout={layout}
            widgets={widgets}
            isEditMode={isEditMode}
            onLayoutChange={handleLayoutChange}
            onRemoveWidget={removeWidget}
            onResizeWidget={resizeWidget}
            className="min-h-[600px]"
          />
        </div>

        {/* Информация о breakpoints */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Информация о breakpoints
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">xxs (≤480px)</div>
              <div className="text-blue-700 dark:text-blue-300">2 колонки</div>
            </div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">xs (≤768px)</div>
              <div className="text-blue-700 dark:text-blue-300">4 колонки</div>
            </div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">sm (≤996px)</div>
              <div className="text-blue-700 dark:text-blue-300">6 колонок</div>
            </div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">md (≤1200px)</div>
              <div className="text-blue-700 dark:text-blue-300">10 колонок</div>
            </div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">lg (&gt;1200px)</div>
              <div className="text-blue-700 dark:text-blue-300">12 колонок</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-blue-800 dark:text-blue-200">
            <strong>Текущий breakpoint:</strong> {currentBreakpoint} |<strong> Компоновка:</strong>{' '}
            {compactType === 'vertical'
              ? 'Вертикальная'
              : compactType === 'horizontal'
                ? 'Горизонтальная'
                : 'Свободная'}
          </div>
        </div>
      </div>
    </div>
  );
}
