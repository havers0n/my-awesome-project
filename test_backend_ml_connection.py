import requests
import json

def test_backend_ml_connection():
    print("🧪 ТЕСТ ПОДКЛЮЧЕНИЯ BACKEND К ML СЕРВИСУ")
    print("=" * 50)
    
    # Тест 1: Проверка ML сервиса напрямую
    print("\n1. Тест ML сервиса напрямую...")
    try:
        ml_response = requests.get("http://localhost:8000/health")
        print(f"   ✅ ML сервис доступен: {ml_response.status_code}")
    except Exception as e:
        print(f"   ❌ ML сервис недоступен: {e}")
        return
    
    # Тест 2: Тест прогнозирования ML сервиса
    print("\n2. Тест прогнозирования ML сервиса...")
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
            "http://localhost:8000/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps(ml_payload),
            timeout=30
        )
        
        if ml_forecast_response.status_code == 200:
            result = ml_forecast_response.json()
            print(f"   ✅ ML прогнозирование работает")
            print(f"      Количество записей: {len(result) if isinstance(result, list) else 'N/A'}")
        else:
            print(f"   ❌ ML прогнозирование ошибка: {ml_forecast_response.status_code}")
            print(f"      Ответ: {ml_forecast_response.text}")
    except Exception as e:
        print(f"   ❌ ML прогнозирование ошибка: {e}")
    
    # Тест 3: Проверка backend
    print("\n3. Проверка backend...")
    try:
        backend_response = requests.get("http://localhost:3000/health")
        print(f"   ✅ Backend доступен: {backend_response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend недоступен: {e}")
        return
    
    # Тест 4: Тест CSV продуктов (без аутентификации)
    print("\n4. Тест CSV продуктов...")
    try:
        csv_products_response = requests.get("http://localhost:3000/api/forecast/csv-products")
        print(f"   Статус: {csv_products_response.status_code}")
        if csv_products_response.status_code == 401:
            print("   ✅ CSV продукты: маршрут работает (требует аутентификации)")
        else:
            print(f"   ⚠️ CSV продукты: неожиданный статус")
    except Exception as e:
        print(f"   ❌ CSV продукты: ошибка - {e}")
    
    # Тест 5: Тест CSV прогнозирования (без аутентификации)
    print("\n5. Тест CSV прогнозирования...")
    try:
        csv_forecast_payload = {"DaysCount": 7}
        csv_forecast_response = requests.post(
            "http://localhost:3000/api/forecast/predict-csv",
            headers={"Content-Type": "application/json"},
            data=json.dumps(csv_forecast_payload),
            timeout=30
        )
        print(f"   Статус: {csv_forecast_response.status_code}")
        if csv_forecast_response.status_code == 401:
            print("   ✅ CSV прогнозирование: маршрут работает (требует аутентификации)")
        elif csv_forecast_response.status_code == 502:
            print("   ❌ CSV прогнозирование: ML сервис недоступен для backend")
            print(f"      Ответ: {csv_forecast_response.text}")
        else:
            print(f"   ⚠️ CSV прогнозирование: неожиданный статус")
    except Exception as e:
        print(f"   ❌ CSV прогнозирование: ошибка - {e}")

if __name__ == "__main__":
    test_backend_ml_connection() 