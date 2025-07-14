import React from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Badge } from "../atoms/Badge";
import { Text } from "../atoms/Typography";
import { IconName } from "@/helpers/icons";

export interface FilterButtonProps {
  /** Текст кнопки */
  label: string;
  /** Имя иконки */
  iconName: IconName;
  /** Обработчик клика */
  onClick: () => void;
  /** Активное состояние */
  active?: boolean;
  /** Количество активных фильтров */
  count?: number;
  /** Размер кнопки */
  size?: 'sm' | 'md' | 'lg';
  /** Вариант отображения */
  variant?: 'default' | 'filled' | 'outlined';
  /** Отключить кнопку */
  disabled?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
  /** Показывать индикатор загрузки */
  loading?: boolean;
  /** Расположение иконки */
  iconPosition?: 'left' | 'right';
  /** Размер иконки */
  iconSize?: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  iconName,
  onClick,
  active = false,
  count,
  size = 'md',
  variant = 'default',
  disabled = false,
  className = '',
  loading = false,
  iconPosition = 'left',
  iconSize = 4,
}) => {
  // Определяем вариант кнопки на основе активного состояния
  const getButtonVariant = () => {
    if (active) {
      return variant === 'outlined' ? 'primary' : 'primary';
    }
    return variant === 'filled' ? 'secondary' : 'outline';
  };

  // Создаем иконку
  const iconElement = (
    <Icon name={iconName} size={iconSize} className={`${loading ? 'animate-pulse' : ''}`} />
  );

  // Создаем badge для счетчика
  const countBadge =
    count !== undefined && count > 0 ? (
      <Badge variant="primary" size="sm" color={active ? 'blue' : 'gray'} className="ml-1">
        {count}
      </Badge>
    ) : null;

  // Определяем содержимое кнопки
  const buttonContent = (
    <>
      {iconPosition === 'left' && iconElement}
      <span className="truncate">{label}</span>
      {countBadge}
      {iconPosition === 'right' && iconElement}
    </>
  );

  const finalClassName = `
    ${active ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
    ${className}
  `.trim();

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className={finalClassName}
      startIcon={iconPosition === 'left' ? iconElement : undefined}
      endIcon={iconPosition === 'right' ? iconElement : undefined}
    >
      <span className="flex items-center gap-2">
        <span className="truncate">{label}</span>
        {countBadge}
      </span>
    </Button>
  );
};

// Компонент группы фильтров
export interface FilterGroupProps {
  /** Массив фильтров */
  filters: Array<{
    id: string;
    label: string;
    iconName: IconName;
    active?: boolean;
    count?: number;
    disabled?: boolean;
  }>;
  /** Обработчик изменения фильтра */
  onFilterChange: (filterId: string) => void;
  /** Размер кнопок */
  size?: 'sm' | 'md' | 'lg';
  /** Вариант отображения */
  variant?: 'default' | 'filled' | 'outlined';
  /** Направление размещения */
  orientation?: 'horizontal' | 'vertical';
  /** Дополнительные CSS классы */
  className?: string;
  /** Заголовок группы */
  title?: string;
  /** Можно ли выбрать несколько фильтров */
  multiple?: boolean;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  filters,
  onFilterChange,
  size = 'md',
  variant = 'default',
  orientation = 'horizontal',
  className = '',
  title,
  multiple = false,
}) => {
  const containerClasses = {
    horizontal: 'flex flex-wrap items-center gap-2',
    vertical: 'flex flex-col items-stretch gap-2',
  };

  return (
    <div className={`${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>
      )}

      <div className={containerClasses[orientation]}>
        {filters.map(filter => (
          <FilterButton
            key={filter.id}
            label={filter.label}
            iconName={filter.iconName}
            active={filter.active}
            count={filter.count}
            disabled={filter.disabled}
            size={size}
            variant={variant}
            onClick={() => onFilterChange(filter.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterButton;
