import React from 'react';
import { cn } from '@/shared/lib/utils';

interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  actions?: React.ReactNode;
  height?: number;
  width?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  className,
  loading = false,
  error = null,
  actions,
  height = 400,
  width
}) => {
  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
      style={{ width, height: height + 60 }} // +60 для заголовка
    >
      {/* Заголовок */}
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Контент */}
      <div 
        className="p-6"
        style={{ height: height }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Загрузка...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-500 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Ошибка загрузки данных</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">{error}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartContainer;
