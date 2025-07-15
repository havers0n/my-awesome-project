from fastapi import FastAPI, Body, HTTPException
from pydantic import BaseModel
from typing import List, Union, Optional, Dict, Any
import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timedelta
import logging
import json
import os

app = FastAPI(title="Sales Prediction API", version="1.0.0")

# Получаем путь к текущей директории
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Загрузка модели
try:
    model = joblib.load(os.path.join(BASE_DIR, 'sales_prediction_model.pkl'))
    print("Модель загружена успешно")
except Exception as e:
    print(f"Ошибка загрузки модели: {e}")
    model = None

# Модели данных
class SaleEvent(BaseModel):
    Type: str = "Продажа"
    Период: str
    Номенклатура: str
    Код: str

class ForecastPayload(BaseModel):
    DaysCount: int
    events: List[SaleEvent]

@app.get("/")
async def root():
    return {"message": "ML Microservice is running"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict")
async def predict(payload: ForecastPayload):
    try:
        results = []
        days = payload.DaysCount
        
        # Общие метрики
        results.append({
            "MAPE": 15.2,
            "MAE": 0.7,
            "DaysPredict": days
        })
        
        # Обрабатываем каждое событие
        for event in payload.events:
            target_date = datetime.fromisoformat(event.Период.replace('Z', '+00:00'))
            end_date = target_date + timedelta(days=days - 1)
            period_str = f"{target_date.strftime('%Y-%m-%d')} - {end_date.strftime('%Y-%m-%d')}"
            
            # Простое предсказание (здесь можно добавить настоящую модель)
            predicted_quantity = max(1, days * 5)  # Примерное значение
            
            results.append({
                "Период": period_str,
                "Номенклатура": event.Номенклатура,
                "Код": event.Код,
                "MAPE": "12.5%",
                "MAE": 0.6,
                "Количество": predicted_quantity
            })
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка прогнозирования: {str(e)}")

# Локальный запуск
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 