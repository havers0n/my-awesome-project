import React from 'react';
import { SkuMetric, StoreMetric, MetricType } from '../../types.admin';

type TableData = SkuMetric | StoreMetric;

interface TableProps {
  data: TableData[];
  metric: MetricType;
  xKey: 'sku' | 'store';
}

export const Table: React.FC<TableProps> = ({ data, metric, xKey }) => (
  <div className="bg-white rounded shadow p-4 mb-4 overflow-x-auto">
    <table className="min-w-full">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left">{xKey === 'sku' ? 'Товар' : 'Магазин'}</th>
          <th className="px-4 py-2 text-left">R²</th>
          <th className="px-4 py-2 text-left">MAPE</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td className="px-4 py-2">{row[xKey]}</td>
            <td className="px-4 py-2">{row.r2}</td>
            <td className="px-4 py-2">{row.mape}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
