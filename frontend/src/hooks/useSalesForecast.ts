import { useState, useEffect } from 'react';
import { TimeMetric, SkuMetric, StoreMetric, MetricType, SliceType } from '../types.admin';
import { fetchQualityMetricsBySlice } from '../api/forecast';

// Моки для front-only разработки и fallback
const mockTimeMetrics: TimeMetric[] = [
  { date: '2025-07-01', r2: 0.85, mape: 12.3, mae: 5.4, rmse: 7.3 },
  { date: '2025-07-02', r2: 0.82, mape: 13.1, mae: 5.8, rmse: 7.6 },
  { date: '2025-07-03', r2: 0.88, mape: 11.7, mae: 5.1, rmse: 7.0 },
];
const mockSkuMetrics: SkuMetric[] = [
  { sku: 'SKU123', r2: 0.7, mape: 20.1, mae: 8.2, rmse: 10.5 },
  { sku: 'SKU456', r2: 0.6, mape: 25.3, mae: 9.1, rmse: 11.8 },
  { sku: 'SKU789', r2: 0.8, mape: 15.2, mae: 6.3, rmse: 8.9 },
];
const mockStoreMetrics: StoreMetric[] = [
  { store: 'Store1', r2: 0.9, mape: 10.5, mae: 4.2, rmse: 6.1 },
  { store: 'Store2', r2: 0.75, mape: 18.2, mae: 7.8, rmse: 9.3 },
  { store: 'Store3', r2: 0.8, mape: 14.7, mae: 6.1, rmse: 8.2 },
];

// period: number | { startDate: Date; endDate: Date }
export function useSalesForecast(slice: SliceType, period: number | { startDate: Date; endDate: Date }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TimeMetric[] | SkuMetric[] | StoreMetric[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchQualityMetricsBySlice(slice, period);
        setData(response.data);
      } catch (error) {
        console.warn('API error, using mock data:', error);
        // Fallback to mock data on API failure
        if (slice === 'time') setData(mockTimeMetrics);
        if (slice === 'sku') setData(mockSkuMetrics);
        if (slice === 'store') setData(mockStoreMetrics);
        setError('Failed to fetch data, using mock data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slice, period]);

  // KPI: средние значения по метрикам
  const avgR2 = data.length ? data.reduce((sum, d) => sum + d.r2, 0) / data.length : 0;
  const avgMape = data.length ? data.reduce((sum, d) => sum + d.mape, 0) / data.length : 0;
  const avgMae = data.length ? data.reduce((sum, d) => sum + (d as any).mae, 0) / data.length : 0;
  const avgRmse = data.length ? data.reduce((sum, d) => sum + (d as any).rmse, 0) / data.length : 0;

  return { data, loading, error, avgR2, avgMape, avgMae, avgRmse };
}
