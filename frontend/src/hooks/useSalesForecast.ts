import { useState } from 'react';
import { TimeMetric, SkuMetric, StoreMetric, MetricType, SliceType } from '../types.admin';

// Моки для front-only разработки
const mockTimeMetrics: TimeMetric[] = [
  { date: '2025-07-01', r2: 0.85, mape: 12.3 },
  { date: '2025-07-02', r2: 0.82, mape: 13.1 },
  { date: '2025-07-03', r2: 0.88, mape: 11.7 },
];
const mockSkuMetrics: SkuMetric[] = [
  { sku: 'SKU123', r2: 0.7, mape: 20.1 },
  { sku: 'SKU456', r2: 0.6, mape: 25.3 },
  { sku: 'SKU789', r2: 0.8, mape: 15.2 },
];
const mockStoreMetrics: StoreMetric[] = [
  { store: 'Store1', r2: 0.9, mape: 10.5 },
  { store: 'Store2', r2: 0.75, mape: 18.2 },
  { store: 'Store3', r2: 0.8, mape: 14.7 },
];

// period: number | { startDate: Date; endDate: Date }
export function useSalesForecast(slice: SliceType, period: number | { startDate: Date; endDate: Date }) {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Здесь можно добавить загрузку с API, используя period
  // Пока что моки не фильтруются по датам
  let data: TimeMetric[] | SkuMetric[] | StoreMetric[] = [];
  if (slice === 'time') data = mockTimeMetrics;
  if (slice === 'sku') data = mockSkuMetrics;
  if (slice === 'store') data = mockStoreMetrics;

  // KPI: средние значения по метрикам
  const avgR2 = data.length ? (data as any[]).reduce((sum, d) => sum + d.r2, 0) / data.length : 0;
  const avgMape = data.length ? (data as any[]).reduce((sum, d) => sum + d.mape, 0) / data.length : 0;

  return { data, loading, error, avgR2, avgMape };
}
