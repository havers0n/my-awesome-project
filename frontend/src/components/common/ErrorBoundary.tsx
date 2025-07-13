import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { MLError, ERROR_MESSAGES, MLErrorType } from "../../types/errors";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | MLError;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo);
    }
  }

  retry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined,
      retryCount: prevState.retryCount + 1
    }));
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  isMLError = (error: any): error is MLError => {
    return error && typeof error.type === 'string' && error.type in ERROR_MESSAGES;
  };

  getErrorInfo = () => {
    const { error } = this.state;
    
    if (this.isMLError(error)) {
      return ERROR_MESSAGES[error.type];
    }
    
    // Default error info for non-ML errors
    return {
      title: 'Произошла ошибка',
      message: error?.message || 'Что-то пошло не так',
      suggestion: 'Попробуйте обновить страницу',
      retryable: true,
      icon: '❗'
    };
  };

  render() {
    const { error, hasError } = this.state;
    if (hasError && error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(error, this.retry);
      }

      const errorInfo = this.getErrorInfo();
      const isMLError = this.isMLError(error);

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
          <div className="text-center max-w-md">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-2xl">
                {errorInfo.icon}
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {errorInfo.title}
            </h2>

            {/* Error Message */}
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {errorInfo.message}
            </p>

            {/* Error Suggestion */}
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              {errorInfo.suggestion}
            </p>

            {/* Retry Count Info */}
            {this.state.retryCount > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">
                Попытка {this.state.retryCount + 1}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {errorInfo.retryable && (
                <Button 
                  onClick={this.retry} 
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Попробовать снова
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Обновить страницу
              </Button>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-4">
                <summary className="font-medium text-red-800 dark:text-red-400 cursor-pointer mb-2">
                  Детали ошибки (Development)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong className="text-red-700 dark:text-red-300">Тип:</strong>
                    <span className="ml-2 text-red-600 dark:text-red-400">
                      {isMLError ? error.type : 'JavaScript Error'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-red-700 dark:text-red-300">Сообщение:</strong>
                    <pre className="mt-1 text-sm text-red-600 dark:text-red-400 overflow-auto whitespace-pre-wrap">
                      {error.message}
                    </pre>
                  </div>
                  {error.stack && (
                    <div>
                      <strong className="text-red-700 dark:text-red-300">Stack Trace:</strong>
                      <pre className="mt-1 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {isMLError && error.details && (
                    <div>
                      <strong className="text-red-700 dark:text-red-300">Детали:</strong>
                      <pre className="mt-1 text-xs text-red-600 dark:text-red-400 overflow-auto">
                        {JSON.stringify(error.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

