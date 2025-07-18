export enum ProductStatus {
  InStock = 'В наличии',
  LowStock = 'Мало',
  OutOfStock = 'Нет в наличии',
}

export interface HistoryEntry {
  id: string;
  date: string; // ISO 8601 format
  type: 'Поступление' | 'Списание' | 'Коррекция' | 'Отчет о нехватке';
  change: number; // Positive for additions, negative for subtractions
  newQuantity: number;
}

export interface StockByLocation {
  location_id: number;
  location_name: string;
  stock: number;
}

export interface Product {
  product_id: number;
  product_name: string;
  price: number;
  sku: string;
  stock_by_location: StockByLocation[];
}

export interface ProductSnapshot {
  avgSales7d: number;
  avgSales30d: number;
  salesLag1d: number;
}

// --- Sales Forecast Types ---

export enum ForecastAccuracy {
  High = 'Высокая',
  Medium = 'Средняя',
  Low = 'Низкая',
}

export interface Forecast {
  id: string;
  date: string; // ISO 8601 format
  productName: string;
  category: string;
  forecastedQuantity: number;
  mape: number | null;
  mae: number | null;
}

export interface ForecastData {
  forecasts: Forecast[];
  metrics: {
    mape: number;
    mae: number;
  };
  historyEntry: Forecast;
  totalForecastedQuantity: number;
}

export interface ComparativeForecastItem {
  productName: string;
  totalForecast: number;
  mape: number | null;
  mae: number | null;
  color: string; // Color for the chart line/table row
}

export type ComparativeForecastData = ComparativeForecastItem[];

// --- Quality Metrics Types ---
export interface OverallMetrics {
  avgMape: number;
  avgMae: number;
}

// --- Analytics Types ---
export interface ItemMetrics {
  productId: string;
  mape: number;
  mae: number;
}

export interface AbcDataItem {
  product: Product;
  salesVolume: number;
  percentage: number;
  cumulativePercentage: number;
  class: 'A' | 'B' | 'C';
}

export interface AbcAnalysisData {
  items: AbcDataItem[];
  classCounts: { A: number; B: number; C: number };
  classVolume: { A: number; B: number; C: number };
}

export interface XyzDataItem {
  product: Product;
  mape: number;
  class: 'X' | 'Y' | 'Z';
}

export interface XyzAnalysisData {
  items: XyzDataItem[];
  classCounts: { X: number; Y: number; Z: number };
} 