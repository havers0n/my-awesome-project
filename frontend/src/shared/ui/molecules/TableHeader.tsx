import React from "react";
import { Text } from "@/shared/ui/atoms";

interface TableHeaderColumn {
  id: string;
  label: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  width?: string;
  align?: 'left' | 'center' | 'right';
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
}

interface TableHeaderProps {
  columns: TableHeaderColumn[];
  variant?: 'default' | 'bordered' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  sticky?: boolean;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  variant = 'default',
  size = 'md',
  sticky = false,
  className = '',
}) => {
  const handleSort = (column: TableHeaderColumn) => {
    if (!column.sortable || !column.onSort) return;

    const nextDirection = column.sortDirection === 'asc' ? 'desc' : 'asc';
    column.onSort(column.id, nextDirection);
  };

  const getSortIcon = (sortDirection: 'asc' | 'desc' | null) => {
    if (!sortDirection) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <svg
          className="w-4 h-4 text-brand-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getHeaderClasses = () => {
    const baseClasses = 'select-none transition-colors';

    const sizeClasses = {
      sm: 'h-8 px-3 py-2',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 py-3',
    };

    const variantClasses = {
      default: 'bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
      bordered: 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      minimal: 'border-b border-gray-200 dark:border-gray-700',
    };

    const stickyClasses = sticky ? 'sticky top-0 z-10' : "";

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stickyClasses}`;
  };

  const getCellClasses = (column: TableHeaderColumn) => {
    const baseClasses = 'font-semibold text-gray-900 dark:text-gray-100';

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    const sortableClasses = column.sortable
      ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors'
      : "";

    return `${baseClasses} ${alignClasses[column.align || 'left']} ${sortableClasses}`;
  };

  const getCellStyle = (column: TableHeaderColumn) => {
    return column.width ? { width: column.width } : undefined;
  };

  return (
    <thead className={className}>
      <tr className={getHeaderClasses()}>
        {columns.map(column => (
          <th
            key={column.id}
            className={getCellClasses(column)}
            style={getCellStyle(column)}
            onClick={() => handleSort(column)}
          >
            <div className="flex items-center gap-2">
              <Text
                variant="label"
                size={size === 'lg' ? 'base' : 'sm'}
                weight="semibold"
                color="primary"
              >
                {column.label}
              </Text>
              {column.sortable && (
                <span className="flex items-center">
                  {getSortIcon(column.sortDirection || null)}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
