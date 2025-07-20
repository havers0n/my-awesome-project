import requests
import json

# Тест ML сервиса
def test_ml_service():
    url = "http://localhost:8000"
    
    # Тест 1: Проверка здоровья сервиса
    print("1. Проверка здоровья сервиса...")
    try:
        response = requests.get(f"{url}/health")
        print(f"   Статус: {response.status_code}")
        print(f"   Ответ: {response.json()}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # Тест 2: Проверка корневого эндпоинта
    print("\n2. Проверка корневого эндпоинта...")
    try:
        response = requests.get(f"{url}/")
        print(f"   Статус: {response.status_code}")
        print(f"   Ответ: {response.json()}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # Тест 3: Прогнозирование
    print("\n3. Тест прогнозирования...")
    payload = {
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
    
    try:
        response = requests.post(
            f"{url}/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload)
        )
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Прогноз получен успешно!")
            print(f"   Количество записей: {len(result) if isinstance(result, list) else 'N/A'}")
        else:
            print(f"   Ошибка: {response.text}")
    except Exception as e:
        print(f"   Ошибка: {e}")

if __name__ == "__main__":
    test_ml_service() 