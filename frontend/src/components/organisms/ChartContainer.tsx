import React, { Suspense, lazy } from 'react';
import { Card } from '../atoms';
import { ChartHeader } from '../molecules';

interface ChartLoadingProps {
  height?: string;
  message?: string;
}

interface ChartErrorProps {
  error?: Error;
  onRetry?: () => void;
}

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  chart: React.ReactNode;
  dropdownOptions?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  selectedOption?: string;
  onOptionChange?: (value: string) => void;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  headerClassName?: string;
  contentClassName?: string;
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error;
  /** Retry handler for errors */
  onRetry?: () => void;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Chart type for unified handling */
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'custom';
  /** Chart data for unified processing */
  chartData?: any;
  /** Chart options for unified configuration */
  chartOptions?: any;
  /** Enable chart export */
  exportEnabled?: boolean;
  /** Export formats */
  exportFormats?: ('png' | 'svg' | 'pdf' | 'csv')[];
  /** Full screen mode */
  fullScreenEnabled?: boolean;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Auto-refresh interval in seconds */
  autoRefreshInterval?: number;
}

// Default loading component
const ChartLoading: React.FC<ChartLoadingProps> = ({
  height = '320px',
  message = 'Loading chart...',
}) => (
  <div className="flex items-center justify-center" style={{ height }}>
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-3"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

// Default error component
const ChartError: React.FC<ChartErrorProps> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
    <div className="text-center">
      <svg
        className="mx-auto h-12 w-12 mb-4 text-gray-300 dark:text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="text-sm font-medium mb-2">Failed to load chart</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        {error?.message || 'An error occurred while loading the chart'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  chart,
  dropdownOptions,
  selectedOption,
  onOptionChange,
  actions,
  variant = 'default',
  size = 'md',
  headerClassName = '',
  contentClassName = '',
  className = '',
  loading = false,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  chartType = 'custom',
  chartData,
  chartOptions,
  exportEnabled = false,
  exportFormats = ['png', 'svg'],
  fullScreenEnabled = false,
  onRefresh,
  autoRefreshInterval,
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const contentSizeClasses = {
    sm: 'p-4 pt-0',
    md: 'p-6 pt-0',
    lg: 'p-8 pt-0',
  };

  // Enhanced actions with export and fullscreen
  const enhancedActions = (
    <div className="flex items-center gap-2">
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="Refresh chart"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      )}
      {exportEnabled && (
        <button
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="Export chart"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
      )}
      {fullScreenEnabled && (
        <button
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="Full screen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m-4-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      )}
      {actions}
    </div>
  );

  return (
    <Card variant={variant} padding="none" className={`overflow-hidden ${className}`}>
      <div
        className={`${sizeClasses[size]} border-b border-gray-200 dark:border-gray-700 ${headerClassName}`}
      >
        <ChartHeader
          title={title}
          subtitle={subtitle}
          dropdownOptions={dropdownOptions}
          selectedOption={selectedOption}
          onOptionChange={onOptionChange}
          actions={enhancedActions}
          className="mb-0"
        />
      </div>

      <div className={`${contentSizeClasses[size]} ${contentClassName}`}>
        {loading ? (
          loadingComponent || <ChartLoading />
        ) : error ? (
          errorComponent || <ChartError error={error} onRetry={onRetry} />
        ) : chart ? (
          <Suspense fallback={<ChartLoading />}>
            <div className="w-full h-full">{chart}</div>
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 mb-4 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <p className="text-sm font-medium">No chart data available</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Chart content will appear here when data is loaded
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChartContainer;
