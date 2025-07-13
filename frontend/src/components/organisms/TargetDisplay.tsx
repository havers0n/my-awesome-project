import React from 'react';
import { Card, Text } from '../atoms';
import { StatItem } from '../molecules';

interface RadialChartProps {
  value: number;
  max: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

const RadialChart: React.FC<RadialChartProps> = ({
  value,
  max,
  color = '#3b82f6',
  size = 120,
  strokeWidth = 8,
  label,
  className = '',
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text variant="span" size="xl" weight="bold" color="primary">
          {Math.round(percentage)}%
        </Text>
        {label && (
          <Text variant="span" size="xs" color="muted" className="text-center">
            {label}
          </Text>
        )}
      </div>
    </div>
  );
};

export interface TargetData {
  id: string;
  title: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

export interface TargetStat {
  id: string;
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconName?: keyof typeof import('@/helpers/icons').ICONS;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

interface TargetDisplayProps {
  target: TargetData;
  stats?: TargetStat[];
  title?: string;
  subtitle?: string;
  showPercentage?: boolean;
  chartSize?: 'sm' | 'md' | 'lg';
  statsLayout?: 'horizontal' | 'vertical';
  statsSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  className?: string;
}

export const TargetDisplay: React.FC<TargetDisplayProps> = ({
  target,
  stats = [],
  title,
  subtitle,
  showPercentage = true,
  chartSize = 'md',
  statsLayout = 'horizontal',
  statsSize = 'md',
  variant = 'default',
  className = '',
}) => {
  const chartSizes = {
    sm: 100,
    md: 120,
    lg: 140,
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <div className="text-center mb-6">
        {title && (
          <Text variant="h3" size="lg" weight="semibold" color="primary">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text variant="p" size="sm" color="secondary" className="mt-1">
            {subtitle}
          </Text>
        )}
      </div>
    );
  };

  const renderTargetChart = () => {
    const percentage = Math.min((target.current / target.target) * 100, 100);
    const formattedCurrent =
      typeof target.current === 'number' ? target.current.toLocaleString() : target.current;
    const formattedTarget =
      typeof target.target === 'number' ? target.target.toLocaleString() : target.target;

    return (
      <div className="flex flex-col items-center">
        <RadialChart
          value={target.current}
          max={target.target}
          color={target.color || '#3b82f6'}
          size={chartSizes[chartSize]}
          label={showPercentage ? 'Complete' : undefined}
        />

        <div className="mt-4 text-center">
          <Text variant="h4" size="lg" weight="semibold" color="primary">
            {target.title}
          </Text>

          <div className="mt-2 flex items-center justify-center gap-2">
            <Text variant="span" size="sm" color="secondary">
              {formattedCurrent}
            </Text>
            <Text variant="span" size="sm" color="muted">
              of
            </Text>
            <Text variant="span" size="sm" color="secondary">
              {formattedTarget}
            </Text>
            {target.unit && (
              <Text variant="span" size="sm" color="muted">
                {target.unit}
              </Text>
            )}
          </div>

          {showPercentage && (
            <div className="mt-2">
              <Text variant="span" size="sm" color="muted">
                {percentage.toFixed(1)}% completed
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats || stats.length === 0) return null;

    return (
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div
          className={`grid ${
            statsLayout === 'vertical' || stats.length <= 2
              ? 'grid-cols-1 gap-4'
              : stats.length === 3
                ? 'grid-cols-1 md:grid-cols-3 gap-4'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
          }`}
        >
          {stats.map(stat => (
            <StatItem
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              iconName={stat.iconName}
              change={stat.change}
              changeType={stat.changeType}
              trend={stat.trend}
              description={stat.description}
              size={statsSize}
              layout={statsLayout}
              variant="minimal"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card variant={variant} padding="none" className={`overflow-hidden text-center ${className}`}>
      <div className={sizeClasses[statsSize]}>
        {renderHeader()}
        {renderTargetChart()}
        {renderStats()}
      </div>
    </Card>
  );
};

export default TargetDisplay;
