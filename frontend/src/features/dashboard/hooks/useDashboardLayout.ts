import { useCallback } from 'react';
import { DashboardLayoutItem, DashboardWidget, UseDashboardLayoutReturn } from '../types/dashboard.types';
import { getWidgetById } from '../widgetRegistry';

interface UseDashboardLayoutProps {
  layout: DashboardLayoutItem[];
  widgets: Record<string, DashboardWidget>;
  onLayoutChange: (layout: DashboardLayoutItem[]) => void;
  onWidgetsChange: (widgets: Record<string, DashboardWidget>) => void;
}

export function useDashboardLayout({
  layout,
  widgets,
  onLayoutChange,
  onWidgetsChange,
}: UseDashboardLayoutProps): UseDashboardLayoutReturn {

  // Обновление макета
  const updateLayout = useCallback((newLayout: DashboardLayoutItem[]) => {
    onLayoutChange(newLayout);
  }, [onLayoutChange]);

  // Добавление нового виджета
  const addWidget = useCallback((widgetType: string, position?: { x: number; y: number }) => {
    console.log('🔥 [useDashboardLayout] START addWidget');
    console.log('🔥 [useDashboardLayout] Widget type:', widgetType);
    console.log('🔥 [useDashboardLayout] Current layout:', layout);
    console.log('🔥 [useDashboardLayout] Current widgets:', widgets);
    
    const widgetDefinition = getWidgetById(widgetType);
    if (!widgetDefinition) {
      console.error('❌ [useDashboardLayout] Widget type not found:', widgetType);
      return;
    }

    console.log('✅ [useDashboardLayout] Widget definition found:', widgetDefinition);

    const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 [useDashboardLayout] Generated widget ID:', widgetId);
    
    // Находим свободное место в сетке
    const { x, y } = position || findFreePosition(layout, widgetDefinition.defaultSize);
    console.log('📍 [useDashboardLayout] Widget position:', { x, y });

    // Создаем новый элемент макета
    const newLayoutItem: DashboardLayoutItem = {
      i: widgetId, // Изменено с id на i
      x,
      y,
      w: widgetDefinition.defaultSize.w,
      h: widgetDefinition.defaultSize.h,
    };

    // Создаем новый виджет
    const newWidget: DashboardWidget = {
      id: widgetId,
      widgetType,
      config: {},
      visible: true,
    };

    console.log('📦 [useDashboardLayout] New layout item:', newLayoutItem);
    console.log('🎯 [useDashboardLayout] New widget:', newWidget);

    // Обновляем состояние
    const newLayout = [...layout, newLayoutItem];
    const newWidgets = { ...widgets, [widgetId]: newWidget };
    
    console.log('📊 [useDashboardLayout] Final layout:', newLayout);
    console.log('🔧 [useDashboardLayout] Final widgets:', newWidgets);
    
    console.log('🚀 [useDashboardLayout] Calling onLayoutChange...');
    onLayoutChange(newLayout);
    
    console.log('🚀 [useDashboardLayout] Calling onWidgetsChange...');
    onWidgetsChange(newWidgets);
    
    console.log('✅ [useDashboardLayout] END addWidget');
  }, [layout, widgets, onLayoutChange, onWidgetsChange]);

  // Удаление виджета
  const removeWidget = useCallback((widgetId: string) => {
    const newLayout = layout.filter(item => item.i !== widgetId); // Изменено с id на i
    const newWidgets = { ...widgets };
    delete newWidgets[widgetId];

    onLayoutChange(newLayout);
    onWidgetsChange(newWidgets);
  }, [layout, widgets, onLayoutChange, onWidgetsChange]);

  // Изменение размера виджета
  const resizeWidget = useCallback((widgetId: string, size: { w: number; h: number }) => {
    const newLayout = layout.map(item => 
      item.i === widgetId  // Изменено с id на i
        ? { ...item, w: size.w, h: size.h }
        : item
    );
    onLayoutChange(newLayout);
  }, [layout, onLayoutChange]);

  return {
    layout,
    updateLayout,
    addWidget,
    removeWidget,
    resizeWidget,
  };
}

// Функция для поиска свободного места в сетке
function findFreePosition(
  layout: DashboardLayoutItem[], 
  size: { w: number; h: number }
): { x: number; y: number } {
  const gridWidth = 12; // Ширина сетки
  
  // Начинаем поиск с позиции (0, 0)
  for (let y = 0; y < 100; y++) { // Ограничиваем поиск 100 строками
    for (let x = 0; x <= gridWidth - size.w; x++) {
      const position = { x, y };
      
      // Проверяем, не пересекается ли новый виджет с существующими
      const isPositionFree = !layout.some(item => 
        isOverlapping(
          { x, y, w: size.w, h: size.h },
          { x: item.x, y: item.y, w: item.w, h: item.h }
        )
      );
      
      if (isPositionFree) {
        return position;
      }
    }
  }
  
  // Если не нашли свободное место, возвращаем позицию в конце
  const maxY = Math.max(...layout.map(item => item.y + item.h), 0);
  return { x: 0, y: maxY };
}

// Функция для проверки пересечения двух прямоугольников
function isOverlapping(
  rect1: { x: number; y: number; w: number; h: number },
  rect2: { x: number; y: number; w: number; h: number }
): boolean {
  return !(
    rect1.x + rect1.w <= rect2.x ||
    rect2.x + rect2.w <= rect1.x ||
    rect1.y + rect1.h <= rect2.y ||
    rect2.y + rect2.h <= rect1.y
  );
} 