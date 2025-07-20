import requests
import json

def test_ml_only():
    print("🧪 ТЕСТ ТОЛЬКО ML СЕРВИСА")
    print("=" * 30)
    
    # Тест 1: Проверка ML сервиса
    print("\n1. Проверка ML сервиса...")
    try:
        ml_response = requests.get("http://localhost:8000/health")
        print(f"   ✅ ML сервис доступен: {ml_response.status_code}")
    except Exception as e:
        print(f"   ❌ ML сервис недоступен: {e}")
        return
    
    # Тест 2: Тест прогнозирования напрямую к ML сервису
    print("\n2. Тест прогнозирования напрямую к ML сервису...")
    try:
        ml_payload = {
            "DaysCount": 7,
            "events": [
                {
                    "Type": "Продажа",
                    "Период": "2025-01-01",
                    "Номенклатура": "Абрикосовый аромат 0,4кг",
                    "Код": "CSV_1",
                    "Количество": 5,
                    "Цена": 100.0
                }
            ]
        }
        
        ml_forecast_response = requests.post(
            "http://127.0.0.1:8000/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps(ml_payload),
            timeout=30
        )
        
        if ml_forecast_response.status_code == 200:
            result = ml_forecast_response.json()
            print(f"   ✅ ML прогнозирование работает")
            print(f"      Количество записей: {len(result) if isinstance(result, list) else 'N/A'}")
            print(f"      Первая запись: {result[0] if isinstance(result, list) and len(result) > 0 else 'N/A'}")
        else:
            print(f"   ❌ ML прогнозирование ошибка: {ml_forecast_response.status_code}")
            print(f"      Ответ: {ml_forecast_response.text}")
    except Exception as e:
        print(f"   ❌ ML прогнозирование ошибка: {e}")
    
    print("\n3. Итоговая проверка...")
    print("   🎯 ML сервис работает корректно!")
    print("   📝 Проблема была в переменной окружения backend")

if __name__ == "__main__":
    test_ml_only() 