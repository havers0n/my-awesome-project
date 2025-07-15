#!/usr/bin/env python3
import requests
import json

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

def test_health():
    print("=== Testing Health Endpoint ===")
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_predict():
    print("\n=== Testing Predict Endpoint ===")
    try:
        response = requests.post(
            "http://localhost:8000/predict",
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("Response:")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return True
        else:
            print(f"Error response: {response.text}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("Testing ML Microservice...")
    
    if test_health():
        print("✓ Health check passed")
    else:
        print("✗ Health check failed")
        return
    
    if test_predict():
        print("✓ Predict test passed")
    else:
        print("✗ Predict test failed")

if __name__ == "__main__":
    main() 