import React, { ReactNode } from 'react';

export interface TableRowItemProps {
  /** Содержимое ячеек строки */
  children: ReactNode;
  /** Обработчик клика на строку */
  onClick?: () => void;
  /** Состояние выделения */
  selected?: boolean;
  /** Состояние наведения */
  hoverable?: boolean;
  /** Вариант отображения */
  variant?: 'default' | 'striped' | 'bordered';
  /** Дополнительные CSS классы */
  className?: string;
  /** Состояние строки */
  status?: 'normal' | 'warning' | 'error' | 'success';
  /** Показывать чекбокс */
  showCheckbox?: boolean;
  /** Состояние чекбокса */
  checked?: boolean;
  /** Обработчик изменения чекбокса */
  onCheckedChange?: (checked: boolean) => void;
  /** Отключить строку */
  disabled?: boolean;
}

export const TableRowItem: React.FC<TableRowItemProps> = ({
  children,
  onClick,
  selected = false,
  hoverable = true,
  variant = 'default',
  className = '',
  status = 'normal',
  showCheckbox = false,
  checked = false,
  onCheckedChange,
  disabled = false,
}) => {
  const baseClasses = 'border-b border-gray-200 dark:border-gray-700 transition-colors';

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    striped: 'even:bg-gray-50 odd:bg-white dark:even:bg-gray-700 dark:odd:bg-gray-800',
    bordered: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
  };

  const statusClasses = {
    normal: '',
    warning: 'border-l-4 border-l-warning-400 bg-warning-50 dark:bg-warning-900/20',
    error: 'border-l-4 border-l-error-400 bg-error-50 dark:bg-error-900/20',
    success: 'border-l-4 border-l-success-400 bg-success-50 dark:bg-success-900/20',
  };

  const hoverClasses = hoverable && !disabled ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : '';
  const selectedClasses = selected
    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-700'
    : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const clickableClasses = onClick && !disabled ? 'cursor-pointer' : '';

  const finalClasses = `${baseClasses} ${variantClasses[variant]} ${statusClasses[status]} ${hoverClasses} ${selectedClasses} ${disabledClasses} ${clickableClasses} ${className}`;

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onCheckedChange && !disabled) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <tr className={finalClasses} onClick={handleClick}>
      {/* Checkbox Column */}
      {showCheckbox && (
        <td className="px-4 py-3 text-left">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleCheckboxChange}
            disabled={disabled}
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-brand-400"
          />
        </td>
      )}

      {/* Content Columns */}
      {children}
    </tr>
  );
};

// Компонент для ячейки таблицы с типизацией
export interface TableCellProps {
  /** Содержимое ячейки */
  children: ReactNode;
  /** Выравнивание содержимого */
  align?: 'left' | 'center' | 'right';
  /** Размер отступов */
  padding?: 'sm' | 'md' | 'lg';
  /** Дополнительные CSS классы */
  className?: string;
  /** Ширина ячейки */
  width?: string;
  /** Является ли ячейка заголовком */
  isHeader?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  padding = 'md',
  className = '',
  width,
  isHeader = false,
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const paddingClasses = {
    sm: 'px-2 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const Component = isHeader ? 'th' : 'td';
  const baseClasses = `${alignClasses[align]} ${paddingClasses[padding]} ${className}`;
  const headerClasses = isHeader
    ? 'font-semibold text-gray-900 dark:text-gray-100'
    : 'text-gray-700 dark:text-gray-300';

  return (
    <Component className={`${baseClasses} ${headerClasses}`} style={width ? { width } : undefined}>
      {children}
    </Component>
  );
};

export default TableRowItem;
