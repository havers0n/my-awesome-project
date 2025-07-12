import pytest
import time
import statistics
import concurrent.futures
from datetime import datetime
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from microservice import app


class TestModelPerformance:
    """Тесты производительности модели"""

    @pytest.fixture()
    def client(self):
        """Фикстура для создания тестового клиента FastAPI"""
        return TestClient(app)

    def test_prediction_time_under_threshold(self, client):
        """Тест времени предсказания модели"""
        payload = [
            {"DaysCount": 10},
            {
                "Type": "Продажа",
                "Период": "2025-07-07",
                "Номенклатура": "Test Item",
                "Код": "TEST001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]

        start_time = time.time()
        response = client.post("/forecast", json=payload)
        elapsed_time = time.time() - start_time

        assert response.status_code == 200
        assert elapsed_time < 1.0, f"Elapsed time is {elapsed_time}, which exceeds the threshold!"

    def test_load_handling(self, client):
        """Тест обработки одновременных запросов"""
        payload = [
            {"DaysCount": 10},
            {
                "Type": "Продажа",
                "Период": "2025-07-07",
                "Номенклатура": "Test Item",
                "Код": "TEST001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        responses = []
        start_time = time.time()

        for _ in range(100):  # 100 одновременных запросов
            responses.append(client.post("/forecast", json=payload))

        elapsed_time = time.time() - start_time

        assert all(response.status_code == 200 for response in responses)
        assert elapsed_time < 10.0, f"Total time for handling load is {elapsed_time}, which is too high!"

    def test_batch_prediction_performance(self, client):
        """Тест производительности для пакетных прогнозов"""
        # Создаем пакет из 50 товаров
        payload = [{"DaysCount": 30}]
        
        for i in range(50):
            payload.append({
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": f"Товар {i}",
                "Код": f"CODE{i:04d}",
                "Количество": 10,
                "Цена_на_полке": 100.0 + i
            })
        
        start_time = time.time()
        response = client.post("/forecast", json=payload)
        elapsed_time = time.time() - start_time
        
        assert response.status_code == 200
        assert elapsed_time < 5.0, f"Batch prediction took {elapsed_time}s, exceeds threshold of 5s"
        
        # Проверяем, что время на один товар разумное
        time_per_item = elapsed_time / 50
        assert time_per_item < 0.1, f"Time per item: {time_per_item}s, exceeds threshold of 0.1s"

    def test_response_time_distribution(self, client):
        """Тест распределения времени отклика"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Test Item",
                "Код": "TEST001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        response_times = []
        
        # Делаем 50 запросов и замеряем время каждого
        for _ in range(50):
            start_time = time.time()
            response = client.post("/forecast", json=payload)
            response_times.append(time.time() - start_time)
            assert response.status_code == 200
        
        # Анализируем статистику
        avg_time = statistics.mean(response_times)
        median_time = statistics.median(response_times)
        p95_time = statistics.quantiles(response_times, n=20)[18]  # 95-й перцентиль
        max_time = max(response_times)
        
        print(f"\nResponse time statistics:")
        print(f"Average: {avg_time:.3f}s")
        print(f"Median: {median_time:.3f}s")
        print(f"95th percentile: {p95_time:.3f}s")
        print(f"Max: {max_time:.3f}s")
        
        # Проверяем SLA
        assert avg_time < 0.5, f"Average response time {avg_time}s exceeds SLA"
        assert p95_time < 1.0, f"95th percentile {p95_time}s exceeds SLA"
        assert max_time < 2.0, f"Max response time {max_time}s exceeds SLA"

    def test_memory_efficiency(self, client):
        """Тест эффективности использования памяти"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # В МБ
        
        # Делаем много запросов
        payload = [{"DaysCount": 7}]
        for i in range(100):
            payload.append({
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": f"Товар {i}",
                "Код": f"CODE{i:04d}",
                "Количество": 10,
                "Цена_на_полке": 100.0
            })
        
        # Выполняем 10 больших запросов
        for _ in range(10):
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
        
        final_memory = process.memory_info().rss / 1024 / 1024  # В МБ
        memory_increase = final_memory - initial_memory
        
        print(f"\nMemory usage:")
        print(f"Initial: {initial_memory:.1f} MB")
        print(f"Final: {final_memory:.1f} MB")
        print(f"Increase: {memory_increase:.1f} MB")
        
        # Проверяем, что утечки памяти нет (увеличение не более 100 МБ)
        assert memory_increase < 100, f"Memory increase {memory_increase} MB is too high"

    def test_concurrent_requests(self, client):
        """Тест параллельных запросов"""
        def make_request():
            payload = [
                {"DaysCount": 7},
                {
                    "Type": "Продажа",
                    "Период": datetime.now().strftime("%Y-%m-%d"),
                    "Номенклатура": "Concurrent Test",
                    "Код": "CONC001",
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                }
            ]
            start_time = time.time()
            response = client.post("/forecast", json=payload)
            return response.status_code, time.time() - start_time
        
        # Запускаем 20 параллельных запросов
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            start_time = time.time()
            futures = [executor.submit(make_request) for _ in range(20)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
            total_time = time.time() - start_time
        
        # Проверяем результаты
        status_codes = [r[0] for r in results]
        response_times = [r[1] for r in results]
        
        assert all(code == 200 for code in status_codes), "Not all requests succeeded"
        assert total_time < 5.0, f"Total concurrent execution time {total_time}s is too high"
        
        avg_response_time = statistics.mean(response_times)
        assert avg_response_time < 2.0, f"Average concurrent response time {avg_response_time}s is too high"

    def test_different_forecast_periods_performance(self, client):
        """Тест производительности для разных периодов прогнозирования"""
        periods = [1, 7, 14, 30, 60, 90, 180, 365]
        response_times = {}
        
        base_payload = {
            "Type": "Продажа",
            "Период": datetime.now().strftime("%Y-%m-%d"),
            "Номенклатура": "Test Product",
            "Код": "TEST001",
            "Количество": 10,
            "Цена_на_полке": 100.0
        }
        
        for days in periods:
            payload = [{"DaysCount": days}, base_payload]
            
            start_time = time.time()
            response = client.post("/forecast", json=payload)
            response_times[days] = time.time() - start_time
            
            assert response.status_code == 200
        
        print("\nResponse times by forecast period:")
        for days, time_taken in response_times.items():
            print(f"{days} days: {time_taken:.3f}s")
        
        # Проверяем, что время не растет экспоненциально с периодом
        # Время для 365 дней не должно быть в 365 раз больше времени для 1 дня
        assert response_times[365] < response_times[1] * 10, \
            "Response time grows too fast with forecast period"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
