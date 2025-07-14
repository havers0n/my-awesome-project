import React from 'react';
import { SliceType } from '../types.admin';

interface SliceTabsProps {
  value: SliceType;
  onChange: (value: SliceType) => void;
}

export const SliceTabs: React.FC<SliceTabsProps> = ({ value, onChange }) => (
  <div className="flex gap-2 mb-4">
    <button className={`px-4 py-2 rounded ${value === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => onChange('time')}>По времени</button>
    <button className={`px-4 py-2 rounded ${value === 'sku' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => onChange('sku')}>По товарам</button>
    <button className={`px-4 py-2 rounded ${value === 'store' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => onChange('store')}>По магазинам</button>
  </div>
);
