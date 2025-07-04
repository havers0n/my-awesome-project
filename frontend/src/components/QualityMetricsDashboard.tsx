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

const QualityMetricsDashboard: React.FC = () => {
  const [slice, setSlice] = useState<SliceType>('time');
  const [metric, setMetric] = useState<MetricType>('r2');
  const [period, setPeriod] = useState<number>(7);
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const { data, loading, error, avgR2, avgMape } = useSalesForecast(slice, period);

  return (
    <div>
      <KpiBlocks avgR2={avgR2} avgMape={avgMape} />
      <div className="flex flex-wrap gap-2 mb-4">
        <SliceTabs value={slice} onChange={setSlice} />
        <MetricSwitcher value={metric} onChange={setMetric} />
        <PeriodFilter value={period} onChange={setPeriod} />
        <ChartOrTableSwitcher value={view} onChange={setView} />
      </div>
      {loading && <div>Загрузка...</div>}
      {error && <div className="text-red-500">Ошибка: {error}</div>}
      {!loading && !error && data.length === 0 && <Placeholder />}
      {!loading && !error && data.length > 0 && (
        <>
          {view === 'chart' && slice === 'time' && (
            <LineChart data={data as any[]} metric={metric} />
          )}
          {view === 'chart' && slice === 'sku' && (
            <BarChart data={data as any[]} metric={metric} xKey="sku" />
          )}
          {view === 'chart' && slice === 'store' && (
            <BarChart data={data as any[]} metric={metric} xKey="store" />
          )}
          {view === 'table' && slice === 'sku' && (
            <Table data={data as any[]} metric={metric} xKey="sku" />
          )}
          {view === 'table' && slice === 'store' && (
            <Table data={data as any[]} metric={metric} xKey="store" />
          )}
        </>
      )}
    </div>
  );
};

export default QualityMetricsDashboard;
