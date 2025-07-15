import requests
import json
from datetime import datetime, timedelta

# URL ML сервиса
ML_SERVICE_URL = "http://localhost:8000"

# Тестовые данные в формате, который ожидает модель
test_data = [
    {
        "DaysCount": 7  # Прогноз на 7 дней
    },
    {
        "Type": "Продажа",
        "Период": datetime.now().isoformat(),
        "Номенклатура": "Молоко 3.2%",
        "Код": "MILK001",
        "Количество": 10,
        "Цена_на_полке": 89.90,
        "Категория_товара": "Молочные продукты"
    },
    {
        "Type": "Продажа",
        "Период": (datetime.now() - timedelta(days=1)).isoformat(),
        "Номенклатура": "Хлеб белый",
        "Код": "BREAD001",
        "Количество": 15,
        "Цена_на_полке": 45.00,
        "Категория_товара": "Хлебобулочные изделия"
    }
]

def test_ml_service():
    """Тестирование ML сервиса"""
    print("=== Тестирование ML модели ===\n")
    
    # 1. Проверка доступности сервиса
    try:
        response = requests.get(f"{ML_SERVICE_URL}/")
        print(f"✓ Сервис доступен: {response.status_code}")
        print(f"  Ответ: {response.json()}\n")
    except Exception as e:
        print(f"✗ Ошибка подключения к сервису: {e}")
        return
    
    # 2. Тест эндпоинта /forecast
    print("Отправка тестового прогноза...")
    print(f"Данные: {json.dumps(test_data, indent=2, ensure_ascii=False)}\n")
    
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/forecast",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✓ Прогноз получен успешно!")
            result = response.json()
            print(f"\nРезультат:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            # Анализ результата
            if isinstance(result, list) and len(result) > 0:
                print(f"\nПолучено прогнозов: {len(result)}")
                for i, pred in enumerate(result):
                    if 'Номенклатура' in pred:
                        print(f"\n{i+1}. {pred.get('Номенклатура', 'Неизвестно')}")
                        print(f"   Период: {pred.get('Период', 'Не указан')}")
                        print(f"   Прогноз: {pred.get('Количество', 0)} единиц")
                        print(f"   Точность MAPE: {pred.get('MAPE', 0):.1f}%")
        else:
            print(f"✗ Ошибка: {response.status_code}")
            print(f"Ответ: {response.text}")
            
    except Exception as e:
        print(f"✗ Ошибка при отправке запроса: {e}")
    
    # 3. Тест альтернативного эндпоинта /predict
    print("\n\nТест эндпоинта /predict...")
    predict_data = {
        "DaysCount": 7,
        "events": [
            {
                "Type": "Sale",
                "Period": "2025-01-15",
                "ItemName": "Test Product",
                "Code": "TEST001",
                "Quantity": 10,
                "Price": 100.0
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/predict",
            json=predict_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✓ Альтернативный прогноз получен!")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print(f"✗ Ошибка: {response.status_code}")
            print(f"Ответ: {response.text}")
            
    except Exception as e:
        print(f"✗ Ошибка: {e}")

if __name__ == "__main__":
    print("Убедитесь, что ML сервис запущен на порту 8000")
    print("Для запуска: cd mlnew && uvicorn microservice:app --reload --port 8000\n")
    input("Нажмите Enter для начала тестирования...")
    test_ml_service() 