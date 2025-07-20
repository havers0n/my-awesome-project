import requests
import json

def test_with_auth():
    print("🧪 ТЕСТ ПОЛНОЙ ИНТЕГРАЦИИ С АУТЕНТИФИКАЦИЕЙ")
    print("=" * 55)
    
    # Получаем токен аутентификации
    print("\n1. Получение токена аутентификации...")
    
    # Используем тестовые данные для входа
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    try:
        login_response = requests.post(
            "http://localhost:3000/api/auth/login",
            headers={"Content-Type": "application/json"},
            data=json.dumps(login_data)
        )
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get('token') or token_data.get('accessToken')
            if token:
                print(f"   ✅ Токен получен: {token[:20]}...")
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {token}"
                }
            else:
                print("   ❌ Токен не найден в ответе")
                print(f"      Ответ: {token_data}")
                return
        else:
            print(f"   ❌ Ошибка входа: {login_response.status_code}")
            print(f"      Ответ: {login_response.text}")
            return
            
    except Exception as e:
        print(f"   ❌ Ошибка получения токена: {e}")
        return
    
    # Тест 2: Получение CSV продуктов с аутентификацией
    print("\n2. Тест CSV продуктов с аутентификацией...")
    try:
        csv_products_response = requests.get(
            "http://localhost:3000/api/forecast/csv-products",
            headers=headers
        )
        
        if csv_products_response.status_code == 200:
            products_data = csv_products_response.json()
            products = products_data.get('data', [])
            print(f"   ✅ CSV продукты получены: {len(products)} товаров")
            
            # Показываем первые 5 товаров для проверки очистки названий
            print("   📋 Примеры товаров:")
            for i, product in enumerate(products[:5]):
                name = product.get('product_name', 'N/A')
                mape = product.get('mape', 'N/A')
                print(f"      {i+1}. {name} (MAPE: {mape}%)")
        else:
            print(f"   ❌ Ошибка получения CSV продуктов: {csv_products_response.status_code}")
            print(f"      Ответ: {csv_products_response.text}")
            
    except Exception as e:
        print(f"   ❌ Ошибка CSV продуктов: {e}")
    
    # Тест 3: Тест CSV прогнозирования с аутентификацией
    print("\n3. Тест CSV прогнозирования с аутентификацией...")
    try:
        csv_forecast_payload = {"DaysCount": 7}
        csv_forecast_response = requests.post(
            "http://localhost:3000/api/forecast/predict-csv",
            headers=headers,
            data=json.dumps(csv_forecast_payload),
            timeout=30
        )
        
        if csv_forecast_response.status_code == 200:
            forecast_data = csv_forecast_response.json()
            print(f"   ✅ CSV прогнозирование успешно!")
            print(f"      Сообщение: {forecast_data.get('message', 'N/A')}")
            print(f"      Источник: {forecast_data.get('data', {}).get('source', 'N/A')}")
            print(f"      Количество товаров: {forecast_data.get('data', {}).get('totalProducts', 'N/A')}")
        elif csv_forecast_response.status_code == 502:
            print(f"   ❌ CSV прогнозирование: ML сервис недоступен")
            print(f"      Ответ: {csv_forecast_response.text}")
        else:
            print(f"   ❌ CSV прогнозирование: ошибка {csv_forecast_response.status_code}")
            print(f"      Ответ: {csv_forecast_response.text}")
            
    except Exception as e:
        print(f"   ❌ Ошибка CSV прогнозирования: {e}")
    
    # Тест 4: Тест CSV метрик с аутентификацией
    print("\n4. Тест CSV метрик с аутентификацией...")
    try:
        csv_metrics_response = requests.get(
            "http://localhost:3000/api/forecast/csv-metrics",
            headers=headers
        )
        
        if csv_metrics_response.status_code == 200:
            metrics_data = csv_metrics_response.json()
            data = metrics_data.get('data', {})
            print(f"   ✅ CSV метрики получены:")
            print(f"      Всего товаров: {data.get('totalProducts', 'N/A')}")
            print(f"      Средний MAPE: {data.get('avgMape', 'N/A')}%")
            print(f"      Средний MAE: {data.get('avgMae', 'N/A')}")
            print(f"      Средний RMSE: {data.get('avgRmse', 'N/A')}")
        else:
            print(f"   ❌ Ошибка получения CSV метрик: {csv_metrics_response.status_code}")
            print(f"      Ответ: {csv_metrics_response.text}")
            
    except Exception as e:
        print(f"   ❌ Ошибка CSV метрик: {e}")
    
    print("\n5. Итоговая проверка...")
    print("   🎯 Если все тесты прошли успешно, система готова к использованию!")
    print("   🌐 Откройте браузер: http://localhost:5173/sales-forecast-csv")

if __name__ == "__main__":
    test_with_auth() 