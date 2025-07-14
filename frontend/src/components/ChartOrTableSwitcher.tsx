import React from 'react';

type ViewType = 'chart' | 'table';

interface ChartOrTableSwitcherProps {
  value: ViewType;
  onChange: (value: ViewType) => void;
}

export const ChartOrTableSwitcher: React.FC<ChartOrTableSwitcherProps> = ({ value, onChange }) => (
  <div className="flex gap-2 mb-4">
    <button className={`px-4 py-2 rounded ${value === 'chart' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => onChange('chart')}>График</button>
    <button className={`px-4 py-2 rounded ${value === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => onChange('table')}>Таблица</button>
  </div>
);
