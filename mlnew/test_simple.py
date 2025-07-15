#!/usr/bin/env python3
import sys
import json
from datetime import datetime

print("=== Test ML Microservice ===")
print(f"Python version: {sys.version}")

# Проверяем зависимости
try:
    import fastapi
    print(f"✓ FastAPI: {fastapi.__version__}")
except ImportError as e:
    print(f"✗ FastAPI not found: {e}")

try:
    import uvicorn
    print(f"✓ Uvicorn: {uvicorn.__version__}")
except ImportError as e:
    print(f"✗ Uvicorn not found: {e}")

try:
    import pandas as pd
    print(f"✓ Pandas: {pd.__version__}")
except ImportError as e:
    print(f"✗ Pandas not found: {e}")

try:
    import joblib
    print(f"✓ Joblib: {joblib.__version__}")
except ImportError as e:
    print(f"✗ Joblib not found: {e}")

# Симулируем ответ микросервиса
def simulate_forecast(days_count=30):
    """Симулирует ответ микросервиса"""
    return [
        {"MAPE": 42.1, "MAE": 0.8, "DaysPredict": days_count},
        {
            "Период": "2025-07-15 - 2025-08-13",
            "Номенклатура": "Молоко \"Домик в деревне\" 1л",
            "Код": "123456",
            "MAPE": "35.0%",
            "MAE": 0.6,
            "Количество": 120
        },
        {
            "Период": "2025-07-15 - 2025-08-13",
            "Номенклатура": "Йогурт \"Чудо\" клубничный 200г",
            "Код": "YOG-205",
            "MAPE": "28.5%",
            "MAE": 0.7,
            "Количество": 85
        },
        {
            "Период": "2025-07-15 - 2025-08-13",
            "Номенклатура": "Хлеб \"Дарницкий\" 500г",
            "Код": "BRD-010",
            "MAPE": "22.1%",
            "MAE": 0.4,
            "Количество": 150
        }
    ]

# Тестируем
print("\n=== Testing forecast simulation ===")
test_result = simulate_forecast(30)
print(json.dumps(test_result, ensure_ascii=False, indent=2))

print("\n=== Test completed ===") 