import React from 'react';
import { MetricType } from '../types.admin';

interface MetricSwitcherProps {
  value: MetricType;
  onChange: (value: MetricType) => void;
}

export const MetricSwitcher: React.FC<MetricSwitcherProps> = ({ value, onChange }) => (
  <div className="flex gap-2 mb-4">
    <button className={`px-4 py-2 rounded ${value === 'r2' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => onChange('r2')}>R²</button>
    <button className={`px-4 py-2 rounded ${value === 'mape' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => onChange('mape')}>MAPE</button>
  </div>
);
