import React from 'react';

interface MetricValueProps {
  value: string | number;
  label?: string;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  showTrend?: boolean;
  icon?: React.ReactNode;
}

const MetricValue: React.FC<MetricValueProps> = ({
  value,
  label,
  prefix = '',
  suffix = '',
  change,
  changeType = 'neutral',
  size = 'md',
  variant = 'primary',
  className = '',
  showTrend = false,
  icon,
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const variantClasses = {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const changeClasses = {
    increase: 'text-green-600 dark:text-green-400',
    decrease: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const renderTrendIcon = () => {
    if (!showTrend || change === undefined) return null;

    if (changeType === 'increase') {
      return (
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (changeType === 'decrease') {
      return (
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <div className="flex items-center mb-1">
          {icon && <span className="mr-2">{icon}</span>}
          <span
            className={`font-medium text-gray-600 dark:text-gray-400 ${labelSizeClasses[size]}`}
          >
            {label}
          </span>
        </div>
      )}

      <div className="flex items-center">
        <span className={`font-bold ${sizeClasses[size]} ${variantClasses[variant]}`}>
          {prefix}
          {formatValue(value)}
          {suffix}
        </span>

        {change !== undefined && (
          <div className={`flex items-center ml-2 ${changeClasses[changeType]}`}>
            {renderTrendIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}
              {change}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricValue;
