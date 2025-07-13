import React from 'react';
import { TableHeader, TableRow, TableCell } from '../ui/table';

interface OrdersTableHeaderRowProps {
  /** Show checkboxes */
  showCheckboxes?: boolean;
  /** All items selected */
  allSelected?: boolean;
  /** Select all handler */
  onSelectAll?: (checked: boolean) => void;
  /** Custom column headers */
  headers?: string[];
  /** Additional CSS classes */
  className?: string;
}

const defaultHeaders = ['Товар', 'Категория', 'Цена', 'Статус'];

export const OrdersTableHeaderRow: React.FC<OrdersTableHeaderRowProps> = ({
  showCheckboxes = false,
  allSelected = false,
  onSelectAll,
  headers = defaultHeaders,
  className = '',
}) => {
  return (
    <TableHeader className={`border-gray-100 dark:border-gray-800 border-y ${className}`}>
      <TableRow>
        {showCheckboxes && (
          <TableCell
            isHeader
            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            width="48px"
          >
            <input
              type="checkbox"
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-brand-400"
              checked={allSelected}
              onChange={e => onSelectAll?.(e.target.checked)}
            />
          </TableCell>
        )}
        {headers.map((header, index) => (
          <TableCell
            key={index}
            isHeader
            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
          >
            {header}
          </TableCell>
        ))}
      </TableRow>
    </TableHeader>
  );
};

export default OrdersTableHeaderRow;
