export interface MLError extends Error {
  type: MLErrorType;
  details?: any;
  code?: string;
  retryable?: boolean;
}

export type MLErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'FORECAST_ERROR'
  | 'DATA_ERROR'
  | 'PERMISSION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorInfo {
  title: string;
  message: string;
  suggestion: string;
  retryable: boolean;
  icon: string;
}

export const ERROR_MESSAGES: Record<MLErrorType, ErrorInfo> = {
  NETWORK_ERROR: {
    title: 'Ошибка сети',
    message: 'Не удается подключиться к серверу',
    suggestion: 'Проверьте подключение к интернету и попробуйте еще раз',
    retryable: true,
    icon: '🌐'
  },
  VALIDATION_ERROR: {
    title: 'Ошибка валидации',
    message: 'Переданные данные не прошли проверку',
    suggestion: 'Проверьте корректность введенных данных',
    retryable: false,
    icon: '⚠️'
  },
  FORECAST_ERROR: {
    title: 'Ошибка прогнозирования',
    message: 'Не удается создать прогноз',
    suggestion: 'Проверьте входные данные или попробуйте позже',
    retryable: true,
    icon: '📊'
  },
  DATA_ERROR: {
    title: 'Ошибка данных',
    message: 'Проблема с обработкой данных',
    suggestion: 'Попробуйте обновить страницу или обратитесь к администратору',
    retryable: true,
    icon: '💾'
  },
  PERMISSION_ERROR: {
    title: 'Недостаточно прав',
    message: 'У вас нет прав для выполнения этого действия',
    suggestion: 'Обратитесь к администратору для получения необходимых прав',
    retryable: false,
    icon: '🔒'
  },
  TIMEOUT_ERROR: {
    title: 'Превышено время ожидания',
    message: 'Операция занимает слишком много времени',
    suggestion: 'Попробуйте еще раз или обратитесь к администратору',
    retryable: true,
    icon: '⏱️'
  },
  UNKNOWN_ERROR: {
    title: 'Неизвестная ошибка',
    message: 'Произошла непредвиденная ошибка',
    suggestion: 'Попробуйте обновить страницу или обратитесь к администратору',
    retryable: true,
    icon: '❓'
  }
};

export const createMLError = (
  type: MLErrorType,
  message?: string,
  details?: any,
  code?: string
): MLError => {
  const error = new Error(message || ERROR_MESSAGES[type].message) as MLError;
  error.type = type;
  error.details = details;
  error.code = code;
  error.retryable = ERROR_MESSAGES[type].retryable;
  return error;
};
