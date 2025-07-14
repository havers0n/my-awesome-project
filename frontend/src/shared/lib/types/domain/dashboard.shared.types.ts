export interface WidgetProps {
  id: string;
  title?: string;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
}

export interface DashboardLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  config: Record<string, any>;
  layout: DashboardLayout;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout[];
  settings: {
    theme: 'light' | 'dark';
    autoSave: boolean;
    gridSize: number;
    columns: number;
    margin: [number, number];
  };
}

export interface DashboardState {
  currentDashboard: DashboardConfig | null;
  dashboards: DashboardConfig[];
  isEditing: boolean;
  selectedWidget: string | null;
  isDragging: boolean;
  draggedWidget: DashboardWidget | null;
}

export interface DashboardActions {
  loadDashboard: (id: string) => Promise<void>;
  saveDashboard: (dashboard: DashboardConfig) => Promise<void>;
  createDashboard: (config: Omit<DashboardConfig, 'id'>) => Promise<string>;
  deleteDashboard: (id: string) => Promise<void>;
  addWidget: (widget: Omit<DashboardWidget, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (id: string) => void;
  updateLayout: (layout: DashboardLayout[]) => void;
  setEditMode: (isEditing: boolean) => void;
  selectWidget: (id: string | null) => void;
}

export interface DashboardMetrics {
  totalWidgets: number;
  activeWidgets: number;
  lastUpdated: string;
  averageLoadTime: number;
  errorCount: number;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  status: 'all' | 'active' | 'inactive';
  search: string;
}

export type DashboardTheme = 'light' | 'dark' | 'auto';

export interface DashboardSettings {
  theme: DashboardTheme;
  autoSave: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  gridSize: number;
  columns: number;
  margin: [number, number];
  compactType: 'vertical' | 'horizontal' | null;
  preventCollision: boolean;
  allowOverlap: boolean;
}

export interface WidgetType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultSize: {
    w: number;
    h: number;
  };
  configSchema: Record<string, any>;
  component: React.ComponentType<WidgetProps>;
}

export interface DashboardContextType {
  state: DashboardState;
  actions: DashboardActions;
  metrics: DashboardMetrics;
  filters: DashboardFilters;
  settings: DashboardSettings;
  widgetTypes: WidgetType[];
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  id: 'default',
  name: 'Основная панель',
  description: 'Главная панель управления',
  widgets: [],
  layout: [],
  settings: {
    theme: 'light',
    autoSave: true,
    gridSize: 10,
    columns: 12,
    margin: [10, 10],
  },
};

export interface UseDashboardPersistenceReturn {
  config: DashboardConfig;
  loading: boolean;
  error: string | null;
  saveConfig: (config: DashboardConfig) => Promise<void>;
  loadConfig: () => Promise<void>;
  clearConfig: () => void;
  exportConfig: () => string;
  importConfig: (jsonString: string) => Promise<void>;
}

export interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: Omit<DashboardWidget, 'id'>) => void;
}

export const WIDGET_CATEGORIES = [
  { id: 'analytics', name: 'Аналитика', icon: 'BarChart' },
  { id: 'charts', name: 'Графики', icon: 'PieChart' },
  { id: 'tables', name: 'Таблицы', icon: 'Table' },
  { id: 'metrics', name: 'Метрики', icon: 'Activity' },
  { id: 'reports', name: 'Отчеты', icon: 'FileText' },
  { id: 'media', name: 'Медиа', icon: 'Image' },
  { id: 'forms', name: 'Формы', icon: 'Edit' },
  { id: 'social', name: 'Социальные', icon: 'Users' },
] as const;
