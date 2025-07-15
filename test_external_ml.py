#!/usr/bin/env python3
"""
Скрипт для тестирования внешнего ML микросервиса
Проверяет совместимость с вашей системой
"""

import requests
import json
import sys
import os

def test_external_ml_service(base_url):
    """
    Тестирует внешний ML сервис на совместимость
    """
    print(f"🔍 Тестирование ML сервиса: {base_url}")
    print("=" * 60)
    
    # Тестовые данные от Алексея
    test_payload = {
        "DaysCount": 30,
        "events": [
            {
                "Type": "Продажа",
                "Период": "2025-07-15T00:00:00",
                "Номенклатура": "Молоко \"Домик в деревне\" 1л",
                "Код": "123456"
            },
            {
                "Type": "Продажа",
                "Период": "2025-07-15T00:00:00",
                "Номенклатура": "Йогурт \"Чудо\" клубничный 200г",
                "Код": "YOG-205"
            }
        ]
    }
    
    # 1. Тест health endpoint
    print("\n1. 🏥 Проверка health endpoint...")
    health_url = base_url.replace('/predict', '/health')
    try:
        response = requests.get(health_url, timeout=10)
        if response.status_code == 200:
            print("✅ Health endpoint работает")
            try:
                health_data = response.json()
                print(f"   Статус: {health_data.get('status', 'Unknown')}")
                print(f"   Модель загружена: {health_data.get('model_loaded', 'Unknown')}")
            except:
                print("   (Ответ не в JSON формате)")
        else:
            print(f"⚠️  Health endpoint вернул код {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint недоступен: {e}")
    
    # 2. Тест predict endpoint
    print("\n2. 🤖 Проверка predict endpoint...")
    try:
        response = requests.post(
            base_url,
            json=test_payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"   Статус ответа: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print("✅ Predict endpoint работает!")
                
                # Проверка структуры ответа
                if isinstance(result, list) and len(result) > 0:
                    # Проверяем первый элемент (метрики)
                    first_item = result[0]
                    if 'MAPE' in first_item and 'MAE' in first_item and 'DaysPredict' in first_item:
                        print("✅ Формат ответа соответствует спецификации")
                        print(f"   Общие метрики: MAPE={first_item['MAPE']}, MAE={first_item['MAE']}")
                        
                        # Проверяем элементы прогноза
                        if len(result) > 1:
                            forecast_item = result[1]
                            required_fields = ['Период', 'Номенклатура', 'Код', 'MAPE', 'MAE', 'Количество']
                            missing_fields = [field for field in required_fields if field not in forecast_item]
                            
                            if not missing_fields:
                                print("✅ Все обязательные поля присутствуют")
                                print(f"   Пример прогноза: {forecast_item['Номенклатура']} - {forecast_item['Количество']} шт.")
                            else:
                                print(f"⚠️  Отсутствуют поля: {missing_fields}")
                        else:
                            print("⚠️  Нет элементов прогноза в ответе")
                    else:
                        print("❌ Неправильный формат первого элемента (метрики)")
                else:
                    print("❌ Ответ не является списком или пустой")
                    
                # Показываем первые 3 элемента ответа
                print("\n📊 Пример ответа:")
                print(json.dumps(result[:3], ensure_ascii=False, indent=2))
                
            except json.JSONDecodeError:
                print("❌ Ответ не в JSON формате")
                print(f"   Содержимое: {response.text[:200]}...")
                
        else:
            print(f"❌ Ошибка {response.status_code}: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Таймаут при обращении к сервису")
    except requests.exceptions.ConnectionError:
        print("❌ Не удается подключиться к сервису")
    except Exception as e:
        print(f"❌ Ошибка при тестировании: {e}")
    
    # 3. Тест совместимости с backend
    print("\n3. 🔗 Проверка совместимости с backend...")
    print("   Формат запроса соответствует ожидаемому:")
    print(json.dumps(test_payload, ensure_ascii=False, indent=2))
    
    return True

def main():
    if len(sys.argv) != 2:
        print("Использование: python test_external_ml.py <URL>")
        print("Примеры:")
        print("  python test_external_ml.py http://192.168.1.100:8000/predict")
        print("  python test_external_ml.py https://ml-api.yourcompany.com/predict")
        sys.exit(1)
    
    ml_url = sys.argv[1]
    
    # Проверяем, что URL заканчивается на /predict
    if not ml_url.endswith('/predict'):
        print("⚠️  URL должен заканчиваться на '/predict'")
        print(f"   Используется: {ml_url}")
    
    test_external_ml_service(ml_url)
    
    print("\n" + "=" * 60)
    print("🎯 Следующие шаги:")
    print("1. Если все тесты прошли успешно, установите переменную окружения:")
    print(f"   $env:ML_SERVICE_URL=\"{ml_url}\"")
    print("2. Запустите backend:")
    print("   cd backend && npm run dev")
    print("3. Запустите frontend:")
    print("   cd frontend && npm run dev")
    print("4. Откройте http://localhost:5174/sales-forecast-new")

if __name__ == "__main__":
    main() 