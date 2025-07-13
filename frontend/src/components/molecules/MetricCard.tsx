import React from 'react';
import { Card, Text } from '@/components/atoms';
import { Icon } from '@/components/atoms/Icon';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  iconName?: keyof typeof import('@/helpers/icons').ICONS;
  badge?: {
    text: string;
    variant?: 'light' | 'solid' | 'outline';
    color?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';
  };
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Описание метрики */
  description?: string;
  /** Показывать тренд */
  showTrend?: boolean;
  /** Период сравнения */
  period?: string;
  /** Действие при клике */
  onClick?: () => void;
  /** Загрузка */
  loading?: boolean;
  /** Дополнительные действия */
  actions?: Array<{
    label: string;
    icon?: string;
    onClick: () => void;
  }>;
  /** Цвет для акцента */
  accentColor?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  /** Показывать прогресс */
  progress?: {
    value: number;
    max: number;
    color?: string;
  };
  /** Статус */
  status?: 'success' | 'warning' | 'error' | 'info';
  /** Подзаголовок */
  subtitle?: string;
  /** Формат числа */
  format?: 'number' | 'currency' | 'percentage';
  /** Локализация */
  locale?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconName,
  badge,
  variant = 'default',
  size = 'md',
  className = '',
  description,
  showTrend = true,
  period = 'last period',
  onClick,
  loading = false,
  actions = [],
  accentColor = 'primary',
  progress,
  status,
  subtitle,
  format = 'number',
  locale = 'en-US',
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-success-600 dark:text-success-500';
      case 'decrease':
        return 'text-error-600 dark:text-error-500';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return 'trending-up';
      case 'decrease':
        return 'trending-down';
      default:
        return 'minus';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-l-success-500 bg-success-50 dark:bg-success-900/20';
      case 'warning':
        return 'border-l-warning-500 bg-warning-50 dark:bg-warning-900/20';
      case 'error':
        return 'border-l-error-500 bg-error-50 dark:bg-error-900/20';
      case 'info':
        return 'border-l-info-500 bg-info-50 dark:bg-info-900/20';
      default:
        return '';
    }
  };

  const getAccentColor = () => {
    switch (accentColor) {
      case 'success':
        return 'text-success-600 dark:text-success-400';
      case 'error':
        return 'text-error-600 dark:text-error-400';
      case 'warning':
        return 'text-warning-600 dark:text-warning-400';
      case 'info':
        return 'text-info-600 dark:text-info-400';
      default:
        return 'text-brand-600 dark:text-brand-400';
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat(locale).format(val);
    }
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const iconSizeMap = {
    sm: 4,
    md: 5,
    lg: 6,
  };

  const valueSizeMap = {
    sm: 'xl',
    md: '2xl',
    lg: '3xl',
  } as const;

  const cardClasses = `
    ${sizeClasses[size]} 
    ${status ? `border-l-4 ${getStatusColor()}` : ''}
    ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
    ${className}
  `.trim();

  if (loading) {
    return (
      <Card variant={variant} padding="none" className={cardClasses}>
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant={variant} padding="none" className={cardClasses} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {(icon || iconName) && (
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                {icon || (iconName && <Icon name={iconName} size={iconSizeMap[size]} />)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Text variant="label" size="sm" color="secondary" className="truncate">
                {title}
              </Text>
              {subtitle && (
                <Text variant="span" size="xs" color="muted" className="block truncate">
                  {subtitle}
                </Text>
              )}
            </div>
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-2 mb-2">
            <Text
              variant="h2"
              size={valueSizeMap[size]}
              weight="bold"
              color="primary"
              className={`truncate ${getAccentColor()}`}
            >
              {formatValue(value)}
            </Text>
            {badge && (
              <Badge
                variant={badge.variant || 'light'}
                color={badge.color || 'primary'}
                size="sm"
                className="flex-shrink-0"
              >
                {badge.text}
              </Badge>
            )}
          </div>

          {/* Description */}
          {description && (
            <Text variant="p" size="sm" color="secondary" className="mb-2">
              {description}
            </Text>
          )}

          {/* Progress */}
          {progress && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <Text variant="span" size="xs" color="secondary">
                  Progress
                </Text>
                <Text variant="span" size="xs" color="secondary">
                  {progress.value} / {progress.max}
                </Text>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.color || 'bg-brand-500'
                  }`}
                  style={{ width: `${(progress.value / progress.max) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Change */}
          {change !== undefined && showTrend && (
            <div className="flex items-center gap-1">
              <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
                <Icon name={getChangeIcon()} size={3} />
                {Math.abs(change)}%
              </div>
              <Text variant="span" size="sm" color="muted">
                vs {period}
              </Text>
            </div>
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center gap-1 ml-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="p-1"
                aria-label={action.label}
              >
                {action.icon ? (
                  <Icon name={action.icon} size={4} />
                ) : (
                  <Text variant="span" size="xs">
                    {action.label}
                  </Text>
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
