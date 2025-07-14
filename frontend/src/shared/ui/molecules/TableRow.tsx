import React from "react";
import { Text } from "@/shared/ui/atoms";

interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

interface TableRowProps {
  cells: TableCellProps[];
  isHeader?: boolean;
  isSelected?: boolean;
  isHoverable?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({
  cells,
  isHeader = false,
  isSelected = false,
  isHoverable = true,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const getRowClasses = () => {
    const baseClasses = 'transition-colors';
    const sizeClasses = {
      sm: 'h-10',
      md: 'h-12',
      lg: 'h-14',
    };

    const variantClasses = {
      default: isHeader
        ? 'bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'
        : 'border-b border-gray-200 dark:border-gray-700',
      striped: isHeader
        ? 'bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'
        : 'odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
      bordered: 'border border-gray-200 dark:border-gray-700',
    };

    const interactiveClasses =
      onClick || isHoverable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : "";
    const selectedClasses = isSelected
      ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
      : "";

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${interactiveClasses} ${selectedClasses} ${className}`;
  };

  const getCellClasses = (cell: TableCellProps) => {
    const baseClasses = 'px-4 py-2';
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return `${baseClasses} ${alignClasses[cell.align || 'left']} ${cell.className || ''}`;
  };

  const getCellStyle = (cell: TableCellProps) => {
    return cell.width ? { width: cell.width } : undefined;
  };

  const handleClick = () => {
    if (onClick && !isHeader) {
      onClick();
    }
  };

  return (
    <tr className={getRowClasses()} onClick={handleClick}>
      {cells.map((cell, index) => {
        const CellComponent = isHeader ? 'th' : 'td';

        return (
          <CellComponent key={index} className={getCellClasses(cell)} style={getCellStyle(cell)}>
            {typeof cell.children === 'string' ? (
              <Text
                variant={isHeader ? 'label' : 'span'}
                size={size === 'lg' ? 'base' : 'sm'}
                weight={isHeader ? 'semibold' : 'normal'}
                color={isHeader ? 'primary' : 'secondary'}
              >
                {cell.children}
              </Text>
            ) : (
              cell.children
            )}
          </CellComponent>
        );
      })}
    </tr>
  );
};

export default TableRow;
