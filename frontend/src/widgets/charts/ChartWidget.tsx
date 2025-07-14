import React, { useState, useEffect } from "react";
import { Card } from "@/shared/ui/atoms/Card";
import { Typography } from "@/shared/ui/atoms/Typography";
import { Button } from "@/shared/ui/atoms/Button";
import { ChartContainer } from "@/shared/ui/organisms/ChartContainer";
import { useChartData } from "@/features/analytics/hooks/useChartData";

interface ChartWidgetProps {
  /** Заголовок виджета */
  title?: string;
  /** Подзаголовок виджета */
  subtitle?: string;
  /** Тип графика */
  chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  /** Источник данных */
  dataSource: string;
  /** Показать действия */
  showActions?: boolean;
  /** Показать легенду */
  showLegend?: boolean;
  /** Показать сетку */
  showGrid?: boolean;
  /** Показать точки данных */
  showDataPoints?: boolean;
  /** Анимация */
  animated?: boolean;
  /** Размер виджета */
  size?: 'sm' | 'md' | 'lg';
  /** Вариант отображения */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** Высота графика */
  height?: number;
  /** Цветовая схема */
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Период данных */
  period?: 'day' | 'week' | 'month' | 'year';
  /** Дополнительные параметры фильтрации */
  filters?: Record<string, any>;
  /** Класс для стилизации */
  className?: string;
  /** Обработчик клика на элемент графика */
  onDataPointClick?: (data: any) => void;
  /** Показать экспорт */
  showExport?: boolean;
  /** Показать полноэкранный режим */
  showFullscreen?: boolean;
  /** Показать обновление */
  showRefresh?: boolean;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title = "График",
  subtitle,
  chartType,
  dataSource,
  showActions = true,
  showLegend = true,
  showGrid = true,
  showDataPoints = true,
  animated = true,
  size = 'md',
  variant = 'default',
  height = 300,
  colorScheme = 'primary',
  period = 'month',
  filters = {},
  className = '',
  onDataPointClick,
  showExport = true,
  showFullscreen = false,
  showRefresh = true,
}) => {
  const { data, loading, error, fetchData, exportData } = useChartData(dataSource);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(filters);

  useEffect(() => {
    fetchData({
      period: selectedPeriod,
      filters: activeFilters,
      chartType,
    });
  }, [selectedPeriod, activeFilters, chartType, fetchData]);

  const handleRefresh = () => {
    fetchData({
      period: selectedPeriod,
      filters: activeFilters,
      chartType,
    });
  };

  const handleExport = (format: 'png' | 'pdf' | 'csv') => {
    exportData(format);
  };

  const handlePeriodChange = (newPeriod: typeof period) => {
    setSelectedPeriod(newPeriod);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

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
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
          
          {showRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Обновление...' : 'Обновить'}
            </Button>
          )}
          
          {showExport && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('png')}
              >
                Экспорт
              </Button>
            </div>
          )}
          
          {showFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderChartStats = () => {
    if (!data || !data.stats) return null;

    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Typography variant="h4" size="lg" weight="bold" color="primary">
              {data.stats.total}
            </Typography>
            <Typography variant="p" size="sm" color="secondary">
              Всего
            </Typography>
          </div>
          <div className="text-center">
            <Typography 
              variant="h4" 
              size="lg" 
              weight="bold" 
              color={data.stats.change > 0 ? "success" : "error"}
            >
              {data.stats.change > 0 ? '+' : ''}{data.stats.change}%
            </Typography>
            <Typography variant="p" size="sm" color="secondary">
              Изменение
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="h4" size="lg" weight="bold" color="primary">
              {data.stats.average}
            </Typography>
            <Typography variant="p" size="sm" color="secondary">
              Среднее
            </Typography>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    const filterKeys = Object.keys(filters);
    if (filterKeys.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {filterKeys.map(key => (
          <select
            key={key}
            value={activeFilters[key] || ''}
            onChange={(e) => setActiveFilters(prev => ({ ...prev, [key]: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">{key}</option>
            {filters[key].map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
        <div className="text-center py-8">
          <Typography variant="h4" color="error" className="mb-2">
            Ошибка загрузки данных
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
    <Card 
      variant={variant} 
      className={`${className} ${sizeClasses[size]} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {renderHeader()}
      {renderFilters()}
      {showActions && renderChartStats()}
      
      <div className="relative">
        <ChartContainer
          data={data}
          type={chartType}
          height={isFullscreen ? window.innerHeight - 200 : height}
          showLegend={showLegend}
          showGrid={showGrid}
          showDataPoints={showDataPoints}
          animated={animated}
          colorScheme={colorScheme}
          loading={loading}
          onDataPointClick={onDataPointClick}
        />
      </div>
      
      {isFullscreen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFullscreen}
          className="absolute top-4 right-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      )}
    </Card>
  );
};
