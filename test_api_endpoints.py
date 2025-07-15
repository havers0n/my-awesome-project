#!/usr/bin/env python3
"""
Тест для проверки исправленных API endpoints
"""

import requests
import json

def test_api_endpoints():
    """Тестирует доступность API endpoints"""
    
    backend_url = "http://localhost:3000"
    
    endpoints_to_test = [
        "/api/inventory/products",
        "/api/forecast/metrics",
        "/api/forecast/history",
        "/api/forecast/predict"
    ]
    
    print("🔍 Тестирование API endpoints...")
    print("=" * 50)
    
    for endpoint in endpoints_to_test:
        print(f"\n📍 Тестирование: {endpoint}")
        
        try:
            if endpoint.endswith('/predict'):
                # POST endpoint для прогнозирования
                test_data = {
                    "DaysCount": 30,
                    "events": [
                        {
                            "Type": "Продажа",
                            "Период": "2025-07-15T00:00:00",
                            "Номенклатура": "Тестовый товар",
                            "Код": "TEST001"
                        }
                    ]
                }
                
                response = requests.post(
                    f"{backend_url}{endpoint}",
                    json=test_data,
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
            else:
                # GET endpoint
                response = requests.get(
                    f"{backend_url}{endpoint}",
                    timeout=5
                )
            
            print(f"   Статус: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ Endpoint работает")
            elif response.status_code == 401:
                print("   🔒 Требуется аутентификация (нормально)")
            elif response.status_code == 404:
                print("   ❌ Endpoint не найден")
            else:
                print(f"   ⚠️  Неожиданный статус: {response.status_code}")
                
            if response.status_code != 200:
                try:
                    error_data = response.json()
                    print(f"   Ошибка: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"   Ошибка: {response.text[:100]}...")
                    
        except requests.exceptions.ConnectionError:
            print("   ❌ Не удается подключиться к серверу")
        except requests.exceptions.Timeout:
            print("   ⏱️  Таймаут запроса")
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Рекомендации:")
    print("1. Убедитесь, что backend запущен: cd backend && npm run dev")
    print("2. Проверьте, что ML микросервис работает на порту 8000")
    print("3. Для тестирования с аутентификацией используйте frontend")
    print("4. Откройте http://localhost:5174/sales-forecast-new")

if __name__ == "__main__":
    test_api_endpoints() 