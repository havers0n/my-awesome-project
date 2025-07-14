import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from microservice import app

class TestEdgeCases:
    """Тесты обработки крайних случаев"""

    @pytest.fixture()
    def client(self):
        return TestClient(app)

    def test_minimal_data(self, client):
        """Тест большого количества постапокалиптического времени"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-07",
                "Номенклатура": "Редкий товар",
                "Код": "RARE001",
                "Количество": 1,
                "Цена_на_полке": 1000.0
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200

    def test_outliers(self, client):
        """Тест для выбросов в данных"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-07",
                "Номенклатура": "Странный товар",
                "Код": "OUTLIER001",
                "Количество": 10000,
                "Цена_на_полке": 0.1
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200

    def test_high_price_sensitivity(self, client):
        """Тест чувствительности к высокой цене"""
        item_name = "Золото"
        item_code = "GOLD001"
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": "2025-07-07",
                "Номенклатура": item_name,
                "Код": item_code,
                "Количество": 1,
                "Цена_на_полке": 1000000.0
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        predicted_quantity = response.json()[1]["Количество"]
        assert predicted_quantity < 10, \
                f"Expected low sales due to high price, got {predicted_quantity}"

    def test_large_number_of_items(self, client):
        """Тест для большого количества товаров"""
        payload = [{"DaysCount": 30}]
        for i in range(1000):
            payload.append({
                "Type": "Продажа",
                "Период": "2025-07-07",
                "Номенклатура": f"Товар {i}",
                "Код": f"LARGE{i:04d}",
                "Количество": 10,
                "Цена_на_полке": 100.0
            })
        response = client.post("/forecast", json=payload)
        predicted_quantities = [result["Количество"] for result in response.json()[1:]]
        assert response.status_code == 200
        assert len(predicted_quantities) == 1000, "Not all items received a forecast"
        assert all(quantity > 0 for quantity in predicted_quantities), \
                "Some forecasts are invalid!"

    def test_zero_quantity_sales(self, client):
        """Тест обработки продаж с нулевым количеством"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Товар без продаж",
                "Код": "ZERO001",
                "Количество": 0,
                "Цена_на_полке": 100.0
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        result = response.json()
        # Даже для товаров без продаж должен быть минимальный прогноз
        assert result[1]["Количество"] >= 1

    def test_negative_values_handling(self, client):
        """Тест обработки отрицательных значений"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Ошибочный товар",
                "Код": "NEG001",
                "Количество": -10,  # Отрицательное количество
                "Цена_на_полке": 100.0
            }
        ]
        response = client.post("/forecast", json=payload)
        # Модель должна обработать или отвергнуть отрицательные значения
        assert response.status_code in [200, 400]

    def test_extreme_dates(self, client):
        """Тест обработки экстремальных дат"""
        extreme_dates = [
            "2020-01-01",  # Прошлое
            "2030-12-31",  # Далекое будущее
            "2025-02-29",  # Високосный год
        ]
        
        for date in extreme_dates:
            payload = [
                {"DaysCount": 7},
                {
                    "Type": "Продажа",
                    "Период": date,
                    "Номенклатура": "Товар с экстремальной датой",
                    "Код": "DATE001",
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                }
            ]
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200

    def test_missing_optional_fields(self, client):
        """Тест обработки отсутствующих опциональных полей"""
        # Минимальный набор обязательных полей
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Минимальный товар",
                # Код опциональный, проверяем работу без него
                "Количество": 5
                # Цена тоже опциональная
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        result = response.json()
        assert result[1]["Количество"] > 0

    def test_unicode_and_special_chars(self, client):
        """Тест обработки Unicode и специальных символов"""
        special_items = [
            "Товар с эмодзи 🍎",
            "Товар с кириллицей АБВГД",
            "Product with \"quotes\"",
            "Item with 'apostrophes'",
            "Товар\nс\nпереносами",
            "Товар\tс\tтабуляцией",
            "商品名称",  # Китайские символы
            "سلعة",  # Арабские символы
        ]
        
        payload = [{"DaysCount": 7}]
        for i, item_name in enumerate(special_items):
            payload.append({
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": item_name,
                "Код": f"UNICODE{i:03d}",
                "Количество": 10,
                "Цена_на_полке": 100.0
            })
        
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        results = response.json()
        assert len(results) == len(special_items) + 1  # +1 для общей метрики

    def test_very_long_forecast_period(self, client):
        """Тест очень длинного периода прогнозирования"""
        payload = [
            {"DaysCount": 1000},  # Прогноз на ~3 года
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Долгосрочный товар",
                "Код": "LONG001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        result = response.json()
        # Прогноз должен быть разумным даже для длинного периода
        predicted = result[1]["Количество"]
        assert predicted > 0
        assert predicted < 1000000  # Не должно быть астрономических чисел

    def test_mixed_event_types(self, client):
        """Тест смешанных типов событий (продажи и поставки)"""
        payload = [
            {"DaysCount": 14},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Товар со смешанными событиями",
                "Код": "MIX001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            },
            {
                "Type": "Поставка",
                "Период": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                "Номенклатура": "Товар со смешанными событиями",
                "Код": "MIX001",
                "Количество": 100,
                "Цена": 80.0
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200

    def test_float_days_count(self, client):
        """Тест дробного количества дней"""
        payload = [
            {"DaysCount": 7.5},  # Дробное количество дней
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Товар с дробными днями",
                "Код": "FLOAT001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        response = client.post("/forecast", json=payload)
        # Модель должна либо принять, либо корректно отвергнуть дробные дни
        assert response.status_code in [200, 400]

    def test_duplicate_items(self, client):
        """Тест обработки дублирующихся товаров"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Дублирующийся товар",
                "Код": "DUP001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            },
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Дублирующийся товар",
                "Код": "DUP001",
                "Количество": 20,
                "Цена_на_полке": 150.0
            }
        ]
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        results = response.json()
        # Должны быть обработаны оба товара
        assert len(results) >= 3  # Общая метрика + 2 товара

    def test_extreme_quantities(self, client):
        """Тест экстремальных количеств"""
        extreme_cases = [
            (0.001, "TINY001"),      # Очень маленькое количество
            (1000000, "HUGE001"),    # Огромное количество
            (0, "ZERO002"),          # Ноль
        ]
        
        payload = [{"DaysCount": 7}]
        for quantity, code in extreme_cases:
            payload.append({
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": f"Товар с количеством {quantity}",
                "Код": code,
                "Количество": quantity,
                "Цена_на_полке": 100.0
            })
        
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        results = response.json()
        
        # Проверяем, что все товары получили прогноз
        assert len(results) == len(extreme_cases) + 1
        
        # Все прогнозы должны быть неотрицательными
        for i in range(1, len(results)):
            assert results[i]["Количество"] >= 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])

