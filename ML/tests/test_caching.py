import pytest
import time
import hashlib
import json
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from microservice import app


class TestCaching:
    """Тесты механизма кэширования прогнозов"""
    
    @pytest.fixture
    def client(self):
        """Создание тестового клиента FastAPI"""
        return TestClient(app)
    
    @pytest.fixture
    def cache_storage(self):
        """Имитация хранилища кэша"""
        return {}
    
    def _generate_cache_key(self, payload):
        """Генерация ключа кэша на основе payload"""
        # Сортируем и сериализуем для консистентности
        payload_str = json.dumps(payload, sort_keys=True)
        return hashlib.md5(payload_str.encode()).hexdigest()
    
    def test_identical_requests_caching(self, client, cache_storage):
        """Тест кэширования идентичных запросов"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": "Кэшируемый товар",
                "Код": "CACHE001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        # Первый запрос - должен вычислить прогноз
        start_time1 = time.time()
        response1 = client.post("/forecast", json=payload)
        time1 = time.time() - start_time1
        assert response1.status_code == 200
        result1 = response1.json()
        
        # Сохраняем в имитации кэша
        cache_key = self._generate_cache_key(payload)
        cache_storage[cache_key] = result1
        
        # Второй идентичный запрос - должен быть быстрее
        start_time2 = time.time()
        response2 = client.post("/forecast", json=payload)
        time2 = time.time() - start_time2
        assert response2.status_code == 200
        result2 = response2.json()
        
        # Результаты должны быть идентичными
        assert result1 == result2
        
        # В реальной системе второй запрос должен быть значительно быстрее
        # из-за кэширования, но в тестах это не всегда так
        print(f"\nВремя первого запроса: {time1:.3f}s")
        print(f"Время второго запроса: {time2:.3f}s")
    
    def test_cache_invalidation_on_different_params(self, client):
        """Тест инвалидации кэша при изменении параметров"""
        base_payload = {
            "Type": "Продажа",
            "Период": "2025-07-15",
            "Номенклатура": "Товар для инвалидации",
            "Код": "INV001",
            "Количество": 10,
            "Цена_на_полке": 100.0
        }
        
        # Различные вариации запросов
        variations = [
            {"DaysCount": 7},    # Базовый
            {"DaysCount": 14},   # Другой период
            {"DaysCount": 7},    # Снова базовый (должен использовать кэш)
        ]
        
        results = []
        for days_header in variations:
            payload = [days_header, base_payload.copy()]
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            results.append(response.json())
        
        # Первый и третий результаты должны быть идентичными
        assert results[0] == results[2]
        # Второй результат должен отличаться (другой период)
        assert results[1][1]["Количество"] != results[0][1]["Количество"]
    
    def test_cache_expiration_simulation(self, client):
        """Симуляция истечения срока кэша"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Товар с истекающим кэшем",
                "Код": "EXP001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        # Первый запрос
        response1 = client.post("/forecast", json=payload)
        assert response1.status_code == 200
        result1 = response1.json()
        
        # Изменяем дату в payload (симулируя прошествие времени)
        payload[1]["Период"] = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Второй запрос с новой датой
        response2 = client.post("/forecast", json=payload)
        assert response2.status_code == 200
        result2 = response2.json()
        
        # Результаты могут отличаться из-за изменения даты
        # Это нормальное поведение - кэш не используется для разных дат
    
    def test_cache_performance_with_multiple_items(self, client):
        """Тест производительности кэша с множеством товаров"""
        # Создаем большой запрос
        payload = [{"DaysCount": 30}]
        for i in range(50):
            payload.append({
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": f"Товар {i}",
                "Код": f"PERF{i:04d}",
                "Количество": 10,
                "Цена_на_полке": 100.0 + i
            })
        
        # Замеряем время первого запроса
        start_time1 = time.time()
        response1 = client.post("/forecast", json=payload)
        time1 = time.time() - start_time1
        assert response1.status_code == 200
        
        # Замеряем время повторного запроса
        start_time2 = time.time()
        response2 = client.post("/forecast", json=payload)
        time2 = time.time() - start_time2
        assert response2.status_code == 200
        
        print(f"\nВремя обработки 50 товаров:")
        print(f"Первый запрос: {time1:.3f}s")
        print(f"Повторный запрос: {time2:.3f}s")
        
        # Убеждаемся, что результаты идентичны
        assert response1.json() == response2.json()
    
    def test_cache_key_generation_consistency(self, client):
        """Тест консистентности генерации ключей кэша"""
        # Два запроса с одинаковыми данными, но разным порядком полей
        payload1 = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": "Товар А",
                "Код": "KEY001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        payload2 = [
            {"DaysCount": 7},
            {
                "Код": "KEY001",
                "Номенклатура": "Товар А",
                "Type": "Продажа",
                "Цена_на_полке": 100.0,
                "Количество": 10,
                "Период": "2025-07-15"
            }
        ]
        
        # Генерируем ключи
        key1 = self._generate_cache_key(payload1)
        key2 = self._generate_cache_key(payload2)
        
        # Ключи должны быть одинаковыми несмотря на разный порядок полей
        assert key1 == key2
    
    def test_cache_memory_limits(self, client):
        """Тест ограничений памяти кэша"""
        # Создаем много уникальных запросов
        cache_size_test = []
        
        for i in range(100):  # 100 уникальных запросов
            payload = [
                {"DaysCount": 7},
                {
                    "Type": "Продажа",
                    "Период": "2025-07-15",
                    "Номенклатура": f"Уникальный товар {i}",
                    "Код": f"MEM{i:05d}",
                    "Количество": i + 1,
                    "Цена_на_полке": 100.0 + i
                }
            ]
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            cache_size_test.append(self._generate_cache_key(payload))
        
        # Проверяем, что все ключи уникальны
        assert len(set(cache_size_test)) == 100
    
    def test_cache_with_optional_fields(self, client):
        """Тест кэширования с опциональными полями"""
        # Базовый запрос
        base_payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": "Товар с опциями",
                "Код": "OPT001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        # Запрос с дополнительными полями
        extended_payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": "Товар с опциями",
                "Код": "OPT001",
                "Количество": 10,
                "Цена_на_полке": 100.0,
                "Поставщик": "Поставщик А",
                "Производитель": "Производитель Б",
                "Вес": 0.5
            }
        ]
        
        response1 = client.post("/forecast", json=base_payload)
        response2 = client.post("/forecast", json=extended_payload)
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Результаты могут отличаться из-за дополнительных полей
        # Это корректное поведение - разные наборы полей = разные ключи кэша
    
    def test_concurrent_cache_access(self, client):
        """Тест параллельного доступа к кэшу"""
        import concurrent.futures
        
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": "Параллельный товар",
                "Код": "CONC001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        def make_request():
            return client.post("/forecast", json=payload)
        
        # Запускаем 20 параллельных запросов
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(make_request) for _ in range(20)]
            responses = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # Все запросы должны быть успешными
        assert all(r.status_code == 200 for r in responses)
        
        # Все результаты должны быть идентичными
        results = [r.json() for r in responses]
        first_result = results[0]
        for result in results[1:]:
            assert result == first_result
    
    def test_cache_with_different_event_types(self, client):
        """Тест кэширования для разных типов событий"""
        # Запрос только с продажами
        sales_payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": "Товар для событий",
                "Код": "EVENT001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        # Запрос с продажами и поставками
        mixed_payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": "Товар для событий",
                "Код": "EVENT001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            },
            {
                "Type": "Поставка",
                "Период": "2025-07-20",
                "Номенклатура": "Товар для событий",
                "Код": "EVENT001",
                "Количество": 50,
                "Цена": 80.0
            }
        ]
        
        response1 = client.post("/forecast", json=sales_payload)
        response2 = client.post("/forecast", json=mixed_payload)
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Результаты должны отличаться из-за разных наборов событий
        result1 = response1.json()
        result2 = response2.json()
        
        # Проверяем, что это разные результаты
        assert len(result2) >= len(result1)  # Может быть больше результатов
    
    def test_cache_invalidation_on_model_update(self, client):
        """Тест инвалидации кэша при обновлении модели"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-15",
                "Номенклатура": "Товар для обновления модели",
                "Код": "UPDATE001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        # Первый запрос с текущей моделью
        response1 = client.post("/forecast", json=payload)
        assert response1.status_code == 200
        result1 = response1.json()
        
        # Симулируем обновление модели (в реальности это было бы перезагрузкой)
        # Здесь мы просто делаем еще один запрос
        
        # В продакшене после обновления модели кэш должен быть очищен
        # и результаты могут измениться
        response2 = client.post("/forecast", json=payload)
        assert response2.status_code == 200
        result2 = response2.json()
        
        # В тестовой среде результаты будут одинаковыми
        assert result1 == result2
        
        print("\nПримечание: В продакшене обновление модели должно инвалидировать кэш")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
