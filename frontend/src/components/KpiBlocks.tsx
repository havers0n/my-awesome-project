import React from 'react';

interface KpiBlocksProps {
  avgR2: number;
  avgMape: number;
}

export const KpiBlocks: React.FC<KpiBlocksProps> = ({ avgR2, avgMape }) => (
  <div className="flex gap-4 mb-4">
    <div className="bg-white rounded shadow p-4">R²: {avgR2}</div>
    <div className="bg-white rounded shadow p-4">MAPE: {avgMape}%</div>
  </div>
);
