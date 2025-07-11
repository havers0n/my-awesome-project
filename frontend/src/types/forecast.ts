export interface ForecastData {
  trend: {
    points: TrendPoint[];
  };
  topProducts: TopProduct[];
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TopProduct {
  name: string;
  amount: number;
  barWidth: string;
  colorClass: string;
}

export interface ForecastHistoryItem {
  date: string;
  product: string;
  category: string;
  forecast: number;
  accuracy: 'Высокая' | 'Средняя' | 'Низкая';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadState {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  filename?: string;
  error?: string;
}

export interface AnimationConfig {
  duration: number;
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
}

export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  animate?: boolean;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// WebSocket статусы для real-time обратной связи
export interface ProcessingStatus {
  stage: 'idle' | 'parsing' | 'processing' | 'forecasting' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
  timestamp: number;
  details?: string;
}

// Метрики качества прогноза
export interface QualityMetrics {
  mape?: number; // Mean Absolute Percentage Error
  mae?: number;  // Mean Absolute Error
  rmse?: number; // Root Mean Square Error
  r2?: number;   // R-squared
  confidence?: number; // Уровень достоверности (0-100)
  dataQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations?: string[];
}

// Данные для скачивания в Excel
export interface ExcelExportData {
  trendData: TrendPoint[];
  topProducts: TopProduct[];
  qualityMetrics: QualityMetrics;
  timestamp: string;
  period: string;
}

// Данные для сравнения с предыдущими прогнозами
export interface ForecastComparison {
  current: ForecastData;
  previous: ForecastData | null;
  changes: {
    trend: 'up' | 'down' | 'stable';
    percentage: number;
    topProductsChanged: boolean;
  };
}

// Tooltip данные
export interface TooltipData {
  title: string;
  description: string;
  examples?: string[];
  links?: { text: string; url: string }[];
}
