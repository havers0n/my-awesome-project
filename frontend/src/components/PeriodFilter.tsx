
import React, { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';

type Preset = number;
type PeriodValue = { preset?: Preset; custom?: { startDate: Date; endDate: Date } };

interface PeriodFilterProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const today = new Date();
  return (
    <div className="flex gap-2 mb-4 flex-wrap items-center relative">
      {[7, 30, 90].map(period => (
        <button
          key={period}
          className={`px-4 py-2 rounded ${value?.preset === period ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onChange({ preset: period })}
        >⏱️ {period} дней</button>
      ))}
      <button
        className={`px-4 py-2 rounded ${value?.custom ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => setOpen((v) => !v)}
      >📅 Свой период</button>
      <DateRangePicker
        open={open}
        onOpenChange={setOpen}
        value={value?.custom || { startDate: today, endDate: today }}
        onChange={range => onChange({ custom: range })}
      />
    </div>
  );
};
