

# src/api_main.py
import logging, pickle, json, pathlib
from datetime import date, timedelta
from typing import List, Optional, Union

import numpy as np
import pandas as pd
from fastapi import FastAPI, Body, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from features import LagMaker, safe_mape    # только transform + метрика
from error_handler import handle_errors, exception_handler, ModelError, DataProcessingError, ExternalServiceError

app = FastAPI()
logging.basicConfig(level=logging.INFO)

# Регистрируем глобальный обработчик ошибок
app.add_exception_handler(Exception, exception_handler)
MAX_HORIZON = 60
# Импортируем кеш и метрики
from cache_manager import cache_manager
from metrics import metrics_collector, track_request_metrics, track_prediction_time, track_data_processing_time

# ────────── загружаем САМЫЙ новый pkl
def load_latest_model():
    try:
        pkls = sorted(pathlib.Path("models").glob("model-*.pkl"))
        if not pkls:
            raise ModelError("Нет обученных моделей в директории /models")
        return pickle.load(open(pkls[-1], "rb"))
    except Exception as e:
        if not isinstance(e, ModelError):
            raise ModelError(f"Ошибка загрузки модели: {str(e)}")
        raise

try:
    artifact = load_latest_model()
    model          = artifact["model"]
    encoder        = artifact["encoder"]
    FEAT_COLS      = artifact["feature_cols"]
    TRAIN_MAE      = artifact["metrics"]["mae"]
    TRAIN_MAPE     = artifact["metrics"]["mape"]
    #HORIZON        = artifact["horizon"]
    #MAX_HORIZON = 60
    
    # Проверка модели на тестовом примере
    import numpy as np
    test_data = np.zeros((1, len(FEAT_COLS)))
    try:
        _ = model.predict(test_data)
        logging.info("Модель успешно загружена и проверена")
    except Exception as e:
        logging.error(f"Ошибка при проверке модели: {str(e)}")
        raise ModelError("Модель не может делать предсказания на тестовых данных")
        
except Exception as e:
    logging.error(f"Ошибка при инициализации сервиса: {str(e)}")
    # Продолжаем работу, но ошибки будут обрабатываться при обращении к API
# ────────── схемы запроса
class DaysHeader(BaseModel):
    DaysCount: int = Field(..., ge=1, le=MAX_HORIZON)

class BaseEvt(BaseModel):
    Период: date
    Номенклатура: str
    Количество: int
    Код: Optional[str] = None
    ВидНоменклатуры: Optional[str] = None

    # разрешаем любые дополнительные колонки — они игнорируются
    class Config:
        extra = "allow"

class SaleEvt(BaseEvt):
    Type: str = "Продажа"
    # дополнительные поля — опциональны
    Поставщик: Optional[str] = None
    Производитель: Optional[str] = None
    Вес: Optional[float] = None
    Артикул: Optional[str] = None
    Группа: Optional[str] = None
    Сумма: Optional[float] = None
    Срок_годности_час: Optional[int] = None
    Наличие_товара: Optional[bool] = None
    Наличие_товара_в_магазине: Optional[bool] = None
    Категория_товара: Optional[str] = None
    Задержка_поставки_дн: Optional[int] = None
    Адрес_точки: Optional[str] = None
    Заканчивался_ли_продукт: Optional[bool] = None
    Цена_на_полке: Optional[float] = None
    Часов_работала_точка: Optional[int] = None
    Остаток_в_магазине: Optional[int] = None

class SuppEvt(BaseEvt):
    Type: str = "Поставка"
    Цена: Optional[float] = None

ReqItem  = Union[DaysHeader, SaleEvt, SuppEvt]
Payload  = List[ReqItem]

# ────────── схемы ответа
class Head(BaseModel):
    MAPE: float
    MAE: float
    DaysPredict: int

class Row(BaseModel):
    Период: str
    Номенклатура: str
    Код: Optional[str]
    MAPE: float
    MAE: float
    Количество: int
# ────────────────────────── helper
def make_features(df: pd.DataFrame) -> pd.DataFrame:
    return LagMaker().transform(df)
# ────────── helpers
def build_features_live(df: pd.DataFrame) -> pd.DataFrame:
    """Берёт последние 60 дней => lag / ma / trend"""
    maker = LagMaker()
    return maker.transform(df)

# ────────── энд-пойнт
@app.post("/forecast")
@handle_errors
@track_request_metrics(endpoint="/forecast")
async def forecast(payload: Payload = Body(...)):
    try:
        header = next(p for p in payload if isinstance(p, DaysHeader))
    except StopIteration:
        raise HTTPException(422, "Отсутствует объект DaysCount")

    horizon = header.DaysCount
    sales = [p for p in payload if isinstance(p, SaleEvt)]
    if not sales:
        raise HTTPException(422, "Нет продаж в запросе")

    # Кеширование
    try:
        cache_key = cache_manager.generate_cache_key([s.dict() for s in sales], horizon)
        cached_result = cache_manager.get_cached_forecast(cache_key)
        if cached_result:
            return cached_result
    except Exception as e:
        logging.warning(f"Cache error: {str(e)}")

    try:
        sales_df = pd.DataFrame([s.dict() for s in sales])
        sales_df["Период"] = pd.to_datetime(sales_df["Период"])
    except Exception as e:
        raise DataProcessingError(f"Ошибка при преобразовании данных: {str(e)}")

    # Подключение к внешним сервисам для получения дополнительных данных (опционально)
    # Здесь вы можете добавить вызовы внешних сервисов с использованием функции get_external_data
    # из error_handler.py
    
    try:
        # фичи на последние даты
        df_feat = make_features(sales_df)
        latest = df_feat.groupby("Номенклатура").tail(1).copy()
        latest["ItemEnc"] = encoder.transform(latest["Номенклатура"])
        X = latest[FEAT_COLS]
    except Exception as e:
        raise DataProcessingError(f"Ошибка при создании признаков: {str(e)}")

    try:
        # --- 4. прогноз суточного спроса → умножаем на DaysCount
        import time
        start_time = time.time()
        raw_pred   = model.predict(X) 
        daily_pred = np.clip(raw_pred, 0, None)
        period_pred = (daily_pred * horizon).round().astype(int)
        duration = time.time() - start_time
        metrics_collector.record_prediction_time("lightgbm", duration)
    except Exception as e:
        raise ModelError(f"Ошибка при прогнозировании: {str(e)}")

    # --- 5. формируем ответ
    ref_date   = sales_df["Период"].max()
    period_str = f"{ref_date:%Y-%m-%d} - {(ref_date + timedelta(days=horizon-1)):%Y-%m-%d}"

    answer: List[dict] = [
        Head(MAPE=round(TRAIN_MAPE*100, 1), MAE=round(TRAIN_MAE, 3), DaysPredict=horizon).dict()
    ]

    for (_, row), qty in zip(latest.iterrows(), period_pred):
        subset = sales_df[sales_df["Номенклатура"] == row["Номенклатура"]]
        vis = subset["ВидНоменклатуры"].dropna().head(1)
        name = vis.iloc[0] if not vis.empty else row["Номенклатура"]
        code = subset["Код"].dropna().head(1)
        answer.append(Row(
            Период=period_str,
            Номенклатура=name,
            Код=code.iloc[0] if not code.empty else None,
            MAPE=round(TRAIN_MAPE*100, 1),
            MAE=round(TRAIN_MAE, 3),
            Количество=int(qty)
        ).dict())

    # Кеширование ответа
    try:
        cache_manager.set_cached_forecast(cache_key, answer)
    except Exception as e:
        logging.warning(f"Cache set error: {str(e)}")
    return answer

# Эндпоинт для проверки состояния сервиса
@app.get("/health")
async def health_check():
    try:
        # Простая проверка доступности модели
        test_data = np.zeros((1, len(FEAT_COLS)))
        _ = model.predict(test_data)

        # Статистика кеша и метрики использования сервиса
        cache_stats = cache_manager.get_cache_stats()

        return {
            "status": "ok",
            "model_loaded": True,
            "train_metrics": {
                "mae": float(TRAIN_MAE),
                "mape": float(TRAIN_MAPE)
            },
            "cache_stats": cache_stats,
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "model_loaded": False
        }

# Эндпоинт для метрик Prometheus
@app.get("/metrics")
async def metrics():
    from metrics import get_metrics
    return Response(get_metrics(), media_type="text/plain")

# Эндпоинт для очистки кеша
@app.delete("/cache")
async def clear_cache():
    try:
        count = cache_manager.invalidate_cache_by_pattern()
        return {"message": f"Cache cleared. Removed {count} entries", "status": "success"}
    except Exception as e:
        return {"message": f"Error clearing cache: {str(e)}", "status": "error"}

# Эндпоинт для очистки кеша для конкретных товаров
@app.post("/cache/invalidate")
async def invalidate_cache_for_items(items: List[str]):
    try:
        count = cache_manager.invalidate_cache_for_items(items)
        return {"message": f"Invalidated cache for {len(items)} items. Removed {count} entries", "status": "success"}
    except Exception as e:
        return {"message": f"Error invalidating cache: {str(e)}", "status": "error"}

# Эндпоинт для статистики кеша
@app.get("/cache/stats")
async def cache_stats():
    try:
        stats = cache_manager.get_cache_stats()
        return {"stats": stats, "status": "success"}
    except Exception as e:
        return {"message": f"Error getting cache stats: {str(e)}", "status": "error"}

# ────────── run
if __name__ == "__main__":
    import uvicorn
    try:
        logging.info("Запуск сервиса прогнозирования")
        uvicorn.run(app, host="0.0.0.0", port=5678)
    except Exception as e:
        logging.error(f"Ошибка при запуске сервиса: {str(e)}")
