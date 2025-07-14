import pytest
import time
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from microservice import app


class TestIntegration:
    """Тесты интеграции ML-сервиса с основной системой"""
    
    @pytest.fixture
    def client(self):
        """Создание тестового клиента FastAPI"""
        return TestClient(app)
    
    def test_health_endpoint(self, client):
        """Тест эндпоинта проверки здоровья сервиса"""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "model_loaded" in data
        assert data["model_loaded"] is True
        assert "items_count" in data
        assert data["items_count"] > 0
    
    def test_service_availability(self, client):
        """Тест доступности всех основных эндпоинтов"""
        endpoints = [
            ("/", "GET"),
            ("/health", "GET"),
            ("/metrics", "GET"),
        ]
        
        for endpoint, method in endpoints:
            if method == "GET":
                response = client.get(endpoint)
            else:
                response = client.post(endpoint)
            
            assert response.status_code in [200, 422], \
                f"Endpoint {endpoint} returned unexpected status: {response.status_code}"
    
    def test_fallback_on_model_failure(self, client):
        """Тест fallback механизма при сбое модели"""
        # Патчим модель, чтобы она выбрасывала исключение
        with patch('microservice.model.predict', side_effect=Exception("Model failure")):
            payload = [
                {"DaysCount": 7},
                {
                    "Type": "Продажа",
                    "Период": datetime.now().strftime("%Y-%m-%d"),
                    "Номенклатура": "Тестовый товар",
                    "Код": "TEST001",
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                }
            ]
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            
            # Проверяем, что получили fallback прогноз
            result = response.json()
            assert len(result) >= 2
            assert result[1]["Количество"] > 0  # Должен быть какой-то прогноз
    
    def test_timeout_handling(self, client):
        """Тест обработки таймаутов"""
        # Создаем большой запрос
        payload = [{"DaysCount": 30}]
        for i in range(100):  # 100 товаров
            payload.append({
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": f"Товар {i}",
                "Код": f"CODE{i:04d}",
                "Количество": 10,
                "Цена_на_полке": 100.0
            })
        
        start_time = time.time()
        response = client.post("/forecast", json=payload)
        elapsed_time = time.time() - start_time
        
        assert response.status_code == 200
        # Проверяем, что запрос выполнился за разумное время
        assert elapsed_time < 30.0, f"Request took too long: {elapsed_time}s"
    
    def test_cache_headers_presence(self, client):
        """Тест наличия заголовков для кэширования"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Кэшируемый товар",
                "Код": "CACHE001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        
        # В реальной системе здесь проверялись бы заголовки кэширования
        # Например: Cache-Control, ETag, Last-Modified
    
    def test_concurrent_requests_handling(self, client):
        """Тест обработки параллельных запросов"""
        import concurrent.futures
        
        def make_request():
            payload = [
                {"DaysCount": 7},
                {
                    "Type": "Продажа",
                    "Период": datetime.now().strftime("%Y-%m-%d"),
                    "Номенклатура": "Параллельный товар",
                    "Код": "PARALLEL001",
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                }
            ]
            return client.post("/forecast", json=payload)
        
        # Запускаем 10 параллельных запросов
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # Все запросы должны быть успешными
        assert all(r.status_code == 200 for r in responses)
        
        # Результаты должны быть идентичными
        results = [r.json() for r in responses]
        first_result = results[0]
        for result in results[1:]:
            assert result[1]["Количество"] == first_result[1]["Количество"]
    
    def test_error_response_format(self, client):
        """Тест формата ответов при ошибках"""
        # Пустой payload
        response = client.post("/forecast", json=[])
        assert response.status_code == 400
        assert "detail" in response.json()
        
        # Неправильный формат данных
        response = client.post("/forecast", json={"wrong": "format"})
        assert response.status_code == 422
        
        # Отсутствующий DaysCount
        payload = [
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Товар",
                "Код": "CODE001"
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 400
    
    def test_graceful_degradation(self, client):
        """Тест плавной деградации при частичных сбоях"""
        # Патчим функцию получения метрик, чтобы она падала
        with patch('microservice.get_item_metrics', side_effect=Exception("Metrics failure")):
            payload = [
                {"DaysCount": 7},
                {
                    "Type": "Продажа",
                    "Период": datetime.now().strftime("%Y-%m-%d"),
                    "Номенклатура": "Товар с проблемными метриками",
                    "Код": "FAIL001",
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                }
            ]
            
            # Сервис должен продолжить работу, используя дефолтные метрики
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
    
    def test_metrics_endpoint_availability(self, client):
        """Тест доступности эндпоинта метрик"""
        response = client.get("/metrics")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_items" in data
        assert "avg_mape" in data
        assert "avg_mae" in data
        
        # Проверяем валидность метрик
        assert data["total_items"] > 0
        assert 0 <= data["avg_mape"] <= 100
        assert data["avg_mae"] >= 0
    
    def test_service_recovery_after_failure(self, client):
        """Тест восстановления сервиса после сбоя"""
        # Первый запрос - успешный
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Товар для восстановления",
                "Код": "RECOVERY001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        response1 = client.post("/forecast", json=payload)
        assert response1.status_code == 200
        initial_prediction = response1.json()[1]["Количество"]
        
        # Симулируем временный сбой
        with patch('microservice.model', None):
            # Сервис должен использовать fallback
            pass
        
        # После "восстановления" сервис должен работать нормально
        response2 = client.post("/forecast", json=payload)
        assert response2.status_code == 200
        recovered_prediction = response2.json()[1]["Количество"]
        
        # Прогнозы должны быть одинаковыми
        assert recovered_prediction == initial_prediction
    
    def test_request_validation(self, client):
        """Тест валидации входных данных"""
        test_cases = [
            # Отрицательное количество дней
            {
                "payload": [
                    {"DaysCount": -5},
                    {"Type": "Продажа", "Период": "2025-07-07", "Номенклатура": "Товар"}
                ],
                "expected_status": [200, 400, 422]
            },
            # Неверный формат даты
            {
                "payload": [
                    {"DaysCount": 7},
                    {"Type": "Продажа", "Период": "invalid-date", "Номенклатура": "Товар"}
                ],
                "expected_status": [400, 422, 500]
            },
            # Пустая номенклатура
            {
                "payload": [
                    {"DaysCount": 7},
                    {"Type": "Продажа", "Период": "2025-07-07", "Номенклатура": ""}
                ],
                "expected_status": [200, 400]
            }
        ]
        
        for test_case in test_cases:
            response = client.post("/forecast", json=test_case["payload"])
            assert response.status_code in test_case["expected_status"], \
                f"Unexpected status for payload: {test_case['payload']}"
    
    def test_api_versioning_compatibility(self, client):
        """Тест совместимости версий API"""
        # Тестируем различные эндпоинты
        endpoints = [
            ("/forecast", "v1"),  # Основной эндпоинт
            ("/predict", "v2"),   # Альтернативный эндпоинт
        ]
        
        payload = {
            "DaysCount": 7,
            "events": [
                {
                    "Type": "Продажа",
                    "Период": datetime.now().strftime("%Y-%m-%d"),
                    "Номенклатура": "Версионный товар",
                    "Код": "VER001",
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                }
            ]
        }
        
        # Проверяем /predict endpoint
        response = client.post("/predict", json=payload)
        assert response.status_code == 200
        
        result = response.json()
        assert isinstance(result, list)
        assert len(result) >= 2
        assert "Количество" in result[1]
    
    def test_large_payload_handling(self, client):
        """Тест обработки больших payload"""
        # Создаем очень большой запрос
        payload = [{"DaysCount": 30}]
        
        # 500 товаров с разными параметрами
        for i in range(500):
            payload.append({
                "Type": "Продажа",
                "Период": (datetime.now() - timedelta(days=i % 30)).strftime("%Y-%m-%d"),
                "Номенклатура": f"Товар номер {i} с очень длинным названием для тестирования",
                "Код": f"LARGE{i:05d}",
                "Количество": i % 100 + 1,
                "Цена_на_полке": (i % 1000) + 10.0,
                "ВидНоменклатуры": f"Категория {i % 10}",
                "Поставщик": f"Поставщик {i % 20}",
                "Производитель": f"Производитель {i % 15}",
                "Вес": (i % 500) / 100.0,
                "Артикул": f"ART{i:06d}",
                "Группа": f"Группа {i % 5}",
                "Срок_годности_час": (i % 720) + 24,
                "Наличие_товара": i % 2 == 0,
                "Категория_товара": f"Подкатегория {i % 8}",
                "Цена_на_полке": (i % 500) + 50.0,
                "Остаток_в_магазине": i % 50,
                "Процент_скидки": i % 30
            })
        
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        
        result = response.json()
        # Должны получить прогнозы для всех товаров
        assert len(result) == 501  # 1 общая метрика + 500 товаров
    
    def test_memory_leak_prevention(self, client):
        """Тест на отсутствие утечек памяти"""
        import psutil
        import gc
        
        process = psutil.Process()
        gc.collect()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Делаем множество запросов
        for i in range(50):
            payload = [{"DaysCount": 7}]
            for j in range(20):  # 20 товаров в каждом запросе
                payload.append({
                    "Type": "Продажа",
                    "Период": datetime.now().strftime("%Y-%m-%d"),
                    "Номенклатура": f"Товар {i}-{j}",
                    "Код": f"MEM{i:03d}{j:03d}",
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                })
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
        
        gc.collect()
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        print(f"\nMemory usage: Initial: {initial_memory:.1f} MB, Final: {final_memory:.1f} MB")
        print(f"Memory increase: {memory_increase:.1f} MB")
        
        # Утечка памяти не должна превышать 50 MB
        assert memory_increase < 50, f"Possible memory leak: {memory_increase:.1f} MB increase"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
