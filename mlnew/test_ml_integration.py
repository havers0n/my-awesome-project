import requests
import json
from datetime import datetime, timedelta

# Настройки
ML_SERVICE_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:5001"

def test_ml_with_db():
    """Тестирует ML сервис с данными из БД"""
    
    print("=== Тестирование ML сервиса с интеграцией БД ===\n")
    
    # 1. Проверяем доступность сервисов
    try:
        ml_health = requests.get(f"{ML_SERVICE_URL}/health")
        print(f"✓ ML сервис доступен: {ml_health.json()}")
    except:
        print("✗ ML сервис недоступен на порту 8000")
        return
    
    try:
        backend_health = requests.get(f"{BACKEND_URL}/api/ml/features/test-sku-001")
        print(f"✓ Backend API доступен")
    except:
        print("✗ Backend недоступен на порту 5001")
        return
    
    # 2. Тестовый запрос прогноза
    test_data = {
        "DaysCount": 30,
        "SalesEvents": [
            {
                "Date": datetime.now().isoformat(),
                "Quantity": 100
            },
            {
                "Date": (datetime.now() + timedelta(days=7)).isoformat(),
                "Quantity": 150
            }
        ],
        "SupplyEvents": [
            {
                "Date": (datetime.now() + timedelta(days=3)).isoformat(),
                "Quantity": 500
            }
        ]
    }
    
    print("\n2. Отправляем запрос на прогноз:")
    print(json.dumps(test_data, indent=2))
    
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/predict",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✓ Прогноз получен успешно!")
            print(f"  - Точность MAPE: {result.get('accuracy', {}).get('mape', 'N/A')}%")
            print(f"  - MAE: {result.get('accuracy', {}).get('mae', 'N/A')}")
            print(f"  - Количество дней прогноза: {len(result.get('forecast', []))}")
            
            # Показываем первые 5 дней прогноза
            forecast = result.get('forecast', [])
            if forecast:
                print("\n  Первые 5 дней прогноза:")
                for day in forecast[:5]:
                    print(f"    {day['date']}: {day['predicted_demand']:.2f} единиц")
        else:
            print(f"\n✗ Ошибка: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"\n✗ Ошибка при запросе: {e}")

if __name__ == "__main__":
    test_ml_with_db() 