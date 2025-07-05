import React, { useState } from 'react';
import { useSalesForecast } from '../hooks/useSalesForecast';
import { KpiBlocks } from './KpiBlocks';
import { MetricSwitcher } from './MetricSwitcher';
import { SliceTabs } from './SliceTabs';
import { PeriodFilter } from './PeriodFilter';
import { ChartOrTableSwitcher } from './ChartOrTableSwitcher';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { Table } from './charts/Table';
import { Placeholder } from './charts/Placeholder';
import { MetricType, SliceType } from '../types.admin';
import { format } from 'date-fns';

// Type definitions for metrics data
interface TimeSeriesData {
  date: string;
  r2: number;
  mape: number;
  mae: number;
  rmse: number;
}

interface SkuData {
  sku: string;
  r2: number;
  mape: number;
  mae: number;
  rmse: number;
}

interface StoreData {
  store: string;
  r2: number;
  mape: number;
  mae: number;
  rmse: number;
}

type MetricsData = TimeSeriesData | SkuData | StoreData;

type PeriodValue = { preset?: number; custom?: { startDate: Date; endDate: Date } };

const getPeriodLabel = (period: PeriodValue) => {
  if (period?.preset) {
    if (period.preset === 1) return '1 день';
    if (period.preset < 5) return `${period.preset} дня`;
    return `${period.preset} дней`;
  }
  if (period?.custom) {
    const { startDate, endDate } = period.custom;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return '1 день';
    if (diff < 5) return `${diff + 1} дня`;
    if (diff < 21) return `${diff + 1} дней`;
    return `${format(startDate, 'd MMM yyyy')} – ${format(endDate, 'd MMM yyyy')}`;
  }
  return '';
};

const QualityMetricsDashboard: React.FC = () => {
  const [slice, setSlice] = useState<SliceType>('time');
  const [metric, setMetric] = useState<MetricType>('r2');
  const [period, setPeriod] = useState<PeriodValue>({ preset: 7 });
  const [view, setView] = useState<'chart' | 'table'>('chart');

  // Преобразуем period для передачи в useSalesForecast
  let periodParam: number | { startDate: Date; endDate: Date } = 7;
  if (period.preset) periodParam = period.preset;
  else if (period.custom) periodParam = period.custom;

  const { data, loading, error, avgR2, avgMape } = useSalesForecast(slice, periodParam);

  return (
    <div>
      <KpiBlocks avgR2={avgR2} avgMape={avgMape} />
      <div className="flex flex-wrap gap-2 mb-4">
        <SliceTabs value={slice} onChange={setSlice} />
        <MetricSwitcher value={metric} onChange={setMetric} />
        <PeriodFilter value={period} onChange={setPeriod} />
        <ChartOrTableSwitcher value={view} onChange={setView} />
      </div>
      <div className="mb-4 flex items-center gap-2 text-gray-500 text-sm">
        <span>Период анализа:</span>
        <span className="font-semibold text-gray-700">{getPeriodLabel(period)}</span>
        <span className="ml-2 cursor-help" title="Для коротких периодов точность прогноза ниже, чем для длинных — это нормально для любых моделей.">ℹ️</span>
      </div>
      {loading && <div>Загрузка...</div>}
      {error && <div className="text-red-500">Ошибка: {error}</div>}
      {!loading && !error && data.length === 0 && <Placeholder />}
      {!loading && !error && data.length > 0 && (
        <>
          {view === 'chart' && slice === 'time' && (
            <LineChart data={data as TimeSeriesData[]} metric={metric} />
          )}
          {view === 'chart' && slice === 'sku' && (
            <BarChart data={data as SkuData[]} metric={metric} xKey="sku" />
          )}
          {view === 'chart' && slice === 'store' && (
            <BarChart data={data as StoreData[]} metric={metric} xKey="store" />
          )}
          {view === 'table' && slice === 'sku' && (
            <Table data={data as SkuData[]} xKey="sku" />
          )}
          {view === 'table' && slice === 'store' && (
            <Table data={data as StoreData[]} xKey="store" />
          )}
        </>
      )}
    </div>
  );
};

export default QualityMetricsDashboard;
