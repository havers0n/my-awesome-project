import requests
import json

def test_health():
    """Тестируем health endpoint"""
    try:
        response = requests.get("http://localhost:5678/health")
        print("Health endpoint response:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error calling health endpoint: {e}")
        return False

def test_forecast():
    """Тестируем forecast endpoint"""
    try:
        payload = [
            {"DaysCount": 7},
            {"Type": "Продажа", "Период": "2024-03-01", "Номенклатура": "Товар1", "Количество": 10, "Код": "T001", "ВидНоменклатуры": "Продукты"},
            {"Type": "Продажа", "Период": "2024-03-02", "Номенклатура": "Товар1", "Количество": 12, "Код": "T001", "ВидНоменклатуры": "Продукты"},
            {"Type": "Продажа", "Период": "2024-03-03", "Номенклатура": "Товар1", "Количество": 8, "Код": "T001", "ВидНоменклатуры": "Продукты"},
            {"Type": "Продажа", "Период": "2024-03-04", "Номенклатура": "Товар1", "Количество": 15, "Код": "T001", "ВидНоменклатуры": "Продукты"},
            {"Type": "Продажа", "Период": "2024-03-05", "Номенклатура": "Товар1", "Количество": 9, "Код": "T001", "ВидНоменклатуры": "Продукты"}
        ]
        
        response = requests.post("http://localhost:5678/forecast", json=payload)
        print("Forecast endpoint response:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error calling forecast endpoint: {e}")
        return False

if __name__ == "__main__":
    print("Testing API endpoints...")
    print("=" * 50)
    
    health_ok = test_health()
    print("=" * 50)
    
    forecast_ok = test_forecast()
    print("=" * 50)
    
    if health_ok and forecast_ok:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed!")
