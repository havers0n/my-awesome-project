// Базовые типы для виджетов
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  layout: WidgetLayout;
  data?: any;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: Date;
}

// Типы виджетов
export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  METRIC = 'metric',
  TEXT = 'text',
  IMAGE = 'image',
  CALENDAR = 'calendar',
  TASK_LIST = 'task-list',
  WEATHER = 'weather',
  NEWS = 'news',
  CUSTOM = 'custom',
}

// Конфигурация виджета
export interface WidgetConfig {
  refreshInterval?: number; // в миллисекундах
  theme?: 'light' | 'dark' | 'auto';
  showHeader?: boolean;
  showFooter?: boolean;
  customStyles?: Record<string, any>;
  dataSource?: DataSource;
  chartConfig?: ChartConfig;
  tableConfig?: TableConfig;
  metricConfig?: MetricConfig;
}

// Источник данных
export interface DataSource {
  type: 'api' | 'static' | 'realtime';
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  transformData?: (data: any) => any;
}

// Конфигурация графика
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  animations?: boolean;
  responsive?: boolean;
  height?: number;
  options?: Record<string, any>;
}

// Конфигурация таблицы
export interface TableConfig {
  columns: TableColumn[];
  pagination?: boolean;
  pageSize?: number;
  sorting?: boolean;
  filtering?: boolean;
  search?: boolean;
  selectable?: boolean;
  expandable?: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'action';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

// Конфигурация метрики
export interface MetricConfig {
  unit?: string;
  precision?: number;
  showTrend?: boolean;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  colorScheme?: 'success' | 'warning' | 'error' | 'info';
  format?: 'number' | 'currency' | 'percentage';
}

// Layout для виджета
export interface WidgetLayout {
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

// Dashboard типы
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layout: DashboardLayout;
  settings: DashboardSettings;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  isPublic?: boolean;
  tags?: string[];
}

// Layout для dashboard
export interface DashboardLayout {
  cols: number;
  rows: number;
  margin: [number, number];
  containerPadding: [number, number];
  rowHeight: number;
  breakpoints: Record<string, number>;
  layouts: Record<string, WidgetLayout[]>;
}

// Настройки dashboard
export interface DashboardSettings {
  theme: 'light' | 'dark' | 'auto';
  autoRefresh: boolean;
  refreshInterval: number;
  showGrid: boolean;
  snapToGrid: boolean;
  compactType: 'vertical' | 'horizontal' | null;
  preventCollision: boolean;
  allowOverlap: boolean;
  useCSSTransforms: boolean;
  animations: boolean;
}

// Drag and Drop типы
export interface DragItem {
  id: string;
  type: string;
  widgetType?: WidgetType;
  data?: any;
}

export interface DropResult {
  draggedId: string;
  targetId?: string;
  newPosition?: { x: number; y: number };
  newLayout?: WidgetLayout;
}

// События виджетов
export interface WidgetEvent {
  type: WidgetEventType;
  widgetId: string;
  data?: any;
  timestamp: Date;
}

export enum WidgetEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  MOVED = 'moved',
  RESIZED = 'resized',
  REFRESHED = 'refreshed',
  ERROR = 'error',
}

// Состояние dashboard
export interface DashboardState {
  currentDashboard: Dashboard | null;
  widgets: Widget[];
  layout: DashboardLayout;
  settings: DashboardSettings;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  selectedWidget: string | null;
  draggedWidget: DragItem | null;
}

// Действия для dashboard
export interface DashboardAction {
  type: DashboardActionType;
  payload?: any;
}

export enum DashboardActionType {
  LOAD_DASHBOARD = 'LOAD_DASHBOARD',
  SET_DASHBOARD = 'SET_DASHBOARD',
  ADD_WIDGET = 'ADD_WIDGET',
  UPDATE_WIDGET = 'UPDATE_WIDGET',
  DELETE_WIDGET = 'DELETE_WIDGET',
  MOVE_WIDGET = 'MOVE_WIDGET',
  RESIZE_WIDGET = 'RESIZE_WIDGET',
  SELECT_WIDGET = 'SELECT_WIDGET',
  TOGGLE_EDIT_MODE = 'TOGGLE_EDIT_MODE',
  UPDATE_LAYOUT = 'UPDATE_LAYOUT',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

// Типы для widget factory
export interface WidgetFactory {
  create: (type: WidgetType, config?: Partial<WidgetConfig>) => Widget;
  clone: (widget: Widget) => Widget;
  validate: (widget: Widget) => boolean;
  getDefaultConfig: (type: WidgetType) => WidgetConfig;
}

// Типы для widget registry
export interface WidgetRegistry {
  register: (type: WidgetType, component: React.ComponentType<any>) => void;
  get: (type: WidgetType) => React.ComponentType<any> | undefined;
  getAll: () => Map<WidgetType, React.ComponentType<any>>;
  unregister: (type: WidgetType) => void;
}

// Типы для data manager
export interface DataManager {
  fetch: (source: DataSource) => Promise<any>;
  subscribe: (source: DataSource, callback: (data: any) => void) => () => void;
  cache: Map<string, { data: any; timestamp: Date; ttl: number }>;
  clearCache: (key?: string) => void;
}

// Типы для theme
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Utility типы
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
