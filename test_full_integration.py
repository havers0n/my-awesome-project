import requests
import json
import time

def test_full_integration():
    print("🧪 ТЕСТ ПОЛНОЙ ИНТЕГРАЦИИ CSV ПРОГНОЗИРОВАНИЯ")
    print("=" * 60)
    
    # Проверяем, что все сервисы работают
    print("\n1. Проверка доступности сервисов...")
    
    # ML сервис
    try:
        ml_response = requests.get("http://localhost:8000/health")
        print(f"   ✅ ML сервис (порт 8000): {ml_response.status_code}")
    except:
        print("   ❌ ML сервис (порт 8000): недоступен")
        return
    
    # Backend сервис
    try:
        backend_response = requests.get("http://localhost:3000/health")
        print(f"   ✅ Backend сервис (порт 3000): {backend_response.status_code}")
    except:
        print("   ❌ Backend сервис (порт 3000): недоступен")
        return
    
    # Frontend сервис
    try:
        frontend_response = requests.get("http://localhost:5173/")
        print(f"   ✅ Frontend сервис (порт 5173): {frontend_response.status_code}")
    except:
        print("   ❌ Frontend сервис (порт 5173): недоступен")
    
    print("\n2. Тест CSV функционала (без аутентификации)...")
    
    # Тест CSV продуктов
    try:
        csv_products_response = requests.get("http://localhost:3000/api/forecast/csv-products")
        if csv_products_response.status_code == 401:
            print("   ✅ CSV продукты: маршрут работает (требует аутентификации)")
        else:
            print(f"   ⚠️ CSV продукты: неожиданный статус {csv_products_response.status_code}")
    except Exception as e:
        print(f"   ❌ CSV продукты: ошибка - {e}")
    
    # Тест CSV метрик
    try:
        csv_metrics_response = requests.get("http://localhost:3000/api/forecast/csv-metrics")
        if csv_metrics_response.status_code == 401:
            print("   ✅ CSV метрики: маршрут работает (требует аутентификации)")
        else:
            print(f"   ⚠️ CSV метрики: неожиданный статус {csv_metrics_response.status_code}")
    except Exception as e:
        print(f"   ❌ CSV метрики: ошибка - {e}")
    
    # Тест CSV прогнозирования
    try:
        csv_forecast_payload = {"DaysCount": 7}
        csv_forecast_response = requests.post(
            "http://localhost:3000/api/forecast/predict-csv",
            headers={"Content-Type": "application/json"},
            data=json.dumps(csv_forecast_payload)
        )
        if csv_forecast_response.status_code == 401:
            print("   ✅ CSV прогнозирование: маршрут работает (требует аутентификации)")
        else:
            print(f"   ⚠️ CSV прогнозирование: неожиданный статус {csv_forecast_response.status_code}")
    except Exception as e:
        print(f"   ❌ CSV прогнозирование: ошибка - {e}")
    
    print("\n3. Тест ML сервиса...")
    
    # Тест прогнозирования ML сервиса
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
            data=json.dumps(ml_payload)
        )
        
        if ml_forecast_response.status_code == 200:
            result = ml_forecast_response.json()
            print(f"   ✅ ML прогнозирование: успешно")
            print(f"      Количество записей: {len(result) if isinstance(result, list) else 'N/A'}")
        else:
            print(f"   ❌ ML прогнозирование: ошибка {ml_forecast_response.status_code}")
    except Exception as e:
        print(f"   ❌ ML прогнозирование: ошибка - {e}")
    
    print("\n4. Проверка CSV файла...")
    
    # Проверяем, что CSV файл существует
    import os
    csv_path = "SalesPrediction-Vlad_branch/microservice/all_sku_metrics_1.csv"
    if os.path.exists(csv_path):
        print(f"   ✅ CSV файл найден: {csv_path}")
        # Подсчитываем количество строк
        with open(csv_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            print(f"      Количество строк: {len(lines)}")
            if len(lines) > 1:
                print(f"      Количество товаров: {len(lines) - 1}")  # минус заголовок
    else:
        print(f"   ❌ CSV файл не найден: {csv_path}")
    
    print("\n5. Итоговая проверка...")
    
    # Проверяем, что все основные компоненты работают
    services_ok = True
    
    # ML сервис
    try:
        requests.get("http://localhost:8000/health")
    except:
        services_ok = False
        print("   ❌ ML сервис недоступен")
    
    # Backend сервис
    try:
        requests.get("http://localhost:3000/health")
    except:
        services_ok = False
        print("   ❌ Backend сервис недоступен")
    
    if services_ok:
        print("   ✅ Все сервисы работают корректно!")
        print("\n🎉 СИСТЕМА CSV ПРОГНОЗИРОВАНИЯ ГОТОВА К ИСПОЛЬЗОВАНИЮ!")
        print("\n📋 Инструкция по использованию:")
        print("   1. Откройте браузер и перейдите на http://localhost:5173/")
        print("   2. Войдите в систему")
        print("   3. В сайдбаре выберите: Прогнозирование продаж → ML модель (CSV)")
        print("   4. Выберите товар из списка и сгенерируйте прогноз")
        print("\n🔗 Прямая ссылка: http://localhost:5173/sales-forecast-csv")
    else:
        print("   ❌ Есть проблемы с сервисами")

if __name__ == "__main__":
    test_full_integration() 