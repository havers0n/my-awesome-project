export type MLErrorType = 
  | 'timeout'
  | 'invalidFormat'
  | 'insufficientData'
  | 'timeoutExceeded'
  | 'networkError'
  | 'serverError'
  | 'unknownError';

export interface MLError extends Error {
  type: MLErrorType;
  code?: string;
  details?: any;
  retryable?: boolean;
}

export interface ErrorInfo {
  title: string;
  message: string;
  suggestion: string;
  retryable: boolean;
  icon: string;
}

export const ERROR_MESSAGES: Record<MLErrorType, ErrorInfo> = {
  timeout: {
    title: 'Таймаут соединения',
    message: 'Не удалось подключиться к ML сервису в течение отведенного времени',
    suggestion: 'Проверьте подключение к интернету и попробуйте снова',
    retryable: true,
    icon: '⏱️'
  },
  invalidFormat: {
    title: 'Некорректный формат данных',
    message: 'Предоставленные данные не соответствуют ожидаемому формату',
    suggestion: 'Проверьте формат входных данных и попробуйте снова',
    retryable: false,
    icon: '📊'
  },
  insufficientData: {
    title: 'Недостаточно данных',
    message: 'Для создания точного прогноза требуется больше исторических данных',
    suggestion: 'Загрузите дополнительные данные за предыдущие периоды',
    retryable: false,
    icon: '📈'
  },
  timeoutExceeded: {
    title: 'Превышен лимит времени',
    message: 'Обработка прогноза заняла слишком много времени',
    suggestion: 'Попробуйте уменьшить объем данных или повторите попытку позже',
    retryable: true,
    icon: '⏰'
  },
  networkError: {
    title: 'Ошибка сети',
    message: 'Не удалось установить соединение с сервером',
    suggestion: 'Проверьте подключение к интернету и попробуйте снова',
    retryable: true,
    icon: '🌐'
  },
  serverError: {
    title: 'Ошибка сервера',
    message: 'На сервере произошла внутренняя ошибка',
    suggestion: 'Попробуйте повторить запрос через несколько минут',
    retryable: true,
    icon: '🔧'
  },
  unknownError: {
    title: 'Неизвестная ошибка',
    message: 'Произошла непредвиденная ошибка',
    suggestion: 'Попробуйте обновить страницу или обратитесь к администратору',
    retryable: true,
    icon: '❗'
  }
};

export function createMLError(type: MLErrorType, message?: string, details?: any): MLError {
  const errorInfo = ERROR_MESSAGES[type];
  const error = new Error(message || errorInfo.message) as MLError;
  error.type = type;
  error.details = details;
  error.retryable = errorInfo.retryable;
  return error;
}

export function getErrorFromAxiosError(error: any): MLError {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return createMLError('timeout');
  }
  
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return createMLError('networkError');
  }
  
  if (error.response?.status >= 500) {
    return createMLError('serverError');
  }
  
  if (error.response?.status === 400) {
    const responseData = error.response.data;
    if (responseData?.error?.includes('insufficient')) {
      return createMLError('insufficientData');
    }
    if (responseData?.error?.includes('format') || responseData?.error?.includes('invalid')) {
      return createMLError('invalidFormat');
    }
  }
  
  if (error.response?.status === 408 || error.response?.status === 504) {
    return createMLError('timeoutExceeded');
  }
  
  return createMLError('unknownError', error.message, error);
}
