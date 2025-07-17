import time
import logging
from typing import Dict, Any
from prometheus_client import Counter, Histogram, Gauge, Info, generate_latest
from prometheus_client.core import CollectorRegistry
from functools import wraps

logger = logging.getLogger(__name__)

# Создаем регистр для метрик
registry = CollectorRegistry()

# Метрики для API
REQUEST_COUNT = Counter(
    'ml_api_requests_total',
    'Total number of API requests',
    ['method', 'endpoint', 'status_code'],
    registry=registry
)

REQUEST_DURATION = Histogram(
    'ml_api_request_duration_seconds',
    'API request duration in seconds',
    ['method', 'endpoint'],
    registry=registry
)

MODEL_PREDICTION_TIME = Histogram(
    'ml_model_prediction_duration_seconds',
    'Time spent on model prediction',
    ['model_type'],
    registry=registry
)

CACHE_OPERATIONS = Counter(
    'ml_cache_operations_total',
    'Total cache operations',
    ['operation', 'result'],
    registry=registry
)

ACTIVE_PREDICTIONS = Gauge(
    'ml_active_predictions',
    'Number of active predictions being processed',
    registry=registry
)

DATA_PROCESSING_TIME = Histogram(
    'ml_data_processing_duration_seconds',
    'Time spent on data processing',
    ['operation'],
    registry=registry
)

MODEL_ACCURACY = Gauge(
    'ml_model_accuracy',
    'Current model accuracy metrics',
    ['metric_type'],
    registry=registry
)

BATCH_SIZE = Histogram(
    'ml_batch_size',
    'Size of prediction batches',
    registry=registry
)

ERROR_COUNT = Counter(
    'ml_errors_total',
    'Total number of errors',
    ['error_type', 'endpoint'],
    registry=registry
)

QUEUE_SIZE = Gauge(
    'ml_queue_size',
    'Size of processing queues',
    ['queue_type'],
    registry=registry
)

# Информация о модели
MODEL_INFO = Info(
    'ml_model_info',
    'Information about the loaded model',
    registry=registry
)

class MetricsCollector:
    def __init__(self):
        self.start_time = time.time()
        
    def record_request(self, method: str, endpoint: str, status_code: int, duration: float):
        """Записывает метрики запроса"""
        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
        REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
        
    def record_prediction_time(self, model_type: str, duration: float):
        """Записывает время предсказания модели"""
        MODEL_PREDICTION_TIME.labels(model_type=model_type).observe(duration)
        
    def record_cache_operation(self, operation: str, result: str):
        """Записывает операцию кеша"""
        CACHE_OPERATIONS.labels(operation=operation, result=result).inc()
        
    def set_active_predictions(self, count: int):
        """Устанавливает количество активных предсказаний"""
        ACTIVE_PREDICTIONS.set(count)
        
    def record_data_processing_time(self, operation: str, duration: float):
        """Записывает время обработки данных"""
        DATA_PROCESSING_TIME.labels(operation=operation).observe(duration)
        
    def set_model_accuracy(self, metric_type: str, value: float):
        """Устанавливает метрики точности модели"""
        MODEL_ACCURACY.labels(metric_type=metric_type).set(value)
        
    def record_batch_size(self, size: int):
        """Записывает размер батча"""
        BATCH_SIZE.observe(size)
        
    def record_error(self, error_type: str, endpoint: str):
        """Записывает ошибку"""
        ERROR_COUNT.labels(error_type=error_type, endpoint=endpoint).inc()
        
    def set_queue_size(self, queue_type: str, size: int):
        """Устанавливает размер очереди"""
        QUEUE_SIZE.labels(queue_type=queue_type).set(size)
        
    def set_model_info(self, model_info: Dict[str, Any]):
        """Устанавливает информацию о модели"""
        MODEL_INFO.info(model_info)

# Глобальный экземпляр коллектора метрик
metrics_collector = MetricsCollector()

def track_request_metrics(endpoint: str):
    """Декоратор для отслеживания метрик запроса"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            method = "POST"  # Большинство ML endpoints - POST
            status_code = 200
            
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                status_code = 500
                metrics_collector.record_error(type(e).__name__, endpoint)
                raise
            finally:
                duration = time.time() - start_time
                metrics_collector.record_request(method, endpoint, status_code, duration)
                
        return wrapper
    return decorator

def track_prediction_time(model_type: str = "lightgbm"):
    """Декоратор для отслеживания времени предсказания"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                metrics_collector.record_prediction_time(model_type, duration)
                
        return wrapper
    return decorator

def track_data_processing_time(operation: str):
    """Декоратор для отслеживания времени обработки данных"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                metrics_collector.record_data_processing_time(operation, duration)
                
        return wrapper
    return decorator

def get_metrics():
    """Возвращает метрики в формате Prometheus"""
    return generate_latest(registry)
