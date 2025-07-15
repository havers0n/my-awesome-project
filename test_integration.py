#!/usr/bin/env python3
import requests
import json
import time

def test_ml_service():
    print("=== Testing ML Service (Port 8000) ===")
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"ML Service Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ ML Service is running")
            return True
        else:
            print("✗ ML Service is not responding")
            return False
    except Exception as e:
        print(f"✗ ML Service error: {e}")
        return False

def test_backend_service():
    print("\n=== Testing Backend Service (Port 3000) ===")
    try:
        response = requests.get("http://localhost:3000/api/health")
        print(f"Backend Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ Backend is running")
            return True
        else:
            print("✗ Backend is not responding")
            return False
    except Exception as e:
        print(f"✗ Backend error: {e}")
        return False

def test_frontend_service():
    print("\n=== Testing Frontend Service (Port 5174) ===")
    try:
        response = requests.get("http://localhost:5174")
        print(f"Frontend Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ Frontend is running")
            return True
        else:
            print("✗ Frontend is not responding")
            return False
    except Exception as e:
        print(f"✗ Frontend error: {e}")
        return False

def test_forecast_integration():
    print("\n=== Testing Forecast Integration ===")
    try:
        # Тестовые данные
        test_payload = {
            "DaysCount": 30,
            "events": [
                {
                    "Type": "Продажа",
                    "Период": "2025-07-15T00:00:00",
                    "Номенклатура": "Молоко \"Домик в деревне\" 1л",
                    "Код": "123456"
                }
            ]
        }
        
        response = requests.post(
            "http://localhost:3000/api/forecast",
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Forecast API Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("✓ Forecast integration working")
            print("Sample response:")
            print(json.dumps(result[:2], ensure_ascii=False, indent=2))
            return True
        else:
            print(f"✗ Forecast integration failed: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Forecast integration error: {e}")
        return False

def main():
    print("Testing Full Integration...")
    print("=" * 50)
    
    services = [
        ("ML Service", test_ml_service),
        ("Backend Service", test_backend_service),
        ("Frontend Service", test_frontend_service),
    ]
    
    all_running = True
    for name, test_func in services:
        if not test_func():
            all_running = False
    
    if all_running:
        print("\n🎉 All services are running!")
        test_forecast_integration()
    else:
        print("\n❌ Some services are not running")
    
    print("\n" + "=" * 50)
    print("Services should be accessible at:")
    print("- ML Service: http://localhost:8000")
    print("- Backend: http://localhost:3000")
    print("- Frontend: http://localhost:5174")
    print("- Sales Forecast Page: http://localhost:5174/sales-forecast-new")

if __name__ == "__main__":
    main() 