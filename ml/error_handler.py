from loguru import logger
import traceback
import json
from typing import Dict, Any, Optional
from functools import wraps
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

# Настройка loguru - лог в stdout в JSON-формате
logger.remove()
logger.add(lambda msg: print(msg, end=""), serialize=True)

# Типы ошибок
class ModelError(Exception):
    """Ошибка при работе с моделью"""
    pass

class DataProcessingError(Exception):
    """Ошибка при обработке данных"""
    pass

class ExternalServiceError(Exception):
    """Ошибка при обращении к внешним сервисам"""
    pass

# Функция для форматированного вывода ошибок
def format_error_response(error_type: str, message: str, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Создает структурированный ответ с ошибкой для фронтенда"""
    response = {
        "success": False,
        "error": {
            "type": error_type,
            "message": message
        }
    }
    
    if details:
        response["error"]["details"] = details
    
    return response

# Декоратор для перехвата ошибок в эндпоинтах
def handle_errors(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ModelError as e:
            logger.error(f"Ошибка модели: {str(e)}")
            logger.debug(traceback.format_exc())
            return JSONResponse(
                status_code=500,
                content=format_error_response("MODEL_ERROR", str(e))
            )
        except DataProcessingError as e:
            logger.error(f"Ошибка обработки данных: {str(e)}")
            logger.debug(traceback.format_exc())
            return JSONResponse(
                status_code=422,
                content=format_error_response("DATA_PROCESSING_ERROR", str(e))
            )
        except ExternalServiceError as e:
            logger.error(f"Ошибка внешнего сервиса: {str(e)}")
            logger.debug(traceback.format_exc())
            return JSONResponse(
                status_code=503,
                content=format_error_response("EXTERNAL_SERVICE_ERROR", str(e))
            )
        except HTTPException as e:
            # Пробрасываем HTTPException напрямую
            raise e
        except Exception as e:
            # Перехватываем все остальные ошибки
            logger.error(f"Непредвиденная ошибка: {str(e)}")
            logger.error(traceback.format_exc())
            return JSONResponse(
                status_code=500,
                content=format_error_response("INTERNAL_SERVER_ERROR", "Внутренняя ошибка сервера")
            )
    return wrapper

# Функция для безопасного получения данных из внешних сервисов
async def get_external_data(service_url, params=None, timeout=10, max_retries=2, backoff=2):
    """Получает данные из внешнего сервиса с обработкой ошибок, с retry и backoff"""
    import aiohttp
    import asyncio
    import time
    attempt = 0
    while attempt <= max_retries:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(service_url, params=params, timeout=timeout) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        raise ExternalServiceError(f"Сервис вернул статус {response.status}: {error_text}")
        except asyncio.TimeoutError:
            if attempt < max_retries:
                logger.warning(f"Timeout trying to reach {service_url}, attempt {attempt+1}/{max_retries}. Retrying in {backoff} seconds.")
                await asyncio.sleep(backoff)
                attempt += 1
                continue
            raise ExternalServiceError(f"Тайм-аут при подключении к сервису: {service_url}")
        except Exception as e:
            if isinstance(e, ExternalServiceError):
                if attempt < max_retries:
                    logger.warning(f"ExternalServiceError on {service_url}, attempt {attempt+1}/{max_retries}. Retrying in {backoff} seconds.")
                    await asyncio.sleep(backoff)
                    attempt +=1
                    continue
                raise
            if attempt < max_retries:
                logger.warning(f"Exception on {service_url}, attempt {attempt+1}/{max_retries}: {e}. Retrying in {backoff} seconds.")
                await asyncio.sleep(backoff)
                attempt += 1
                continue
            raise ExternalServiceError(f"Ошибка при получении данных: {str(e)}")
        break

# Функция для проверки модели перед использованием
def validate_model(model, X_sample):
    """Проверяет, что модель работает корректно на тестовом примере"""
    try:
        # Пробуем сделать предсказание на одном примере
        _ = model.predict(X_sample)
        return True
    except Exception as e:
        raise ModelError(f"Модель не может сделать предсказание: {str(e)}")

# Обработчик ошибок для регистрации в FastAPI
async def exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Глобальный обработчик исключений для FastAPI"""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=format_error_response("API_ERROR", exc.detail)
        )
    
    logger.error(f"Необработанное исключение: {str(exc)}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content=format_error_response("INTERNAL_SERVER_ERROR", "Внутренняя ошибка сервера")
    )
