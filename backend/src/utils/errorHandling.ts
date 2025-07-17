import { AxiosError } from 'axios';
import { z } from 'zod';

// Error types for integration errors
export enum IntegrationErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNSEEN_LABEL = 'UNSEEN_LABEL',
  DATA_VALIDATION = 'DATA_VALIDATION',
  ML_SERVICE_ERROR = 'ML_SERVICE_ERROR',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface IntegrationError {
  type: IntegrationErrorType;
  message: string;
  retryable: boolean;
  retryDelay?: number;
  originalError?: any;
  correctionStrategy?: ErrorCorrectionStrategy;
  validationErrors?: any[];
}

export interface ErrorCorrectionStrategy {
  type: 'auto' | 'manual' | 'skip';
  action?: (error: IntegrationError, payload: any) => any;
  description: string;
}

// Retry configuration with exponential backoff
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: IntegrationErrorType[];
  onRetry?: (attempt: number, error: IntegrationError) => void;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    IntegrationErrorType.NETWORK_ERROR,
    IntegrationErrorType.TIMEOUT,
    IntegrationErrorType.RATE_LIMIT,
    IntegrationErrorType.SERVER_ERROR
  ]
};

// Error classification function
export function classifyError(error: any): IntegrationError {
  if (error instanceof AxiosError) {
    // Network or timeout errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        type: IntegrationErrorType.TIMEOUT,
        message: 'Request timed out',
        retryable: true,
        retryDelay: 2000,
        originalError: error
      };
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        type: IntegrationErrorType.NETWORK_ERROR,
        message: 'Network connection failed',
        retryable: true,
        retryDelay: 1000,
        originalError: error
      };
    }
    
    // HTTP status code based classification
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 429) {
        return {
          type: IntegrationErrorType.RATE_LIMIT,
          message: 'Rate limit exceeded',
          retryable: true,
          retryDelay: parseInt(error.response.headers['retry-after']) * 1000 || 60000,
          originalError: error
        };
      }
      
      if (status >= 500) {
        return {
          type: IntegrationErrorType.SERVER_ERROR,
          message: `Server error: ${status}`,
          retryable: true,
          retryDelay: 5000,
          originalError: error
        };
      }
      
      if (status === 422 || status === 400) {
        // Check for specific validation errors
        if (data?.error?.includes('unseen label') || data?.error?.includes('unknown category')) {
          return {
            type: IntegrationErrorType.UNSEEN_LABEL,
            message: data.error || 'Unknown label or category in data',
            retryable: false,
            originalError: error,
            correctionStrategy: {
              type: 'auto',
              description: 'Replace unseen labels with default category',
              action: (error, payload) => correctUnseenLabels(payload)
            }
          };
        }
        
        return {
          type: IntegrationErrorType.INVALID_PAYLOAD,
          message: data?.error || 'Invalid request payload',
          retryable: false,
          originalError: error,
          validationErrors: data?.details || []
        };
      }
    }
  }
  
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return {
      type: IntegrationErrorType.DATA_VALIDATION,
      message: 'Data validation failed',
      retryable: false,
      originalError: error,
      validationErrors: error.errors,
      correctionStrategy: {
        type: 'auto',
        description: 'Apply automatic data corrections',
        action: (error, payload) => autoCorrectValidationErrors(payload, error.originalError)
      }
    };
  }
  
  // Default unknown error
  return {
    type: IntegrationErrorType.ML_SERVICE_ERROR,
    message: error.message || 'Unknown error occurred',
    retryable: false,
    originalError: error
  };
}

// Automatic error correction strategies
export function correctUnseenLabels(payload: any[]): any[] {
  const knownCategories = ['Хлеб', 'Выпечка', 'Напитки', 'Молочные продукты', 'Прочее'];
  const defaultCategory = 'Прочее';
  
  return payload.map(item => {
    if (item.ВидНоменклатуры && !knownCategories.includes(item.ВидНоменклатуры)) {
      console.log(`Correcting unseen label: ${item.ВидНоменклатуры} -> ${defaultCategory}`);
      return {
        ...item,
        ВидНоменклатуры: defaultCategory
      };
    }
    return item;
  });
}

export function autoCorrectValidationErrors(payload: any[], zodError: z.ZodError): any[] {
  const correctedPayload = [...payload];
  
  zodError.errors.forEach(error => {
    const path = error.path;
    const issue = error.code;
    
    // Handle different types of validation errors
    switch (issue) {
      case 'invalid_type':
        // Try to convert types
        if (error.expected === 'number') {
          const value = getNestedValue(payload, path);
          if (typeof value === 'string' && !isNaN(Number(value))) {
            setNestedValue(correctedPayload, path, Number(value));
          }
        }
        break;
        
      case 'too_small':
        // Set minimum values
        if (error.minimum !== undefined) {
          setNestedValue(correctedPayload, path, error.minimum);
        }
        break;
        
      case 'too_big':
        // Set maximum values
        if (error.maximum !== undefined) {
          setNestedValue(correctedPayload, path, error.maximum);
        }
        break;
        
      case 'invalid_date':
        // Try to parse and fix date formats
        const dateValue = getNestedValue(payload, path);
        if (dateValue) {
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            setNestedValue(correctedPayload, path, parsedDate.toISOString().slice(0, 10));
          }
        }
        break;
    }
  });
  
  return correctedPayload;
}

// Helper functions for nested object manipulation
function getNestedValue(obj: any, path: (string | number)[]): any {
  return path.reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: (string | number)[], value: any): void {
  const lastKey = path[path.length - 1];
  const parentPath = path.slice(0, -1);
  const parent = parentPath.reduce((current, key) => current?.[key], obj);
  if (parent) {
    parent[lastKey] = value;
  }
}

// Retry mechanism with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: IntegrationError | null = null;
  let delay = config.initialDelay;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error);
      
      // Check if error is retryable
      if (!config.retryableErrors.includes(lastError.type) || attempt === config.maxRetries) {
        throw lastError;
      }
      
      // Call retry callback if provided
      if (config.onRetry) {
        config.onRetry(attempt + 1, lastError);
      }
      
      // Calculate delay with exponential backoff
      const retryDelay = lastError.retryDelay || delay;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Increase delay for next attempt
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
    }
  }
  
  throw lastError;
}

// Error monitoring integration
export interface ErrorMonitor {
  logError(error: IntegrationError, context?: any): void;
  logRetry(attempt: number, error: IntegrationError): void;
  logCorrection(error: IntegrationError, correction: any): void;
}

export class ConsoleErrorMonitor implements ErrorMonitor {
  logError(error: IntegrationError, context?: any): void {
    console.error('[ERROR]', {
      type: error.type,
      message: error.message,
      retryable: error.retryable,
      context,
      timestamp: new Date().toISOString()
    });
  }
  
  logRetry(attempt: number, error: IntegrationError): void {
    console.log('[RETRY]', {
      attempt,
      errorType: error.type,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  logCorrection(error: IntegrationError, correction: any): void {
    console.log('[CORRECTION]', {
      errorType: error.type,
      strategy: error.correctionStrategy?.type,
      description: error.correctionStrategy?.description,
      correction,
      timestamp: new Date().toISOString()
    });
  }
}

// Production error monitor could integrate with services like Sentry, DataDog, etc.
export class ProductionErrorMonitor implements ErrorMonitor {
  constructor(private sentryDsn?: string) {
    // Initialize Sentry or other monitoring service
  }
  
  logError(error: IntegrationError, context?: any): void {
    // Send to monitoring service
    // Example: Sentry.captureException(error.originalError, { extra: context });
  }
  
  logRetry(attempt: number, error: IntegrationError): void {
    // Log retry attempts
  }
  
  logCorrection(error: IntegrationError, correction: any): void {
    // Log automatic corrections for audit
  }
}
