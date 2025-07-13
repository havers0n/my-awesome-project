import React from 'react';
import { MetricCard } from '../molecules';

export interface MetricData {
  id: string;
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
}

interface ResponsiveConfig {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
}

interface MetricsGridProps {
  metrics: MetricData[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  className?: string;
  /** Responsive configuration for different breakpoints */
  responsive?: {
    sm?: ResponsiveConfig;
    md?: ResponsiveConfig;
    lg?: ResponsiveConfig;
    xl?: ResponsiveConfig;
    '2xl'?: ResponsiveConfig;
  };
  /** Auto-adjust columns based on container width */
  autoColumns?: boolean;
  /** Minimum column width for auto-adjustment */
  minColumnWidth?: number;
  /** Maximum columns for auto-adjustment */
  maxColumns?: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  columns = 4,
  gap = 'md',
  size = 'md',
  variant = 'default',
  className = '',
  responsive = {},
  autoColumns = false,
  minColumnWidth = 250,
  maxColumns = 6,
}) => {
  const getGridClasses = () => {
    const baseClasses = 'grid w-full';

    // Enhanced responsive column classes
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
    };

    const gapClasses = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4',
      lg: 'gap-4 sm:gap-6',
    };

    let gridClasses = `${baseClasses} ${columnClasses[columns]} ${gapClasses[gap]}`;

    // Add responsive classes
    if (responsive.sm) {
      const smConfig = responsive.sm;
      if (smConfig.columns) gridClasses += ` sm:grid-cols-${smConfig.columns}`;
      if (smConfig.gap) gridClasses += ` sm:${gapClasses[smConfig.gap]}`;
    }
    if (responsive.md) {
      const mdConfig = responsive.md;
      if (mdConfig.columns) gridClasses += ` md:grid-cols-${mdConfig.columns}`;
      if (mdConfig.gap) gridClasses += ` md:${gapClasses[mdConfig.gap]}`;
    }
    if (responsive.lg) {
      const lgConfig = responsive.lg;
      if (lgConfig.columns) gridClasses += ` lg:grid-cols-${lgConfig.columns}`;
      if (lgConfig.gap) gridClasses += ` lg:${gapClasses[lgConfig.gap]}`;
    }
    if (responsive.xl) {
      const xlConfig = responsive.xl;
      if (xlConfig.columns) gridClasses += ` xl:grid-cols-${xlConfig.columns}`;
      if (xlConfig.gap) gridClasses += ` xl:${gapClasses[xlConfig.gap]}`;
    }
    if (responsive['2xl']) {
      const xl2Config = responsive['2xl'];
      if (xl2Config.columns) gridClasses += ` 2xl:grid-cols-${xl2Config.columns}`;
      if (xl2Config.gap) gridClasses += ` 2xl:${gapClasses[xl2Config.gap]}`;
    }

    return gridClasses;
  };

  const getAutoGridClasses = () => {
    if (!autoColumns) return getGridClasses();

    const baseClasses = 'grid w-full';
    const gapClasses = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4',
      lg: 'gap-4 sm:gap-6',
    };

    return `${baseClasses} ${gapClasses[gap]}`;
  };

  const getAutoGridStyle = () => {
    if (!autoColumns) return {};

    return {
      gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
    };
  };

  if (!metrics || metrics.length === 0) {
    return (
      <div className={`${getAutoGridClasses()} ${className}`} style={getAutoGridStyle()}>
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No metrics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getAutoGridClasses()} ${className}`} style={getAutoGridStyle()}>
      {metrics.map(metric => {
        // Dynamic size based on responsive config
        const currentSize =
          responsive.sm?.size ||
          responsive.md?.size ||
          responsive.lg?.size ||
          responsive.xl?.size ||
          responsive['2xl']?.size ||
          size;

        return (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
            iconName={metric.iconName}
            badge={metric.badge}
            variant={variant}
            size={currentSize}
          />
        );
      })}
    </div>
  );
};

export default MetricsGrid;
