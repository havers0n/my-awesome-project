import React from 'react';
import { Text } from '@/components/atoms';
import { Icon } from '@/components/common/Icon';

interface StatItemProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconName?: keyof typeof import('@/helpers/icons').ICONS;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  variant?: 'default' | 'minimal' | 'bordered';
  className?: string;
}

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  icon,
  iconName,
  change,
  changeType = 'neutral',
  trend,
  description,
  prefix = '',
  suffix = '',
  size = 'md',
  layout = 'vertical',
  variant = 'default',
  className = '',
}) => {
  const getChangeColor = () => {
    const effectiveChangeType = trend || changeType;
    switch (effectiveChangeType) {
      case 'increase':
      case 'up':
        return 'text-success-600 dark:text-success-500';
      case 'decrease':
      case 'down':
        return 'text-error-600 dark:text-error-500';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getChangeIcon = () => {
    const effectiveChangeType = trend || changeType;
    switch (effectiveChangeType) {
      case 'increase':
      case 'up':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l9.2-9.2M17 17V7H7"
            />
          </svg>
        );
      case 'decrease':
      case 'down':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 7l-9.2 9.2M7 7v10h10"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
          </svg>
        );
    }
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      value: 'lg' as const,
      label: 'xs' as const,
      icon: 'w-4 h-4',
      iconSize: 3,
    },
    md: {
      container: 'p-4',
      value: 'xl' as const,
      label: 'sm' as const,
      icon: 'w-5 h-5',
      iconSize: 4,
    },
    lg: {
      container: 'p-6',
      value: '2xl' as const,
      label: 'base' as const,
      icon: 'w-6 h-6',
      iconSize: 5,
    },
  };

  const variantClasses = {
    default: 'bg-gray-50 dark:bg-gray-800 rounded-lg',
    minimal: '',
    bordered: 'border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900',
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const containerClasses = `${sizeClasses[size].container} ${variantClasses[variant]} ${className}`;

  if (layout === 'horizontal') {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-4">
          {(icon || iconName) && (
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center p-2 bg-white dark:bg-gray-700 rounded-lg">
                {icon || (iconName && <Icon name={iconName} size={sizeClasses[size].iconSize} />)}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <Text variant="label" size={sizeClasses[size].label} color="secondary" className="mb-1">
              {label}
            </Text>

            <div className="flex items-baseline gap-1">
              <Text variant="span" size={sizeClasses[size].value} weight="bold" color="primary">
                {prefix}
                {formatValue(value)}
                {suffix}
              </Text>

              {change !== undefined && (
                <div className={`flex items-center gap-1 ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <Text variant="span" size="sm" weight="medium">
                    {Math.abs(change)}%
                  </Text>
                </div>
              )}
            </div>

            {description && (
              <Text variant="p" size="xs" color="muted" className="mt-1 line-clamp-2">
                {description}
              </Text>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {(icon || iconName) && (
          <div className="flex justify-center mb-3">
            <div className="flex items-center justify-center p-2 bg-white dark:bg-gray-700 rounded-lg">
              {icon || (iconName && <Icon name={iconName} size={sizeClasses[size].iconSize} />)}
            </div>
          </div>
        )}

        <Text variant="label" size={sizeClasses[size].label} color="secondary" className="mb-2">
          {label}
        </Text>

        <div className="flex items-baseline justify-center gap-1 mb-2">
          <Text variant="span" size={sizeClasses[size].value} weight="bold" color="primary">
            {prefix}
            {formatValue(value)}
            {suffix}
          </Text>

          {change !== undefined && (
            <div className={`flex items-center gap-1 ${getChangeColor()}`}>
              {getChangeIcon()}
              <Text variant="span" size="sm" weight="medium">
                {Math.abs(change)}%
              </Text>
            </div>
          )}
        </div>

        {description && (
          <Text variant="p" size="xs" color="muted" className="line-clamp-2">
            {description}
          </Text>
        )}
      </div>
    </div>
  );
};

export default StatItem;
