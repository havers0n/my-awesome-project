import React, { useState } from 'react';
import { useSalesForecast } from '../hooks/useSalesForecast';
import { KpiBlocks } from '../components/KpiBlocks';
import { MetricSwitcher } from '../components/MetricSwitcher';
import { SliceTabs } from '../components/SliceTabs';
import { PeriodFilter } from '../components/PeriodFilter';
import { ChartOrTableSwitcher } from '../components/ChartOrTableSwitcher';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { Table } from '../components/charts/Table';
import { Placeholder } from '../components/charts/Placeholder';
import { MetricType, SliceType } from '../types.admin';

const SalesForecastMetricsTab: React.FC = () => {
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

export default SalesForecastMetricsTab;
