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
import requests

app = FastAPI(title="Sales Prediction API v2", version="2.0.0")

# Конфигурация
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:3000/api")
USE_API_FOR_FEATURES = os.getenv("USE_API_FOR_FEATURES", "false").lower() == "true"
API_TOKEN = os.getenv("API_TOKEN", "")  # JWT токен для авторизации

# Получаем путь к текущей директории
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Загрузка модели
try:
    model = joblib.load(os.path.join(BASE_DIR, 'gbr_pipeline.pkl'))
    
    # Загружаем CSV только если не используем API
    if not USE_API_FOR_FEATURES:
        item_metrics = pd.read_csv(os.path.join(BASE_DIR, 'sku_metrics.csv'))
        historical_data = pd.read_csv(os.path.join(BASE_DIR, 'historical_data.csv'))
        historical_data['Дата'] = pd.to_datetime(historical_data['Дата'], format='mixed', dayfirst=False, errors='coerce')
        logging.info(f"Модель загружена. Режим: {'API' if USE_API_FOR_FEATURES else 'CSV'}")
    else:
        logging.info("Модель загружена. Режим: API (данные будут получены из БД)")
    
except Exception as e:
    logging.error(f"Ошибка загрузки модели: {e}")
    raise

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Модели данных (остаются те же)
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
    ProductId: Optional[str] = None  # Добавляем ID продукта для API

# Список признаков для модели
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

def get_features_from_api(product_id: str, target_date: datetime) -> Optional[Dict[str, float]]:
    """Получить признаки для товара через API бэкенда"""
    try:
        headers = {"Authorization": f"Bearer {API_TOKEN}"} if API_TOKEN else {}
        response = requests.get(
            f"{BACKEND_API_URL}/ml/features/{product_id}",
            params={"targetDate": target_date.isoformat()},
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            logging.warning(f"Данные для товара {product_id} не найдены в БД")
            return None
        else:
            logging.error(f"API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logging.error(f"Ошибка при запросе к API: {e}")
        return None

def get_metrics_from_api(product_id: str) -> tuple:
    """Получить метрики точности через API"""
    try:
        headers = {"Authorization": f"Bearer {API_TOKEN}"} if API_TOKEN else {}
        response = requests.get(
            f"{BACKEND_API_URL}/ml/metrics/{product_id}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get('mape', 15.0), data.get('mae', 0.5)
        else:
            return 15.0, 0.5  # Дефолтные значения
            
    except Exception as e:
        logging.error(f"Ошибка при запросе метрик: {e}")
        return 15.0, 0.5

def get_item_features(item_name: str, item_code: str, target_date: pd.Timestamp, 
                     price: float = None, product_id: str = None) -> Dict[str, float]:
    """
    Получение признаков для товара
    Сначала пытается получить из API, если включен соответствующий режим
    """
    # Если включен режим API и есть product_id, пробуем получить из БД
    if USE_API_FOR_FEATURES and product_id:
        api_features = get_features_from_api(product_id, target_date)
        if api_features:
            # Обновляем цену если передана
            if price is not None:
                api_features['PricePerUnit'] = float(price)
            return api_features
    
    # Fallback на CSV данные
    if not USE_API_FOR_FEATURES or not product_id:
        # Оригинальная логика работы с CSV
        item_data = historical_data[
            (historical_data['ItemName'] == item_name) | 
            (historical_data['Code_Enc'].astype(str) == str(item_code))
        ]
        
        if item_data.empty:
            logging.warning(f"Товар '{item_name}' не найден в исторических данных")
            # Возвращаем дефолтные признаки
            return get_default_features(item_name, item_code, target_date, price)
        else:
            latest = item_data.sort_values("Дата").iloc[-1]
            features = {f: float(latest.get(f, 0.0)) for f in feature_cols}
            
            # Обновляем календарные признаки
            features["Месяц"] = float(target_date.month)
            features["ДеньМесяца"] = float(target_date.day)
            features["ДеньНедели"] = float(target_date.weekday())
            features["Квартал"] = float((target_date.month - 1) // 3 + 1)
            features["IsWeekend"] = float(int(target_date.weekday() in [5, 6]))
            if price is not None:
                features["PricePerUnit"] = float(price)
                
            return features
    
    # Если ничего не сработало, возвращаем дефолтные значения
    return get_default_features(item_name, item_code, target_date, price)

def get_default_features(item_name: str, item_code: str, target_date: pd.Timestamp, price: float = None) -> Dict[str, float]:
    """Возвращает дефолтные признаки для нового товара"""
    item_enc = hash(item_name) % 1000
    code_enc = hash(item_code) % 1000
    
    return {
        "ItemName_Enc": float(item_enc),
        "Code_Enc": float(code_enc),
        "Месяц": float(target_date.month),
        "ДеньМесяца": float(target_date.day),
        "ДеньНедели": float(target_date.weekday()),
        "Квартал": float((target_date.month - 1) // 3 + 1),
        "IsWeekend": float(int(target_date.weekday() in [5, 6])),
        "PricePerUnit": float(price) if price else 100.0,
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

def get_item_metrics(item_name: str, item_code: str, product_id: str = None) -> tuple:
    """Получение метрик для товара"""
    # Если включен режим API и есть product_id
    if USE_API_FOR_FEATURES and product_id:
        return get_metrics_from_api(product_id)
    
    # Иначе используем CSV
    if not USE_API_FOR_FEATURES:
        metrics_row = item_metrics[item_metrics['ItemName'] == item_name]
        if not metrics_row.empty:
            row = metrics_row.iloc[0]
            return float(row['MAPE']), float(row['MAE'])
    
    # Дефолтные значения
    return 15.0, 0.5

# Остальные эндпоинты остаются без изменений
@app.post("/forecast")
async def forecast(payload: List[Union[DaysHeader, SaleEvent]] = Body(...)):
    """Основной эндпоинт для прогнозирования продаж"""
    try:
        header = None
        sales_events = []
        
        for item in payload:
            if isinstance(item, DaysHeader):
                header = item
            elif isinstance(item, SaleEvent):
                sales_events.append(item)
        
        if header is None:
            raise HTTPException(status_code=400, detail="Не найден заголовок с DaysCount")
        
        if not sales_events:
            raise HTTPException(status_code=400, detail="Не найдены события продаж")
        
        days = header.DaysCount
        results = []
        
        # Добавляем общую метрику
        results.append({
            "MAPE": 10.0,
            "MAE": 0.5,
            "DaysPredict": days
        })
        
        # Обрабатываем каждый товар
        for sale in sales_events:
            target_date = pd.to_datetime(sale.Период)
            end_date = target_date + timedelta(days=days - 1)
            period_str = f"{target_date:%Y-%m-%d} - {end_date:%Y-%m-%d}"
            
            # Получаем признаки (теперь можем передать ProductId)
            features = get_item_features(
                sale.Номенклатура, 
                sale.Код or "unknown", 
                target_date, 
                sale.Цена_на_полке,
                sale.ProductId  # Новый параметр
            )
            
            # Делаем предсказание
            features_df = pd.DataFrame([features])
            features_ordered = features_df[feature_cols]
            prediction = model.predict(features_ordered)[0]
            
            predicted_quantity = max(1, int(prediction * days))
            
            # Получаем метрики
            mape, mae = get_item_metrics(
                sale.Номенклатура, 
                sale.Код or "unknown",
                sale.ProductId
            )
            
            results.append({
                "Период": period_str,
                "Номенклатура": sale.Номенклатура,
                "Код": sale.Код or "unknown",
                "MAPE": mape,
                "MAE": mae,
                "Количество": predicted_quantity
            })
        
        return results
        
    except Exception as e:
        logging.error(f"Ошибка в /forecast: {e}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "service": "Sales Prediction API",
        "version": "2.0.0",
        "mode": "API" if USE_API_FOR_FEATURES else "CSV",
        "backend_url": BACKEND_API_URL if USE_API_FOR_FEATURES else None
    }

@app.get("/health")
async def health():
    """Проверка здоровья сервиса"""
    return {"status": "healthy", "mode": "API" if USE_API_FOR_FEATURES else "CSV"} 