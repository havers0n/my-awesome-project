import React, { useState, useEffect } from "react";
import { Card } from "@/shared/ui/atoms/Card";
import { Typography } from "@/shared/ui/atoms/Typography";
import { Button } from "@/shared/ui/atoms/Button";
import { useReports } from "@/shared/hooks/useReports";

interface ReportWidgetProps {
  /** Заголовок виджета */
  title?: string;
  /** Подзаголовок виджета */
  subtitle?: string;
  /** Тип отчета */
  reportType: 'sales' | 'inventory' | 'financial' | 'analytics' | 'custom';
  /** Источник данных */
  dataSource: string;
  /** Показать действия */
  showActions?: boolean;
  /** Показать фильтры */
  showFilters?: boolean;
  /** Автоматическое обновление */
  autoRefresh?: boolean;
  /** Интервал обновления (в секундах) */
  refreshInterval?: number;
  /** Размер виджета */
  size?: 'sm' | 'md' | 'lg';
  /** Вариант отображения */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** Период отчета */
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  /** Формат экспорта по умолчанию */
  defaultExportFormat?: 'pdf' | 'excel' | 'csv';
  /** Фильтры */
  filters?: Record<string, any>;
  /** Класс для стилизации */
  className?: string;
  /** Обработчик генерации отчета */
  onReportGenerate?: (reportData: any) => void;
  /** Показать историю отчетов */
  showHistory?: boolean;
  /** Максимальное количество элементов истории */
  maxHistoryItems?: number;
}

interface ReportData {
  id: string;
  title: string;
  generatedAt: Date;
  format: string;
  size: string;
  status: 'generating' | 'ready' | 'error';
  url?: string;
  error?: string;
}

export const ReportWidget: React.FC<ReportWidgetProps> = ({
  title = "Отчет",
  subtitle,
  reportType,
  dataSource,
  showActions = true,
  showFilters = true,
  autoRefresh = false,
  refreshInterval = 300,
  size = 'md',
  variant = 'default',
  period = 'month',
  defaultExportFormat = 'pdf',
  filters = {},
  className = '',
  onReportGenerate,
  showHistory = true,
  maxHistoryItems = 5,
}) => {
  const { reports, loading, error, generateReport, getReportHistory, deleteReport } = useReports(reportType);
  
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [selectedFormat, setSelectedFormat] = useState(defaultExportFormat);
  const [activeFilters, setActiveFilters] = useState(filters);
  const [reportHistory, setReportHistory] = useState<ReportData[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (showHistory) {
      getReportHistory(maxHistoryItems).then(setReportHistory);
    }
  }, [showHistory, maxHistoryItems, getReportHistory]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        if (showHistory) {
          getReportHistory(maxHistoryItems).then(setReportHistory);
        }
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, showHistory, maxHistoryItems, getReportHistory]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const reportData = await generateReport({
        type: reportType,
        dataSource,
        period: selectedPeriod,
        format: selectedFormat,
        filters: activeFilters,
      });

      if (onReportGenerate) {
        onReportGenerate(reportData);
      }

      // Обновляем историю отчетов
      if (showHistory) {
        const updatedHistory = await getReportHistory(maxHistoryItems);
        setReportHistory(updatedHistory);
      }
    } catch (error) {
      console.error('Ошибка генерации отчета:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      setReportHistory(prev => prev.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Ошибка удаления отчета:', error);
    }
  };

  const handleDownloadReport = (report: ReportData) => {
    if (report.url) {
      window.open(report.url, '_blank');
    }
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
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerateReport}
          disabled={generatingReport}
        >
          {generatingReport ? 'Генерация...' : 'Создать отчет'}
        </Button>
      )}
    </div>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as typeof period)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="day">День</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="quarter">Квартал</option>
          <option value="year">Год</option>
        </select>

        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value as typeof defaultExportFormat)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
          <option value="csv">CSV</option>
        </select>

        {Object.keys(filters).map(key => (
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

  const renderReportHistory = () => {
    if (!showHistory || reportHistory.length === 0) return null;

    return (
      <div className="mt-6">
        <Typography variant="h4" size="md" weight="semibold" className="mb-4">
          История отчетов
        </Typography>
        <div className="space-y-3">
          {reportHistory.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Typography variant="p" size="sm" weight="medium">
                  {report.title}
                </Typography>
                <Typography variant="p" size="xs" color="secondary">
                  {report.generatedAt.toLocaleString()} • {report.format.toUpperCase()} • {report.size}
                </Typography>
              </div>
              
              <div className="flex items-center gap-2">
                {report.status === 'generating' && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <Typography variant="span" size="xs">
                      Создание...
                    </Typography>
                  </div>
                )}
                
                {report.status === 'ready' && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleDownloadReport(report)}
                  >
                    Скачать
                  </Button>
                )}
                
                {report.status === 'error' && (
                  <Typography variant="span" size="xs" color="error">
                    Ошибка
                  </Typography>
                )}
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleDeleteReport(report.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <Typography variant="h4" size="lg" weight="bold" color="primary">
          {reportHistory.length}
        </Typography>
        <Typography variant="p" size="sm" color="secondary">
          Всего отчетов
        </Typography>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <Typography variant="h4" size="lg" weight="bold" color="success">
          {reportHistory.filter(r => r.status === 'ready').length}
        </Typography>
        <Typography variant="p" size="sm" color="secondary">
          Готовых отчетов
        </Typography>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <Typography variant="h4" size="lg" weight="bold" color="warning">
          {reportHistory.filter(r => r.status === 'generating').length}
        </Typography>
        <Typography variant="p" size="sm" color="secondary">
          В процессе
        </Typography>
      </div>
    </div>
  );

  if (error) {
    return (
      <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
        <div className="text-center py-8">
          <Typography variant="h4" color="error" className="mb-2">
            Ошибка загрузки отчетов
          </Typography>
          <Typography variant="p" color="secondary" className="mb-4">
            {error}
          </Typography>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
      {renderHeader()}
      {renderFilters()}
      {showHistory && renderQuickStats()}
      {renderReportHistory()}
    </Card>
  );
};
