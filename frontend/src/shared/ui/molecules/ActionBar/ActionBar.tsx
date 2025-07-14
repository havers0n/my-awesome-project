import React, { ReactNode } from "react";

export interface ActionBarProps {
  /** Элементы действий */
  children: ReactNode;
  /** Выравнивание элементов */
  align?: 'left' | 'center' | 'right' | 'between' | 'around';
  /** Размер отступов */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Направление размещения */
  direction?: 'horizontal' | 'vertical';
  /** Фон панели */
  variant?: 'default' | 'elevated' | 'transparent';
  /** Дополнительные CSS классы */
  className?: string;
  /** Заголовок панели */
  title?: string;
  /** Описание панели */
  description?: string;
  /** Показывать разделитель */
  showDivider?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  children,
  align = 'left',
  spacing = 'md',
  direction = 'horizontal',
  variant = 'default',
  className = '',
  title,
  description,
  showDivider = false,
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const directionClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4',
    elevated:
      'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-4',
    transparent: 'bg-transparent p-2',
  };

  const baseClasses = `flex items-center ${alignClasses[align]} ${spacingClasses[spacing]} ${directionClasses[direction]} ${variantClasses[variant]} ${className}`;

  return (
    <div className={baseClasses}>
      {/* Header Section */}
      {(title || description) && (
        <div className={`${direction === 'horizontal' ? 'mr-auto' : 'mb-4'}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Divider */}
      {showDivider && (title || description) && (
        <div
          className={`${direction === 'horizontal' ? 'h-6 w-px bg-gray-200 dark:bg-gray-700' : 'w-full h-px bg-gray-200 dark:bg-gray-700'}`}
        />
      )}

      {/* Actions */}
      <div
        className={`flex items-center ${spacingClasses[spacing]} ${directionClasses[direction]}`}
      >
        {children}
      </div>
    </div>
  );
};

export default ActionBar;
