import React, { useState } from 'react';
import SalesForecastMetricsTab from '../pages/SalesForecastMetricsTab';

// Здесь должен быть импорт старого компонента страницы (до замены)
// Например: import OldSalesForecastPage from './OldSalesForecastPage';
// Для примера — просто placeholder:
const OldSalesForecastPage = () => (
  <div className="bg-white p-8 rounded shadow text-gray-500 text-center">
    {/* Здесь должен быть ваш старый функционал: тренд, топ-продукты, история и т.д. */}
    <div>Старый функционал страницы прогноза продаж (тренд, топ-продукты, история и т.д.)</div>
  </div>
);

const SalesForecastTabs: React.FC = () => {
  const [tab, setTab] = useState<'main' | 'metrics'>('main');
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${tab === 'main' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTab('main')}
        >
          Прогноз продаж
        </button>
        <button
          className={`px-4 py-2 rounded ${tab === 'metrics' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTab('metrics')}
        >
          Метрики качества
        </button>
      </div>
      {tab === 'main' && <OldSalesForecastPage />}
      {tab === 'metrics' && <SalesForecastMetricsTab />}
    </div>
  );
};

export default SalesForecastTabs;
