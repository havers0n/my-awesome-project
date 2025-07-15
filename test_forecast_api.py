#!/usr/bin/env python3
import requests
import json

def test_forecast_direct():
    print("=== Testing Forecast API Directly ===")
    
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
            },
            {
                "Type": "Продажа",
                "Период": "2025-07-15T00:00:00",
                "Номенклатура": "Хлеб \"Дарницкий\" 500г",
                "Код": "BRD-010"
            }
        ]
    }
    
    print("Payload:")
    print(json.dumps(test_payload, ensure_ascii=False, indent=2))
    
    try:
        # Тестируем ML микросервис напрямую
        print("\n1. Testing ML Service directly...")
        ml_response = requests.post(
            "http://localhost:8000/predict",
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"ML Service Status: {ml_response.status_code}")
        if ml_response.status_code == 200:
            ml_result = ml_response.json()
            print("✓ ML Service response:")
            print(json.dumps(ml_result, ensure_ascii=False, indent=2))
        else:
            print(f"✗ ML Service failed: {ml_response.text}")
            return False
            
        # Тестируем backend API
        print("\n2. Testing Backend API...")
        backend_response = requests.post(
            "http://localhost:3000/api/forecast",
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Backend Status: {backend_response.status_code}")
        if backend_response.status_code == 200:
            backend_result = backend_response.json()
            print("✓ Backend API response:")
            print(json.dumps(backend_result, ensure_ascii=False, indent=2))
            return True
        else:
            print(f"✗ Backend API failed: {backend_response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Test error: {e}")
        return False

if __name__ == "__main__":
    if test_forecast_direct():
        print("\n🎉 Integration test successful!")
        print("\nАлексей, микросервис работает!")
        print("Endpoint: http://localhost:8000/predict")
        print("Backend integration: http://localhost:3000/api/forecast")
        print("Frontend page: http://localhost:5174/sales-forecast-new")
    else:
        print("\n❌ Integration test failed!") 