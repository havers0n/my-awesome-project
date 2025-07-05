import React from 'react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DateRangeValue {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, open, onOpenChange }) => {
  if (!open) return null;
  return (
    <div className="absolute z-50 bg-white shadow-lg rounded-lg p-2 mt-2">
      <DateRange
        ranges={[
          {
            startDate: value.startDate,
            endDate: value.endDate,
            key: 'selection',
          },
        ]}
        onChange={(ranges: RangeKeyDict) => {
          const sel = ranges.selection;
          // Закрывать только если выбраны обе даты и они разные
          if (sel.startDate && sel.endDate) {
            onChange({ startDate: sel.startDate, endDate: sel.endDate });
            if (sel.startDate.getTime() !== sel.endDate.getTime()) {
              onOpenChange(false);
            }
          }
        }}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={1}
        direction="horizontal"
        rangeColors={["#2563eb"]}
        editableDateInputs={true}
      />
    </div>
  );
};
