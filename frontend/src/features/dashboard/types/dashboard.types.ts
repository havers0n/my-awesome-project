import { ReactComponentElement } from 'react';

// Базовые типы для виджетов
export interface WidgetProps {
  id: string;
  config?: Record<string, any>;
  onConfigChange?: (config: Record<string, any>) => void;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  category: 'analytics' | 'sales' | 'inventory' | 'forecasting' | 'planning' | 'custom';
  component: React.ComponentType<WidgetProps>;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  configurable: boolean;
  icon: string;
  preview?: string;
}

// Типы для макета дашборда
export interface DashboardLayoutItem {
  i: string; // Изменено с id на i для совместимости с react-grid-layout
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardWidget {
  id: string;
  widgetType: string;
  config?: Record<string, any>;
  visible: boolean;
}

export interface DashboardSettings {
  gridSize: number;
  autoResize: boolean;
  theme: 'light' | 'dark';
}

export interface DashboardConfig {
  version: string;
  layout: DashboardLayoutItem[];
  widgets: Record<string, DashboardWidget>;
  settings: DashboardSettings;
}

// Типы для состояния дашборда
export interface DashboardState {
  config: DashboardConfig;
  isEditMode: boolean;
  selectedWidget: string | null;
  isDragging: boolean;
}

// Типы для хуков
export interface UseDashboardPersistenceReturn {
  config: DashboardConfig;
  saveConfig: (config: DashboardConfig) => void;
  resetConfig: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface UseDashboardLayoutReturn {
  layout: DashboardLayoutItem[];
  updateLayout: (newLayout: DashboardLayoutItem[]) => void;
  addWidget: (widgetType: string, position?: { x: number; y: number }) => void;
  removeWidget: (widgetId: string) => void;
  resizeWidget: (widgetId: string, size: { w: number; h: number }) => void;
}

// Типы для модальных окон
export interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string) => void;
  availableWidgets: WidgetDefinition[];
}

export interface WidgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: DashboardWidget | null;
  widgetDefinition: WidgetDefinition | null;
  onSave: (config: Record<string, any>) => void;
}

// Типы для категорий виджетов
export type WidgetCategory = 'analytics' | 'sales' | 'inventory' | 'forecasting' | 'planning' | 'custom';

export interface WidgetCategoryInfo {
  id: WidgetCategory;
  title: string;
  icon: string;
  color: string;
}

// Константы по умолчанию
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  version: '1.0.0',
  layout: [
    { i: 'default-widget-1', x: 0, y: 0, w: 12, h: 4 },
    { i: 'default-widget-2', x: 0, y: 4, w: 8, h: 6 },
    { i: 'default-widget-3', x: 8, y: 4, w: 4, h: 6 },
    { i: 'default-widget-4', x: 0, y: 10, w: 6, h: 8 },
    { i: 'default-widget-5', x: 6, y: 10, w: 6, h: 8 },
    { i: 'default-widget-6', x: 0, y: 18, w: 6, h: 8 },
    { i: 'default-widget-7', x: 6, y: 18, w: 6, h: 8 },
  ],
  widgets: {
    'default-widget-1': {
      id: 'default-widget-1',
      widgetType: 'ecommerce-metrics',
      config: {},
      visible: true,
    },
    'default-widget-2': {
      id: 'default-widget-2',
      widgetType: 'monthly-sales-chart',
      config: {},
      visible: true,
    },
    'default-widget-3': {
      id: 'default-widget-3',
      widgetType: 'monthly-target',
      config: {},
      visible: true,
    },
    'default-widget-4': {
      id: 'default-widget-4',
      widgetType: 'shelf-availability',
      config: {},
      visible: true,
    },
    'default-widget-5': {
      id: 'default-widget-5',
      widgetType: 'inventory-alerts',
      config: {},
      visible: true,
    },
    'default-widget-6': {
      id: 'default-widget-6',
      widgetType: 'sales-forecast',
      config: {},
      visible: true,
    },
    'default-widget-7': {
      id: 'default-widget-7',
      widgetType: 'tasks-overview',
      config: {},
      visible: true,
    },
  },
  settings: {
    gridSize: 12,
    autoResize: true,
    theme: 'light',
  },
};

export const WIDGET_CATEGORIES: WidgetCategoryInfo[] = [
  {
    id: 'analytics',
    title: 'Аналитика',
    icon: 'BarChart3',
    color: 'bg-blue-500',
  },
  {
    id: 'sales',
    title: 'Продажи',
    icon: 'TrendingUp',
    color: 'bg-green-500',
  },
  {
    id: 'inventory',
    title: 'Склад',
    icon: 'Package',
    color: 'bg-amber-500',
  },
  {
    id: 'forecasting',
    title: 'Прогнозирование',
    icon: 'BarChart3',
    color: 'bg-purple-500',
  },
  {
    id: 'planning',
    title: 'Планирование',
    icon: 'Target',
    color: 'bg-indigo-500',
  },
  {
    id: 'custom',
    title: 'Прочее',
    icon: 'Settings',
    color: 'bg-gray-500',
  },
]; 