import React from "react";
import { MetricCard } from "../molecules/MetricCard";

export interface MetricData {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  iconName: string;
  badge?: {
    text: string;
    variant: 'solid' | 'outline' | 'light';
    color: 'primary' | 'success' | 'error' | 'warning' | 'info';
  };
}

interface MetricsGridProps {
  metrics: MetricData[];
  loading?: boolean;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
          badge={metric.badge}
        />
      ))}
    </div>
  );
};
