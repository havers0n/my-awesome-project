import React, { useState, useEffect } from "react";
import { MetricsGrid, MetricData } from "@/shared/ui/organisms/MetricsGrid";
import { Card } from "@/shared/ui/atoms/Card";
import { Typography } from "@/shared/ui/atoms/Typography";
import { Button } from "@/shared/ui/atoms/Button";
import { useDashboardMetrics } from "@/features/dashboard/hooks/useDashboardMetrics";

interface DashboardMetricsWidgetProps {
  /** Заголовок виджета */
  title?: string;
  /** Подзаголовок виджета */
  subtitle?: string;
  /** Показать действия */
  showActions?: boolean;
  /** Количество колонок */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Размер метрик */
  size?: 'sm' | 'md' | 'lg';
  /** Вариант отображения */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** Разрыв между элементами */
  gap?: 'sm' | 'md' | 'lg';
  /** Автоматическое определение колонок */
  autoColumns?: boolean;
  /** Минимальная ширина колонки */
  minColumnWidth?: number;
  /** Максимальное количество колонок */
  maxColumns?: number;
  /** Фильтр по типу метрик */
  metricFilter?: string[];
  /** Период для метрик */
  period?: 'today' | 'week' | 'month' | 'year';
  /** Дополнительные CSS классы */
  className?: string;
  /** Обработчик клика на метрику */
  onMetricClick?: (metric: MetricData) => void;
  /** Показать настройки */
  showSettings?: boolean;
}

export const DashboardMetricsWidget: React.FC<DashboardMetricsWidgetProps> = ({
  title = "Метрики",
  subtitle = "Ключевые показатели",
  showActions = true,
  columns = 4,
  size = 'md',
  variant = 'default',
  gap = 'md',
  autoColumns = true,
  minColumnWidth = 250,
  maxColumns = 6,
  metricFilter = [],
  period = 'today',
  className = '',
  onMetricClick,
  showSettings = false,
}) => {
  const { metrics, loading, error, fetchMetrics, refreshMetrics } = useDashboardMetrics();
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  useEffect(() => {
    fetchMetrics(selectedPeriod);
  }, [selectedPeriod, fetchMetrics]);

  const handleRefresh = () => {
    refreshMetrics(selectedPeriod);
  };

  const handleMetricClick = (metric: MetricData) => {
    if (onMetricClick) {
      onMetricClick(metric);
    }
  };

  const handlePeriodChange = (newPeriod: typeof period) => {
    setSelectedPeriod(newPeriod);
  };

  const filteredMetrics = metricFilter.length > 0 
    ? metrics.filter(metric => metricFilter.includes(metric.id))
    : metrics;

  const displayedMetrics = showAllMetrics 
    ? filteredMetrics 
    : filteredMetrics.slice(0, 8);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Typography variant="h3" size="lg" weight="semibold" color="primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="p" size="sm" color="secondary" className="mt-1">
            {subtitle}
          </Typography>
        )}
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value as typeof period)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="today">Сегодня</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Обновление...' : 'Обновить'}
          </Button>
          {showSettings && (
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderMetricStats = () => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <Typography variant="h4" size="lg" weight="bold" color="primary">
            {metrics.length}
          </Typography>
          <Typography variant="p" size="sm" color="secondary">
            Всего метрик
          </Typography>
        </div>
        <div className="text-center">
          <Typography variant="h4" size="lg" weight="bold" color="success">
            {metrics.filter(m => m.changeType === 'increase').length}
          </Typography>
          <Typography variant="p" size="sm" color="secondary">
            Растущие
          </Typography>
        </div>
        <div className="text-center">
          <Typography variant="h4" size="lg" weight="bold" color="error">
            {metrics.filter(m => m.changeType === 'decrease').length}
          </Typography>
          <Typography variant="p" size="sm" color="secondary">
            Падающие
          </Typography>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
        <div className="text-center py-8">
          <Typography variant="h4" color="error" className="mb-2">
            Ошибка загрузки метрик
          </Typography>
          <Typography variant="p" color="secondary" className="mb-4">
            {error}
          </Typography>
          <Button variant="primary" onClick={handleRefresh}>
            Попробовать снова
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
      {renderHeader()}
      {showActions && renderMetricStats()}
      
      <MetricsGrid
        metrics={displayedMetrics}
        columns={columns}
        gap={gap}
        size={size}
        variant={variant}
        autoColumns={autoColumns}
        minColumnWidth={minColumnWidth}
        maxColumns={maxColumns}
        className="mb-4"
      />
      
      {filteredMetrics.length > 8 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllMetrics(!showAllMetrics)}
          >
            {showAllMetrics ? 'Показать меньше' : `Показать все (${filteredMetrics.length})`}
          </Button>
        </div>
      )}
    </Card>
  );
};
