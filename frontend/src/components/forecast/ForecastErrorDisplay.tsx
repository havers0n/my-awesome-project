import React from 'react';
import Button from '../ui/button/Button';
import { MLError, ERROR_MESSAGES } from '../../types/errors';

interface ForecastErrorDisplayProps {
  error: MLError;
  onRetry?: () => void;
  onClear?: () => void;
  canRetry?: boolean;
  isRetrying?: boolean;
  retryCount?: number;
  className?: string;
}

const ForecastErrorDisplay: React.FC<ForecastErrorDisplayProps> = ({
  error,
  onRetry,
  onClear,
  canRetry = true,
  isRetrying = false,
  retryCount = 0,
  className = ''
}) => {
  const errorInfo = ERROR_MESSAGES[error.type] || ERROR_MESSAGES.unknownError;

  const RefreshIcon = () => (
    <svg 
      className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
      />
    </svg>
  );

  const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className={`bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-lg">
            {errorInfo.icon}
          </div>
        </div>
        
        {/* Error Content */}
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-1">
            {errorInfo.title}
          </h3>
          
          <p className="text-red-700 dark:text-red-300 mb-2">
            {errorInfo.message}
          </p>
          
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {errorInfo.suggestion}
          </p>

          {/* Retry Count Info */}
          {retryCount > 0 && (
            <p className="text-xs text-red-500 dark:text-red-500 mb-4">
              Попытка {retryCount + 1} из 3
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {errorInfo.retryable && canRetry && onRetry && (
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                startIcon={<RefreshIcon />}
              >
                {isRetrying ? 'Повторяем...' : 'Попробовать снова'}
              </Button>
            )}

            {onClear && (
              <Button
                onClick={onClear}
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                startIcon={<CloseIcon />}
              >
                Скрыть
              </Button>
            )}
          </div>

          {/* Development Info */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer font-medium text-red-700 dark:text-red-400">
                Детали ошибки (Development)
              </summary>
              <div className="mt-2 space-y-1">
                <div>
                  <strong>Тип:</strong> {error.type}
                </div>
                <div>
                  <strong>Сообщение:</strong> {error.message}
                </div>
                {error.details && (
                  <div>
                    <strong>Детали:</strong>
                    <pre className="mt-1 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastErrorDisplay;
