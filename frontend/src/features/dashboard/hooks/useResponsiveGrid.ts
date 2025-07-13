import { useState, useCallback, useMemo, useEffect } from 'react';
import { Layout as RGLLayout } from 'react-grid-layout';
import { DashboardLayoutItem, DashboardWidget, DashboardConfig } from '../types/dashboard.types';

// Константы для адаптивной сетки
export const GRID_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
} as const;

export const GRID_COLUMNS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
} as const;

export const GRID_ROW_HEIGHT = 30;
export const GRID_MARGIN: [number, number] = [10, 10];
export const GRID_CONTAINER_PADDING: [number, number] = [10, 10];

export type GridBreakpoint = keyof typeof GRID_BREAKPOINTS;
export type CompactType = 'vertical' | 'horizontal' | null;

interface UseResponsiveGridOptions {
  initialConfig?: DashboardConfig;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface UseResponsiveGridReturn {
  // Основные данные
  layout: DashboardLayoutItem[];
  widgets: Record<string, DashboardWidget>;

  // Состояние сетки
  currentBreakpoint: GridBreakpoint;
  compactType: CompactType;
  isEditMode: boolean;

  // Layouts для разных breakpoints
  layouts: { [key in GridBreakpoint]: RGLLayout[] };

  // Действия
  setEditMode: (enabled: boolean) => void;
  setCompactType: (type: CompactType) => void;
  updateLayout: (newLayout: DashboardLayoutItem[]) => void;
  updateLayouts: (newLayouts: { [key: string]: RGLLayout[] }) => void;
  addWidget: (widgetType: string, position?: { x: number; y: number }) => void;
  removeWidget: (widgetId: string) => void;
  resizeWidget: (widgetId: string, size: { w: number; h: number }) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  resetLayout: () => void;

  // Утилиты
  getWidgetPosition: (widgetId: string) => DashboardLayoutItem | null;
  getAvailablePosition: (size: { w: number; h: number }) => { x: number; y: number };
  optimizeLayout: () => void;

  // Статистика
  stats: {
    totalWidgets: number;
    visibleWidgets: number;
    hiddenWidgets: number;
    layoutDensity: number;
  };
}

export function useResponsiveGrid(options: UseResponsiveGridOptions = {}): UseResponsiveGridReturn {
  const { initialConfig, autoSave = false, autoSaveDelay = 1000 } = options;

  // Состояние
  const [config, setConfig] = useState<DashboardConfig>(
    initialConfig || {
      version: '1.0.0',
      layout: [],
      widgets: {},
      settings: {
        gridSize: 12,
        autoResize: true,
        theme: 'light',
      },
    }
  );

  const [currentBreakpoint, setCurrentBreakpoint] = useState<GridBreakpoint>('lg');
  const [compactType, setCompactType] = useState<CompactType>('vertical');
  const [isEditMode, setIsEditMode] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Мемоизированные значения
  const layout = useMemo(() => config.layout, [config.layout]);
  const widgets = useMemo(() => config.widgets, [config.widgets]);

  // Генерация layouts для разных breakpoints
  const layouts = useMemo(() => {
    const visibleLayout = layout.filter(item => {
      const widget = widgets[item.i];
      return widget && widget.visible;
    });

    const baseLayout: RGLLayout[] = visibleLayout.map(item => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: 2,
      minH: 2,
      maxW: 12,
      maxH: 20,
      isDraggable: isEditMode,
      isResizable: isEditMode,
      static: !isEditMode,
    }));

    return {
      lg: baseLayout,
      md: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, GRID_COLUMNS.md),
        x: Math.min(item.x, Math.max(0, GRID_COLUMNS.md - item.w)),
      })),
      sm: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, GRID_COLUMNS.sm),
        x: Math.min(item.x, Math.max(0, GRID_COLUMNS.sm - item.w)),
      })),
      xs: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, GRID_COLUMNS.xs),
        x: Math.min(item.x, Math.max(0, GRID_COLUMNS.xs - item.w)),
      })),
      xxs: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, GRID_COLUMNS.xxs),
        x: 0, // На маленьких экранах все в одну колонку
      })),
    };
  }, [layout, widgets, isEditMode]);

  // Статистика
  const stats = useMemo(() => {
    const totalWidgets = Object.keys(widgets).length;
    const visibleWidgets = Object.values(widgets).filter(w => w.visible).length;
    const hiddenWidgets = totalWidgets - visibleWidgets;

    // Расчет плотности layout (процент занятых ячеек)
    const totalCells =
      GRID_COLUMNS[currentBreakpoint] *
      Math.max(1, Math.max(...layout.map(item => item.y + item.h), 0));
    const occupiedCells = layout.reduce((sum, item) => sum + item.w * item.h, 0);
    const layoutDensity = totalCells > 0 ? (occupiedCells / totalCells) * 100 : 0;

    return {
      totalWidgets,
      visibleWidgets,
      hiddenWidgets,
      layoutDensity,
    };
  }, [widgets, layout, currentBreakpoint]);

  // Автосохранение
  useEffect(() => {
    if (autoSave) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const timeout = setTimeout(() => {
        console.log('Auto-saving grid configuration...');
        localStorage.setItem('dashboard-config', JSON.stringify(config));
      }, autoSaveDelay);

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [config, autoSave, autoSaveDelay]);

  // Обновление layout
  const updateLayout = useCallback((newLayout: DashboardLayoutItem[]) => {
    setConfig(prev => ({
      ...prev,
      layout: newLayout,
    }));
  }, []);

  // Обновление всех layouts
  const updateLayouts = useCallback(
    (newLayouts: { [key: string]: RGLLayout[] }) => {
      // Используем layout для текущего breakpoint
      const currentLayout = newLayouts[currentBreakpoint];
      if (currentLayout) {
        const mappedLayout: DashboardLayoutItem[] = currentLayout.map(item => ({
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        }));
        updateLayout(mappedLayout);
      }
    },
    [currentBreakpoint, updateLayout]
  );

  // Добавление виджета
  const addWidget = useCallback((widgetType: string, position?: { x: number; y: number }) => {
    const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Определяем размер по умолчанию
    const defaultSize = { w: 6, h: 4 };

    // Определяем позицию
    const widgetPosition = position || getAvailablePosition(defaultSize);

    const newLayoutItem: DashboardLayoutItem = {
      i: widgetId,
      x: widgetPosition.x,
      y: widgetPosition.y,
      w: defaultSize.w,
      h: defaultSize.h,
    };

    const newWidget: DashboardWidget = {
      id: widgetId,
      widgetType,
      config: {},
      visible: true,
    };

    setConfig(prev => ({
      ...prev,
      layout: [...prev.layout, newLayoutItem],
      widgets: {
        ...prev.widgets,
        [widgetId]: newWidget,
      },
    }));
  }, []);

  // Удаление виджета
  const removeWidget = useCallback((widgetId: string) => {
    setConfig(prev => {
      const newWidgets = { ...prev.widgets };
      delete newWidgets[widgetId];

      return {
        ...prev,
        layout: prev.layout.filter(item => item.i !== widgetId),
        widgets: newWidgets,
      };
    });
  }, []);

  // Изменение размера виджета
  const resizeWidget = useCallback((widgetId: string, size: { w: number; h: number }) => {
    setConfig(prev => ({
      ...prev,
      layout: prev.layout.map(item =>
        item.i === widgetId ? { ...item, w: size.w, h: size.h } : item
      ),
    }));
  }, []);

  // Переключение видимости виджета
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setConfig(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          visible: !prev.widgets[widgetId].visible,
        },
      },
    }));
  }, []);

  // Сброс layout
  const resetLayout = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      layout: [],
      widgets: {},
    }));
  }, []);

  // Получение позиции виджета
  const getWidgetPosition = useCallback(
    (widgetId: string): DashboardLayoutItem | null => {
      return layout.find(item => item.i === widgetId) || null;
    },
    [layout]
  );

  // Поиск доступной позиции
  const getAvailablePosition = useCallback(
    (size: { w: number; h: number }): { x: number; y: number } => {
      const cols = GRID_COLUMNS[currentBreakpoint];
      const occupied = new Set<string>();

      // Отмечаем занятые ячейки
      layout.forEach(item => {
        for (let y = item.y; y < item.y + item.h; y++) {
          for (let x = item.x; x < item.x + item.w; x++) {
            occupied.add(`${x},${y}`);
          }
        }
      });

      // Ищем свободное место
      for (let y = 0; y < 100; y++) {
        for (let x = 0; x <= cols - size.w; x++) {
          let canPlace = true;

          for (let dy = 0; dy < size.h && canPlace; dy++) {
            for (let dx = 0; dx < size.w && canPlace; dx++) {
              if (occupied.has(`${x + dx},${y + dy}`)) {
                canPlace = false;
              }
            }
          }

          if (canPlace) {
            return { x, y };
          }
        }
      }

      return { x: 0, y: 0 };
    },
    [layout, currentBreakpoint]
  );

  // Оптимизация layout
  const optimizeLayout = useCallback(() => {
    const optimizedLayout = [...layout].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    let currentY = 0;
    const cols = GRID_COLUMNS[currentBreakpoint];

    optimizedLayout.forEach(item => {
      let bestX = 0;
      let bestY = currentY;

      // Находим лучшую позицию для элемента
      for (let y = currentY; y < currentY + 10; y++) {
        for (let x = 0; x <= cols - item.w; x++) {
          const testPos = { x, y };
          const hasCollision = optimizedLayout.some(other => {
            if (other.i === item.i) return false;
            return !(
              testPos.x >= other.x + other.w ||
              testPos.x + item.w <= other.x ||
              testPos.y >= other.y + other.h ||
              testPos.y + item.h <= other.y
            );
          });

          if (!hasCollision) {
            bestX = x;
            bestY = y;
            break;
          }
        }
      }

      item.x = bestX;
      item.y = bestY;
      currentY = Math.max(currentY, bestY + item.h);
    });

    updateLayout(optimizedLayout);
  }, [layout, currentBreakpoint, updateLayout]);

  return {
    // Основные данные
    layout,
    widgets,

    // Состояние сетки
    currentBreakpoint,
    compactType,
    isEditMode,

    // Layouts для разных breakpoints
    layouts,

    // Действия
    setEditMode: setIsEditMode,
    setCompactType,
    updateLayout,
    updateLayouts,
    addWidget,
    removeWidget,
    resizeWidget,
    toggleWidgetVisibility,
    resetLayout,

    // Утилиты
    getWidgetPosition,
    getAvailablePosition,
    optimizeLayout,

    // Статистика
    stats,
  };
}
