import React from 'react';
import { TimeMetric, MetricType } from '../../types.admin';
// import { LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: TimeMetric[];
  metric: MetricType;
}

export const LineChart: React.FC<LineChartProps> = ({ data, metric }) => {
  // TODO: подключить Recharts и реализовать график
  return (
    <div className="bg-white rounded shadow p-4 mb-4 min-h-[300px] flex items-center justify-center">
      {/* <ResponsiveContainer width="100%" height={300}>
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={metric} stroke="#8884d8" />
        </ReLineChart>
      </ResponsiveContainer> */}
      <span>LineChart (заглушка)</span>
    </div>
  );
};
