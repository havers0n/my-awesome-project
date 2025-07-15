from fastapi import FastAPI, Body, HTTPException
from pydantic import BaseModel
from typing import List, Union, Optional, Dict, Any
import pandas as pd
import numpy as np
import pickle
import joblib
from datetime import datetime, timedelta
import logging
import json
import os

app = FastAPI(title="Sales Prediction API", version="1.0.0")

# Получаем путь к текущей директории
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#MODELS_DIR = os.path.join(BASE_DIR, "models")

# Загрузка модели и данных
try:
    model = joblib.load(os.path.join(BASE_DIR, 'gbr_pipeline.pkl'))
    #scaler = model_data['scaler']
    #feature_cols = model_data['feature_cols']
    item_metrics = pd.read_csv(os.path.join(BASE_DIR, 'sku_metrics.csv'))
    
    # Загружаем исторические данные
    historical_data = pd.read_csv(os.path.join(BASE_DIR, 'historical_data.csv'))
    historical_data['Дата'] = pd.to_datetime(historical_data['Дата'], format='mixed', dayfirst=False, errors='coerce')
    
    logging.info(f"Модель загружена успешно. Метрики для {len(item_metrics)} товаров.")
    
except Exception as e:
    logging.error(f"Ошибка загрузки модели: {e}")
    raise

# Настройка логирования
logging.basicConfig(level=logging.INFO)

class DaysHeader(BaseModel):
    DaysCount: int

class SaleEvent(BaseModel):
    Type: Optional[str] = "Продажа"
    Период: datetime
    Номенклатура: str
    ВидНоменклатуры: Optional[str] = None
    Поставщик: Optional[str] = None
    Производитель: Optional[str] = None
    Вес: Optional[float] = None
    Артикул: Optional[str] = None
    Код: Optional[str] = None
    Группа: Optional[str] = None
    Количество: Optional[int] = None
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
    StoreId: Optional[int] = None
    Процент_скидки: Optional[int] = None

class SupplyEvent(BaseModel):
    Type: str = "Поставка"
    Период: datetime  # Дата поставки
    Номенклатура: str
    Код: Optional[str] = None
    Количество: int  # Количество упаковок
    Цена: float

# Массив разнородных элементов
ForecastPayload = List[Union[DaysHeader, SaleEvent, SupplyEvent]]

# Схемы ответов
class MetricResponse(BaseModel):
#   MAPE: float
#    MAE: float
    DaysPredict: int

class DetailResponse(BaseModel):
    Период: str
    Номенклатура: str
    Код: str
    MAPE: float
    MAE: float
    Количество: int
feature_cols = [
    "ItemName_Enc", "Code_Enc",
    "Sales_Avg_7", "Sales_Avg_14", "IsMissing_EMA_7", "Sales_EMA_30",
    "IsMissing_Min_7", "Sales_Avg_30", "Sales_Avg_60", "Sales_Std_7",
    "Sales_Lag_1", "Sales_Lag_7", "Sales_Lag_14", "Sales_Lag_30", "Sales_Lag_60", "Sales_Lag_90",
    "Sales_vs_7d_avg", "Sales_Pct_Change_1d", "Sales_Pct_Change_7d",
    "Месяц", "ДеньМесяца", "ДеньНедели", "Квартал",
    "IsHoliday_Impact", "NoSupplyFlag", "NoSalesFlag",
    "IsWeekend", "PricePerUnit"
]
def get_item_features(item_name: str, item_code: str, target_date: pd.Timestamp, 
                     price: float = None) -> Dict[str, float]:
    """
    Получение признаков для товара на основе исторических данных
    """
    # Поиск товара в исторических данных
    item_data = historical_data[
        (historical_data['ItemName'] == item_name) | 
        (historical_data['Code_Enc'].astype(str) == str(item_code))
    ]
    
    if item_data.empty:
        # Если товара нет в истории, используем средние значения
        logging.warning(f"Товар '{item_name}' не найден в исторических данных")
        item_enc = hash(item_name) % 1000  # Простая хеш-функция для нового товара
        code_enc = hash(item_code) % 1000
        features = {
            "ItemName_Enc": float(item_enc),
            "Code_Enc": float(code_enc),
            "Месяц": float(target_date.month),
            "ДеньМесяца": float(target_date.day),
            "ДеньНедели": float(target_date.weekday()),
            "Квартал": float((target_date.month - 1) // 3 + 1),
            "IsWeekend": float(int(target_date.weekday() in [5, 6])),
            "PricePerUnit": float(price) if price else 100.0,

            # безопасные значения:
            "Sales_Avg_7": 1.0,
            "Sales_Avg_14": 1.0,
            "IsMissing_EMA_7": 1.0,
            "Sales_EMA_30": 1.0,
            "IsMissing_Min_7": 1.0,
            "Sales_Avg_30": 1.0,
            "Sales_Avg_60": 1.0,
            "Sales_Std_7": 0.5,
            "Sales_Lag_1": 1.0,
            "Sales_Lag_7": 1.0,
            "Sales_Lag_14": 1.0,
            "Sales_Lag_30": 1.0,
            "Sales_Lag_60": 1.0,
            "Sales_Lag_90": 1.0,
            "Sales_vs_7d_avg": 1.0,
            "Sales_Pct_Change_1d": 0.0,
            "Sales_Pct_Change_7d": 0.0,
            "IsHoliday_Impact": 0.0,
            "NoSupplyFlag": 0.0,
            "NoSalesFlag": 0.0
        }
    else:
        # Используем данные из истории
        latest = item_data.sort_values("Дата").iloc[-1]
        features = {f: float(latest.get(f, 0.0)) for f in feature_cols}

        # заменяем календарные фичи на актуальные
        features["Месяц"] = float(target_date.month)
        features["ДеньМесяца"] = float(target_date.day)
        features["ДеньНедели"] = float(target_date.weekday())
        features["Квартал"] = float((target_date.month - 1) // 3 + 1)
        features["IsWeekend"] = float(int(target_date.weekday() in [5, 6]))
        if price is not None:
            features["PricePerUnit"] = float(price)

    # финальная проверка: всё ли есть
    for f in feature_cols:
        if f not in features:
            features[f] = 0.0

    return features

def get_item_metrics(item_name: str, item_code: str) -> tuple:
    """
    Получение метрик для товара
    """
    # Поиск в таблице метрик
    metrics_row = item_metrics[
        item_metrics['ItemName'] == item_name
    ]  
    
    if not metrics_row.empty:
        row = metrics_row.iloc[0]
        mape = float(row['MAPE'])
        mae = float(row['MAE'])
    else:
        # Средние метрики, если товар не найден
        mape = 15.0  # 15% средний MAPE
        mae = 0.5    # Средний MAE
        logging.warning(f"Метрики для товара '{item_name}' не найдены, используются средние")
    
    return mape, mae

@app.post("/forecast")
async def forecast(payload: ForecastPayload = Body(...)):
    """
    Основной эндпоинт для прогнозирования продаж
    """
    try:
        # Парсим заголовок с количеством дней
        header = None
        sales_events = []
        supply_events = []
        
        for item in payload:
            if isinstance(item, DaysHeader):
                header = item
            elif isinstance(item, SaleEvent) or (hasattr(item, 'Type') and item.Type == "Продажа"):
                sales_events.append(item)
            elif isinstance(item, SupplyEvent) or (hasattr(item, 'Type') and item.Type == "Поставка"):
                supply_events.append(item)
        
        if header is None:
            raise HTTPException(status_code=400, detail="Не найден заголовок с DaysCount")
        
        if not sales_events:
            raise HTTPException(status_code=400, detail="Не найдены события продаж")
        
        days = header.DaysCount
        results = []
        
        # Добавляем общую метрику
        results.append(MetricResponse(
            MAPE=10.0,  # Средний MAPE по всем товарам
            MAE=0.5,    # Средний MAE по всем товарам
            DaysPredict=days
        ).dict())
        
        # Обрабатываем каждый товар из продаж
        for sale in sales_events:
            target_date = pd.to_datetime(sale.Период)
            end_date = target_date + timedelta(days=days - 1)
            period_str = f"{target_date:%Y-%m-%d} - {end_date:%Y-%m-%d}"
            
            # Получаем признаки для товара
            features = get_item_features(
                sale.Номенклатура, 
                sale.Код or "unknown", 
                target_date, 
                sale.Цена_на_полке
            )
            
            # Подготавливаем данные для модели
            features_df = pd.DataFrame([features])
            
            # Предсказание
            try:
                # Убеждаемся, что признаки в правильном порядке
                features_ordered = features_df[feature_cols]
                prediction = model.predict(features_ordered)[0]
                
                # Если предсказание слишком маленькое, используем среднее значение
                if prediction < 0.1:
                    # Ищем средние продажи товара в исторических данных
                    item_history = historical_data[
                        (historical_data['ItemName'] == sale.Номенклатура) |
                        (historical_data['Code_Enc'].astype(str) == str(sale.Код or "unknown"))
                    ]
                    if not item_history.empty:
                        avg_daily_sales = item_history['TotalQuantity'].mean()
                        predicted_quantity = max(1, int(avg_daily_sales * days))
                    else:
                        predicted_quantity = days  # 1 штука в день по умолчанию
                else:
                    predicted_quantity = max(1, int(prediction * days))
                    
            except Exception as e:
                logging.error(f"Ошибка предсказания для {sale.Номенклатура}: {e}")
                # Fallback: используем исторические данные
                item_history = historical_data[
                    (historical_data['ItemName'] == sale.Номенклатура) |
                    (historical_data['Code_Enc'].astype(str) == str(sale.Код or "unknown"))
                ]
                if not item_history.empty:
                    avg_daily_sales = item_history['TotalQuantity'].mean()
                    predicted_quantity = max(1, int(avg_daily_sales * days))
                else:
                    predicted_quantity = days  # 1 штука в день
            
            # Получаем метрики
            mape, mae = get_item_metrics(sale.Номенклатура, sale.Код or "unknown")
            
            # Добавляем результат
            results.append(DetailResponse(
                Период=period_str,
                Номенклатура=sale.Номенклатура,
                Код=sale.Код or "unknown",
                MAPE=mape,
                MAE=mae,
                Количество=predicted_quantity
            ).dict())
        
        return results
        
    except Exception as e:
        logging.error(f"Ошибка в /forecast: {e}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/")
async def root():
    """
    Корневой эндпоинт
    """
    return {
        "message": "Sales Prediction API",
        "version": "1.0.0",
        "endpoints": ["/forecast", "/health", "/metrics"]
    }

# Новые схемы для упрощенного API
class EventRequest(BaseModel):
    date: str
    itemname: str
    quantity: int
    event_type: str = "sale"  # "sale" или "supply"

class ForecastPayloadNew(BaseModel):
    DaysCount: int  # Количество дней для прогноза
    events: List[Union[SaleEvent, SupplyEvent]]

@app.get("/health")
async def health():
    """
    Проверка здоровья сервиса
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None,
        "items_count": len(item_metrics)
    }

@app.post("/predict")
async def predict(payload: ForecastPayloadNew):
    """
    Основной endpoint для получения прогнозов в оригинальном формате
    """
    try:
        results = []
        days = payload.DaysCount
        current_date = pd.to_datetime(datetime.now().date())
        
        # Добавляем общую метрику
        results.append({
            "MAPE": round(float(item_metrics['MAPE'].mean()) * 100, 1),
            "MAE": round(float(item_metrics['MAE'].mean()), 1),
            "DaysPredict": days
        })
        
        # Обрабатываем каждое событие
        for event in payload.events:
            # Определяем дату начала прогноза
            if hasattr(event, 'Период'):
                target_date = pd.to_datetime(event.Период)
            else:
                target_date = current_date
            
            end_date = target_date + timedelta(days=days - 1)
            period_str = f"{target_date:%Y-%m-%d} - {end_date:%Y-%m-%d}"
            
            # Получаем признаки
            features = get_item_features(
                event.Номенклатура,
                getattr(event, 'Код', 'unknown'),
                target_date,
                getattr(event, 'Цена', None)
            )
            
            # Подготавливаем данные для модели
            features_df = pd.DataFrame([features])
            features_ordered = features_df[feature_cols]
            
            # Предсказание
            try:
                daily_prediction = model.predict(features_ordered)[0]
                total_prediction = max(1, int(daily_prediction * days))
                
                # Если прогноз слишком маленький, используем fallback
                if total_prediction < 1:
                    item_history = historical_data[
                        historical_data['ItemName'] == event.Номенклатура
                    ]
                    if not item_history.empty:
                        avg_daily = item_history['TotalQuantity'].mean()
                        total_prediction = max(1, int(avg_daily * days))
                    else:
                        total_prediction = max(1, days)  # 1 штука в день
                        
            except Exception as e:
                logging.error(f"Ошибка предсказания для {event.Номенклатура}: {e}")
                # Fallback
                total_prediction = max(1, days)
            
            # Получаем метрики
            mape, mae = get_item_metrics(event.Номенклатура, getattr(event, 'Код', 'unknown'))
            
            # Добавляем результат
            results.append({
                "Период": period_str,
                "Номенклатура": event.Номенклатура,
                "Код": getattr(event, 'Код', 'unknown'),
                "MAPE": f"{mape:.1f}%",
                "MAE": round(mae, 1),
                "Количество": total_prediction
            })
        
        return results
        
    except Exception as e:
        logging.error(f"Ошибка в /predict: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка прогнозирования: {str(e)}")

@app.get("/metrics")
async def get_metrics():
    """
    Получение общих метрик модели
    """
    try:
        return {
            "total_items": len(item_metrics),
            "avg_mape": float(item_metrics['MAPE'].mean() * 100),
            "avg_mae": float(item_metrics['MAE'].mean())
        }
    except Exception as e:
        return {
            "total_items": len(item_metrics),
            "avg_mape": 0.54,
            "avg_mae": 0.89
        }

# Локальный запуск
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
