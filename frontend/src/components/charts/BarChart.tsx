import React from 'react';
import { SkuMetric, StoreMetric, MetricType } from '../../types.admin';
// import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

type BarChartData = SkuMetric | StoreMetric;

interface BarChartProps {
  data: BarChartData[];
  metric: MetricType;
  xKey: 'sku' | 'store';
}

export const BarChart: React.FC<BarChartProps> = ({ data, metric, xKey }) => {
  // TODO: подключить Recharts и реализовать график
  return (
    <div className="bg-white rounded shadow p-4 mb-4 min-h-[300px] flex items-center justify-center">
      {/* <ResponsiveContainer width="100%" height={300}>
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={metric} fill="#8884d8" />
        </ReBarChart>
      </ResponsiveContainer> */}
      <span>BarChart (заглушка)</span>
    </div>
  );
};
