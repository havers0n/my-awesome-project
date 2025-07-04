import React from 'react';

interface PeriodFilterProps {
  value: number;
  onChange: (value: number) => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({ value, onChange }) => (
  <div className="flex gap-2 mb-4">
    {[7, 30, 90].map(period => (
      <button key={period} className={`px-4 py-2 rounded ${value === period ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => onChange(period)}>{period} дней</button>
    ))}
  </div>
);
