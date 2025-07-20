import requests
import json

def test_csv_functionality():
    base_url = "http://localhost:3000"
    
    # Тест 1: Проверка CSV продуктов (без аутентификации)
    print("1. Тест CSV продуктов (без аутентификации)...")
    try:
        response = requests.get(f"{base_url}/api/forecast/csv-products")
        print(f"   Статус: {response.status_code}")
        if response.status_code == 401:
            print("   Ожидаемо: требуется аутентификация")
        else:
            print(f"   Ответ: {response.text[:200]}...")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # Тест 2: Проверка CSV метрик
    print("\n2. Тест CSV метрик...")
    try:
        response = requests.get(f"{base_url}/api/forecast/csv-metrics")
        print(f"   Статус: {response.status_code}")
        if response.status_code == 401:
            print("   Ожидаемо: требуется аутентификация")
        else:
            print(f"   Ответ: {response.text[:200]}...")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # Тест 3: Проверка CSV прогнозирования
    print("\n3. Тест CSV прогнозирования...")
    payload = {"DaysCount": 7}
    try:
        response = requests.post(
            f"{base_url}/api/forecast/predict-csv",
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload)
        )
        print(f"   Статус: {response.status_code}")
        if response.status_code == 401:
            print("   Ожидаемо: требуется аутентификация")
        else:
            print(f"   Ответ: {response.text[:200]}...")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # Тест 4: Проверка доступности маршрутов
    print("\n4. Проверка доступности маршрутов...")
    routes = [
        "/api/forecast/csv-products",
        "/api/forecast/csv-metrics", 
        "/api/forecast/predict-csv"
    ]
    
    for route in routes:
        try:
            response = requests.get(f"{base_url}{route}")
            print(f"   {route}: {response.status_code}")
        except Exception as e:
            print(f"   {route}: Ошибка - {e}")

if __name__ == "__main__":
    test_csv_functionality() 