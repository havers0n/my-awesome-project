import { useState, useCallback, useEffect } from 'react';
import PageMeta from "@/components/common/PageMeta";
import { useDashboardPersistence } from '@/features/dashboard/hooks/useDashboardPersistence';
import { useDashboardLayout } from '@/features/dashboard/hooks/useDashboardLayout';
import DashboardControls from '@/features/dashboard/components/DashboardControls';
import DashboardGrid from '@/features/dashboard/components/DashboardGrid';
import AddWidgetModal from '@/features/dashboard/components/AddWidgetModal';
import { WIDGET_REGISTRY } from '@/features/dashboard/widgetRegistry';
import { DEFAULT_DASHBOARD_CONFIG } from '@/features/dashboard/types/dashboard.types';

export default function CustomizableDashboard() {
  console.log('🚀 [CustomizableDashboard] Component rendered');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Хук для работы с localStorage
  const { config, saveConfig, resetConfig, isLoading, error } = useDashboardPersistence();
  console.log('📊 [CustomizableDashboard] Persistence state:', { 
    config: config,
    configLayout: config.layout,
    configWidgets: config.widgets,
    isLoading, 
    error 
  });

  // Хук для управления макетом
  const {
    layout,
    updateLayout,
    addWidget,
    removeWidget,
  } = useDashboardLayout({
    layout: config.layout,
    widgets: config.widgets,
    onLayoutChange: (newLayout) => {
      console.log('📝 [CustomizableDashboard] Layout changed:', newLayout);
      const newConfig = { ...config, layout: newLayout };
      console.log('📝 [CustomizableDashboard] New config after layout change:', newConfig);
      saveConfig(newConfig);
      setHasUnsavedChanges(false);
    },
    onWidgetsChange: (newWidgets) => {
      console.log('🔧 [CustomizableDashboard] Widgets changed:', newWidgets);
      const newConfig = { ...config, widgets: newWidgets };
      console.log('🔧 [CustomizableDashboard] New config after widgets change:', newConfig);
      saveConfig(newConfig);
      setHasUnsavedChanges(false);
    },
  });

  console.log('🎯 [CustomizableDashboard] Layout state:', { 
    layout: layout, 
    widgets: config.widgets,
    layoutLength: layout.length,
    widgetsCount: Object.keys(config.widgets).length
  });

  // Проверяем доступность виджетов
  useEffect(() => {
    console.log('🔍 [CustomizableDashboard] Widget registry check:', WIDGET_REGISTRY);
    console.log('🎨 [CustomizableDashboard] Available widgets:', Object.keys(WIDGET_REGISTRY));
  }, []);

  // Обработчики событий
  const handleToggleEditMode = useCallback(() => {
    console.log('🎮 [CustomizableDashboard] Toggle edit mode:', !isEditMode);
    setIsEditMode(!isEditMode);
  }, [isEditMode]);

  const handleAddWidget = useCallback(() => {
    console.log('➕ [CustomizableDashboard] Open add widget modal');
    setIsAddWidgetModalOpen(true);
  }, []);

  const handleAddWidgetConfirm = useCallback((widgetType: string) => {
    console.log('🎯 [CustomizableDashboard] Add widget confirmed:', widgetType);
    console.log('🎯 [CustomizableDashboard] Current state before adding:', {
      layout: layout,
      widgets: config.widgets,
      widgetType: widgetType
    });
    
    addWidget(widgetType);
    setIsAddWidgetModalOpen(false);
    setHasUnsavedChanges(true);
    
    console.log('🎯 [CustomizableDashboard] Widget add process completed');
  }, [addWidget, layout, config.widgets]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    console.log('🗑️ [CustomizableDashboard] Remove widget:', widgetId);
    removeWidget(widgetId);
    setHasUnsavedChanges(true);
  }, [removeWidget]);

  const handleSaveLayout = useCallback(() => {
    console.log('💾 [CustomizableDashboard] Save layout manually');
    // Сохранение уже происходит автоматически через хуки
    setHasUnsavedChanges(false);
  }, []);

  const handleResetLayout = useCallback(() => {
    if (confirm('Вы уверены, что хотите сбросить дашборд к настройкам по умолчанию? Все изменения будут потеряны.')) {
      console.log('🔄 [CustomizableDashboard] Reset layout to default');
      resetConfig();
      setHasUnsavedChanges(false);
      setIsEditMode(false);
    }
  }, [resetConfig]);

  const handleConfigWidget = useCallback((widgetId: string) => {
    console.log('⚙️ [CustomizableDashboard] Configure widget:', widgetId);
    // TODO: Открыть модальное окно настройки виджета
  }, []);

  // Показываем загрузку при инициализации
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Показываем ошибку, если есть
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2">Ошибка загрузки дашборда</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Кастомизируемый дашборд | Система управления"
        description="Настраиваемый дашборд с виджетами аналитики, продаж и управления запасами"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Панель управления */}
        <DashboardControls
          isEditMode={isEditMode}
          onToggleEditMode={handleToggleEditMode}
          onAddWidget={handleAddWidget}
          onResetLayout={handleResetLayout}
          onSaveLayout={handleSaveLayout}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Основная область дашборда */}
        <div className="flex-1">
          {/* Инструкции для пользователя */}
          {isEditMode && layout.length === 0 && (
            <div className="p-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-900 dark:text-blue-100 font-medium mb-2">
                  Начните настройку дашборда
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Нажмите кнопку "Добавить виджет" чтобы добавить первый виджет на дашборд. 
                  Вы можете перетаскивать виджеты для изменения их порядка.
                </p>
              </div>
            </div>
          )}

          {/* Сетка дашборда */}
          <DashboardGrid
            layout={layout}
            widgets={config.widgets}
            isEditMode={isEditMode}
            onLayoutChange={updateLayout}
            onRemoveWidget={handleRemoveWidget}
            onConfigWidget={handleConfigWidget}
          />
        </div>

        {/* Модальное окно добавления виджета */}
        <AddWidgetModal
          isOpen={isAddWidgetModalOpen}
          onClose={() => {
            console.log('❌ [CustomizableDashboard] Close add widget modal');
            setIsAddWidgetModalOpen(false);
          }}
          onAddWidget={handleAddWidgetConfirm}
          availableWidgets={WIDGET_REGISTRY}
        />
      </div>
    </>
  );
} 