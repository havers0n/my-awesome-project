import requests
import json

def test_ml_connection_fix():
    print("🧪 ТЕСТ ПОДКЛЮЧЕНИЯ К ML СЕРВИСУ С НОВЫМ URL")
    print("=" * 55)
    
    # Тест 1: Проверка ML сервиса через localhost
    print("\n1. Тест ML сервиса через localhost...")
    try:
        ml_response = requests.get("http://localhost:8000/health")
        print(f"   ✅ localhost:8000 доступен: {ml_response.status_code}")
    except Exception as e:
        print(f"   ❌ localhost:8000 недоступен: {e}")
    
    # Тест 2: Проверка ML сервиса через 127.0.0.1
    print("\n2. Тест ML сервиса через 127.0.0.1...")
    try:
        ml_response = requests.get("http://127.0.0.1:8000/health")
        print(f"   ✅ 127.0.0.1:8000 доступен: {ml_response.status_code}")
    except Exception as e:
        print(f"   ❌ 127.0.0.1:8000 недоступен: {e}")
    
    # Тест 3: Тест прогнозирования через localhost
    print("\n3. Тест прогнозирования через localhost...")
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
            print(f"   ✅ localhost прогнозирование работает")
            print(f"      Количество записей: {len(result) if isinstance(result, list) else 'N/A'}")
        else:
            print(f"   ❌ localhost прогнозирование ошибка: {ml_forecast_response.status_code}")
    except Exception as e:
        print(f"   ❌ localhost прогнозирование ошибка: {e}")
    
    # Тест 4: Тест прогнозирования через 127.0.0.1
    print("\n4. Тест прогнозирования через 127.0.0.1...")
    try:
        ml_forecast_response = requests.post(
            "http://127.0.0.1:8000/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps(ml_payload),
            timeout=30
        )
        
        if ml_forecast_response.status_code == 200:
            result = ml_forecast_response.json()
            print(f"   ✅ 127.0.0.1 прогнозирование работает")
            print(f"      Количество записей: {len(result) if isinstance(result, list) else 'N/A'}")
        else:
            print(f"   ❌ 127.0.0.1 прогнозирование ошибка: {ml_forecast_response.status_code}")
    except Exception as e:
        print(f"   ❌ 127.0.0.1 прогнозирование ошибка: {e}")
    
    # Тест 5: Проверка backend
    print("\n5. Проверка backend...")
    try:
        backend_response = requests.get("http://localhost:3000/health")
        print(f"   ✅ Backend доступен: {backend_response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend недоступен: {e}")
        return
    
    print("\n6. Итоговая проверка...")
    print("   🎯 Если все тесты прошли успешно, проблема решена!")
    print("   🌐 Откройте браузер: http://localhost:5173/sales-forecast-csv")

if __name__ == "__main__":
    test_ml_connection_fix() 