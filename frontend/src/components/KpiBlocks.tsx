import React from 'react';

interface KpiBlocksProps {
  avgR2: number;
  avgMape: number;
}

const getR2Color = (r2: number) => {
  if (r2 >= 0.85) return 'bg-blue-500 text-white';
  if (r2 >= 0.7) return 'bg-yellow-400 text-gray-900';
  return 'bg-red-500 text-white';
};
const getMapeColor = (mape: number) => {
  if (mape <= 10) return 'bg-green-500 text-white';
  if (mape <= 20) return 'bg-yellow-400 text-gray-900';
  return 'bg-red-500 text-white';
};

export const KpiBlocks: React.FC<KpiBlocksProps> = ({ avgR2, avgMape }) => (
  <div className="mb-8">
    <div className="mb-4 flex items-center gap-2">
      <h2 className="text-lg font-semibold">Ключевые метрики</h2>
      <span className="ml-2 text-gray-400 text-sm">за выбранный период</span>
    </div>
    <div className="flex flex-col sm:flex-row gap-4">
      <div className={`flex-1 rounded-xl shadow p-6 flex items-center gap-4 ${getR2Color(avgR2)}`}>
        <span className="text-2xl"><i className="fas fa-chart-line" title="Коэффициент детерминации"></i></span>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg" title="Коэффициент детерминации — чем ближе к 1, тем лучше">R²</span>
            <span className="ml-1 cursor-help" title="Коэффициент детерминации — чем ближе к 1, тем лучше">
              <i className="fas fa-info-circle text-xs opacity-70"></i>
            </span>
          </div>
          <div className="text-2xl font-bold">{avgR2.toFixed(2)}</div>
        </div>
      </div>
      <div className={`flex-1 rounded-xl shadow p-6 flex items-center gap-4 ${getMapeColor(avgMape)}`}>
        <span className="text-2xl"><i className="fas fa-percentage" title="Средняя абсолютная процентная ошибка"></i></span>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg" title="Средняя абсолютная процентная ошибка">MAPE</span>
            <span className="ml-1 cursor-help" title="Средняя абсолютная процентная ошибка — чем меньше, тем лучше">
              <i className="fas fa-info-circle text-xs opacity-70"></i>
            </span>
          </div>
          <div className="text-2xl font-bold">{avgMape.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  </div>
);
