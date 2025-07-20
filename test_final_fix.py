import requests
import json
import os

def test_final_fix():
    print("🧪 ФИНАЛЬНЫЙ ТЕСТ ИСПРАВЛЕНИЯ ML ПОДКЛЮЧЕНИЯ")
    print("=" * 55)
    
    # Проверяем переменную окружения
    print("\n1. Проверка переменной окружения...")
    ml_url = os.environ.get('ML_SERVICE_URL', 'http://127.0.0.1:8000/predict')
    print(f"   ML_SERVICE_URL: {ml_url}")
    
    # Тест 1: Проверка ML сервиса
    print("\n2. Проверка ML сервиса...")
    try:
        ml_response = requests.get("http://localhost:8000/health")
        print(f"   ✅ ML сервис доступен: {ml_response.status_code}")
    except Exception as e:
        print(f"   ❌ ML сервис недоступен: {e}")
        return
    
    # Тест 2: Проверка backend
    print("\n3. Проверка backend...")
    try:
        backend_response = requests.get("http://localhost:3000/health")
        print(f"   ✅ Backend доступен: {backend_response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend недоступен: {e}")
        return
    
    # Тест 3: Тест прогнозирования напрямую к ML сервису
    print("\n4. Тест прогнозирования напрямую к ML сервису...")
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
        else:
            print(f"   ❌ ML прогнозирование ошибка: {ml_forecast_response.status_code}")
            print(f"      Ответ: {ml_forecast_response.text}")
    except Exception as e:
        print(f"   ❌ ML прогнозирование ошибка: {e}")
    
    # Тест 4: Тест через backend (без аутентификации)
    print("\n5. Тест через backend (без аутентификации)...")
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
            print("   ✅ Backend маршрут работает (требует аутентификации)")
        elif csv_forecast_response.status_code == 502:
            print("   ❌ Backend не может подключиться к ML сервису")
            print(f"      Ответ: {csv_forecast_response.text}")
        else:
            print(f"   ⚠️ Неожиданный статус: {csv_forecast_response.status_code}")
    except Exception as e:
        print(f"   ❌ Ошибка тестирования backend: {e}")
    
    print("\n6. Итоговая проверка...")
    print("   🎯 Если все тесты прошли успешно, проблема решена!")
    print("   🌐 Откройте браузер: http://localhost:5173/sales-forecast-csv")
    print("   📝 Теперь попробуйте сгенерировать прогноз в интерфейсе")

if __name__ == "__main__":
    test_final_fix() 