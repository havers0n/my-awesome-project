import React from 'react';
import { ProgressBar, Text } from '@/components/atoms';

interface ProgressIndicatorProps {
  label: string;
  value: number;
  max?: number;
  showPercentage?: boolean;
  showValue?: boolean;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  label,
  value,
  max = 100,
  showPercentage = true,
  showValue = false,
  description,
  size = 'md',
  color = 'blue',
  animated = false,
  striped = false,
  className = '',
}) => {
  const percentage = Math.round((value / max) * 100);

  const getProgressColor = () => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    if (percentage >= 40) return 'blue';
    return 'red';
  };

  const progressColor = color === 'blue' ? getProgressColor() : color;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Text variant="label" size="sm" weight="medium" color="primary">
          {label}
        </Text>
        <div className="flex items-center gap-2">
          {showValue && (
            <Text variant="span" size="sm" color="secondary">
              {value}
              {max !== 100 && `/${max}`}
            </Text>
          )}
          {showPercentage && (
            <Text variant="span" size="sm" weight="medium" color="primary">
              {percentage}%
            </Text>
          )}
        </div>
      </div>

      <ProgressBar
        value={value}
        max={max}
        size={size}
        color={progressColor}
        animated={animated}
        striped={striped}
        showLabel={false}
      />

      {description && (
        <Text variant="p" size="xs" color="muted" className="mt-1">
          {description}
        </Text>
      )}
    </div>
  );
};

export default ProgressIndicator;
