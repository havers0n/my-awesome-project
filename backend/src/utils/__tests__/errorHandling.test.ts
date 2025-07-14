import axios, { AxiosError } from 'axios';
import { 
  classifyError, 
  IntegrationErrorType,
  retryWithBackoff,
  correctUnseenLabels,
  autoCorrectValidationErrors,
  ConsoleErrorMonitor
} from '../errorHandling';
import { z } from 'zod';

// Mock axios
jest.mock('axios');

describe('Error Classification', () => {
  it('should classify timeout errors correctly', () => {
    const axiosError = new AxiosError('Request timeout');
    axiosError.code = 'ECONNABORTED';
    
    const classified = classifyError(axiosError);
    
    expect(classified.type).toBe(IntegrationErrorType.TIMEOUT);
    expect(classified.retryable).toBe(true);
    expect(classified.retryDelay).toBe(2000);
  });
  
  it('should classify network errors correctly', () => {
    const axiosError = new AxiosError('Network error');
    axiosError.code = 'ECONNREFUSED';
    
    const classified = classifyError(axiosError);
    
    expect(classified.type).toBe(IntegrationErrorType.NETWORK_ERROR);
    expect(classified.retryable).toBe(true);
    expect(classified.retryDelay).toBe(1000);
  });
  
  it('should classify rate limit errors correctly', () => {
    const axiosError = new AxiosError('Rate limit exceeded');
    axiosError.response = {
      status: 429,
      headers: { 'retry-after': '60' }
    } as any;
    
    const classified = classifyError(axiosError);
    
    expect(classified.type).toBe(IntegrationErrorType.RATE_LIMIT);
    expect(classified.retryable).toBe(true);
    expect(classified.retryDelay).toBe(60000);
  });
  
  it('should classify server errors correctly', () => {
    const axiosError = new AxiosError('Internal server error');
    axiosError.response = { status: 500 } as any;
    
    const classified = classifyError(axiosError);
    
    expect(classified.type).toBe(IntegrationErrorType.SERVER_ERROR);
    expect(classified.retryable).toBe(true);
    expect(classified.retryDelay).toBe(5000);
  });
  
  it('should classify unseen label errors with correction strategy', () => {
    const axiosError = new AxiosError('Validation error');
    axiosError.response = {
      status: 422,
      data: { error: 'Model encountered unseen label: UnknownCategory' }
    } as any;
    
    const classified = classifyError(axiosError);
    
    expect(classified.type).toBe(IntegrationErrorType.UNSEEN_LABEL);
    expect(classified.retryable).toBe(false);
    expect(classified.correctionStrategy).toBeDefined();
    expect(classified.correctionStrategy?.type).toBe('auto');
  });
  
  it('should classify Zod validation errors', () => {
    const zodError = new z.ZodError([
      {
        code: 'invalid_type',
        expected: 'number',
        received: 'string',
        path: ['quantity'],
        message: 'Expected number, received string'
      }
    ]);
    
    const classified = classifyError(zodError);
    
    expect(classified.type).toBe(IntegrationErrorType.DATA_VALIDATION);
    expect(classified.retryable).toBe(false);
    expect(classified.validationErrors).toHaveLength(1);
    expect(classified.correctionStrategy).toBeDefined();
  });
});

describe('Error Correction Strategies', () => {
  it('should correct unseen labels to default category', () => {
    const payload = [
      { ВидНоменклатуры: 'Хлеб' },
      { ВидНоменклатуры: 'UnknownCategory' },
      { ВидНоменклатуры: 'Напитки' },
      { ВидНоменклатуры: 'NewProduct' }
    ];
    
    const corrected = correctUnseenLabels(payload);
    
    expect(corrected[0].ВидНоменклатуры).toBe('Хлеб');
    expect(corrected[1].ВидНоменклатуры).toBe('Прочее');
    expect(corrected[2].ВидНоменклатуры).toBe('Напитки');
    expect(corrected[3].ВидНоменклатуры).toBe('Прочее');
  });
  
  it('should auto-correct validation errors for type conversion', () => {
    const payload = [{ quantity: '123' }];
    const zodError = new z.ZodError([
      {
        code: 'invalid_type',
        expected: 'number',
        received: 'string',
        path: [0, 'quantity'],
        message: 'Expected number, received string'
      }
    ]);
    
    const corrected = autoCorrectValidationErrors(payload, zodError);
    
    expect(corrected[0].quantity).toBe(123);
    expect(typeof corrected[0].quantity).toBe('number');
  });
  
  it('should auto-correct validation errors for minimum values', () => {
    const payload = [{ DaysCount: -5 }];
    const zodError = new z.ZodError([
      {
        code: 'too_small',
        minimum: 1,
        type: 'number',
        inclusive: true,
        path: [0, 'DaysCount'],
        message: 'Number must be greater than or equal to 1'
      }
    ]);
    
    const corrected = autoCorrectValidationErrors(payload, zodError);
    
    expect(corrected[0].DaysCount).toBe(1);
  });
  
  it('should auto-correct date format errors', () => {
    const payload = [{ date: '2025-01-15T10:30:00Z' }];
    const zodError = new z.ZodError([
      {
        code: 'invalid_date',
        path: [0, 'date'],
        message: 'Invalid date format'
      }
    ]);
    
    const corrected = autoCorrectValidationErrors(payload, zodError);
    
    expect(corrected[0].date).toBe('2025-01-15');
  });
});

describe('Retry Mechanism', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should retry on retryable errors', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce((() => {
        const error = new AxiosError('Network error');
        error.code = 'ECONNREFUSED';
        return error;
      })())
      .mockResolvedValueOnce({ success: true });
    
    const resultPromise = retryWithBackoff(mockOperation, {
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      retryableErrors: [IntegrationErrorType.NETWORK_ERROR]
    });
    
    // Fast-forward through the retry delay
    jest.advanceTimersByTime(100);
    
    const result = await resultPromise;
    
    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true });
  });
  
  it('should not retry on non-retryable errors', async () => {
    const mockOperation = jest.fn().mockRejectedValueOnce((() => {
      const error = new AxiosError('Validation error');
      error.response = {
        status: 400,
        data: { error: 'Invalid payload' }
      } as any;
      return error;
    })());
    
    await expect(retryWithBackoff(mockOperation)).rejects.toMatchObject({
      type: IntegrationErrorType.INVALID_PAYLOAD,
      retryable: false
    });
    
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });
  
  it('should respect max retries', async () => {
    const mockOperation = jest.fn().mockRejectedValue((() => {
      const error = new AxiosError('Server error');
      error.response = { status: 500 } as any;
      return error;
    })());
    
    const onRetry = jest.fn();
    
    const resultPromise = retryWithBackoff(mockOperation, {
      maxRetries: 2,
      initialDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      retryableErrors: [IntegrationErrorType.SERVER_ERROR],
      onRetry
    });
    
    // Fast-forward through all retry delays
    jest.advanceTimersByTime(100); // First retry
    jest.advanceTimersByTime(200); // Second retry
    
    await expect(resultPromise).rejects.toMatchObject({
      type: IntegrationErrorType.SERVER_ERROR
    });
    
    expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(onRetry).toHaveBeenCalledTimes(2);
  });
  
  it('should apply exponential backoff', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce((() => {
        const error = new AxiosError('Timeout');
        error.code = 'ECONNABORTED';
        return error;
      })())
      .mockRejectedValueOnce((() => {
        const error = new AxiosError('Timeout');
        error.code = 'ECONNABORTED';
        return error;
      })())
      .mockResolvedValueOnce({ success: true });
    
    const delays: number[] = [];
    
    const resultPromise = retryWithBackoff(mockOperation, {
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      retryableErrors: [IntegrationErrorType.TIMEOUT],
      onRetry: (attempt) => {
        if (attempt === 1) delays.push(100);
        if (attempt === 2) delays.push(200);
      }
    });
    
    jest.advanceTimersByTime(2000); // First retry after custom delay
    jest.advanceTimersByTime(200); // Second retry
    
    const result = await resultPromise;
    
    expect(result).toEqual({ success: true });
    expect(delays).toEqual([100, 200]); // Exponential backoff
  });
});

describe('Error Monitoring', () => {
  it('should log errors with context', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const monitor = new ConsoleErrorMonitor();
    
    monitor.logError({
      type: IntegrationErrorType.ML_SERVICE_ERROR,
      message: 'Test error',
      retryable: false
    }, { userId: '123', operation: 'forecast' });
    
    expect(consoleSpy).toHaveBeenCalledWith('[ERROR]', expect.objectContaining({
      type: IntegrationErrorType.ML_SERVICE_ERROR,
      message: 'Test error',
      retryable: false,
      context: { userId: '123', operation: 'forecast' }
    }));
    
    consoleSpy.mockRestore();
  });
  
  it('should log retry attempts', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const monitor = new ConsoleErrorMonitor();
    
    monitor.logRetry(2, {
      type: IntegrationErrorType.NETWORK_ERROR,
      message: 'Connection failed',
      retryable: true
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('[RETRY]', expect.objectContaining({
      attempt: 2,
      errorType: IntegrationErrorType.NETWORK_ERROR,
      message: 'Connection failed'
    }));
    
    consoleSpy.mockRestore();
  });
  
  it('should log corrections', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const monitor = new ConsoleErrorMonitor();
    
    monitor.logCorrection({
      type: IntegrationErrorType.UNSEEN_LABEL,
      message: 'Unseen label corrected',
      retryable: false,
      correctionStrategy: {
        type: 'auto',
        description: 'Replace with default category'
      }
    }, { original: 'Unknown', corrected: 'Прочее' });
    
    expect(consoleSpy).toHaveBeenCalledWith('[CORRECTION]', expect.objectContaining({
      errorType: IntegrationErrorType.UNSEEN_LABEL,
      strategy: 'auto',
      description: 'Replace with default category',
      correction: { original: 'Unknown', corrected: 'Прочее' }
    }));
    
    consoleSpy.mockRestore();
  });
});
