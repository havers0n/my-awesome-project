import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from microservice import app, model, scaler, feature_cols


class TestPredictionQuality:
    """Тесты качества прогнозов модели на эталонных данных"""
    
    @pytest.fixture
    def client(self):
        """Создание тестового клиента FastAPI"""
        return TestClient(app)
    
    @pytest.fixture
    def benchmark_data(self):
        """Эталонные данные для тестирования"""
        return [
            {
                "item": "Хлеб белый",
                "code": "1001",
                "expected_daily_sales": 10,
                "tolerance": 0.3  # 30% допустимая погрешность
            },
            {
                "item": "Молоко 2.5%",
                "code": "2001",
                "expected_daily_sales": 15,
                "tolerance": 0.25
            },
            {
                "item": "Яйца куриные С1",
                "code": "3001",
                "expected_daily_sales": 8,
                "tolerance": 0.35
            }
        ]
    
    def test_single_item_prediction_accuracy(self, client, benchmark_data):
        """Тест точности прогноза для одного товара"""
        for item_data in benchmark_data:
            payload = [
                {"DaysCount": 7},
                {
                    "Type": "Продажа",
                    "Период": datetime.now().strftime("%Y-%m-%d"),
                    "Номенклатура": item_data["item"],
                    "Код": item_data["code"],
                    "Количество": 10,
                    "Цена_на_полке": 50.0
                }
            ]
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            
            result = response.json()
            assert len(result) >= 2  # Общая метрика + прогноз товара
            
            # Проверяем прогноз товара
            item_forecast = result[1]
            predicted_quantity = item_forecast["Количество"]
            expected_total = item_data["expected_daily_sales"] * 7
            
            # Проверяем, что прогноз в пределах допустимой погрешности
            lower_bound = expected_total * (1 - item_data["tolerance"])
            upper_bound = expected_total * (1 + item_data["tolerance"])
            
            assert lower_bound <= predicted_quantity <= upper_bound, \
                f"Прогноз для {item_data['item']}: {predicted_quantity}, " \
                f"ожидалось {expected_total} ± {item_data['tolerance']*100}%"
    
    def test_seasonal_patterns(self, client):
        """Тест учета сезонных паттернов"""
        item = "Мороженое"
        code = "4001"
        
        # Тестируем для разных месяцев
        seasonal_expectations = [
            ("2025-01-15", 5),   # Зима - низкие продажи
            ("2025-07-15", 20),  # Лето - высокие продажи
            ("2025-10-15", 10),  # Осень - средние продажи
        ]
        
        for date_str, expected_daily in seasonal_expectations:
            payload = [
                {"DaysCount": 30},
                {
                    "Type": "Продажа",
                    "Период": date_str,
                    "Номенклатура": item,
                    "Код": code,
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                }
            ]
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            
            result = response.json()
            predicted_quantity = result[1]["Количество"]
            
            # Проверяем общий тренд (не точное значение)
            if "01-" in date_str:  # Зима
                assert predicted_quantity < 300  # Меньше 10 в день
            elif "07-" in date_str:  # Лето
                assert predicted_quantity > 300  # Больше 10 в день
    
    def test_price_elasticity(self, client):
        """Тест влияния цены на прогноз"""
        item = "Шоколад"
        code = "5001"
        base_date = datetime.now().strftime("%Y-%m-%d")
        
        # Тестируем разные цены
        price_tests = [
            (50.0, "high"),   # Низкая цена - высокие продажи
            (100.0, "medium"), # Средняя цена
            (200.0, "low"),   # Высокая цена - низкие продажи
        ]
        
        predictions = {}
        
        for price, label in price_tests:
            payload = [
                {"DaysCount": 7},
                {
                    "Type": "Продажа",
                    "Период": base_date,
                    "Номенклатура": item,
                    "Код": code,
                    "Количество": 10,
                    "Цена_на_полке": price
                }
            ]
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            
            predictions[label] = response.json()[1]["Количество"]
        
        # Проверяем, что прогнозы соответствуют эластичности спроса
        # (не обязательно строго, но общий тренд должен быть)
        assert predictions["high"] >= predictions["medium"]
        assert predictions["medium"] >= predictions["low"]
    
    def test_prediction_metrics_validity(self, client):
        """Тест валидности метрик прогнозирования"""
        payload = [
            {"DaysCount": 14},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Тестовый товар",
                "Код": "TEST001",
                "Количество": 5,
                "Цена_на_полке": 75.0
            }
        ]
        
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        
        result = response.json()
        
        # Проверяем общие метрики
        general_metrics = result[0]
        assert "DaysPredict" in general_metrics
        assert general_metrics["DaysPredict"] == 14
        
        # Проверяем метрики товара
        item_metrics = result[1]
        assert "MAPE" in item_metrics
        assert "MAE" in item_metrics
        
        # MAPE должен быть в разумных пределах (0-100%)
        mape_value = float(item_metrics["MAPE"].rstrip('%'))
        assert 0 <= mape_value <= 100
        
        # MAE должен быть неотрицательным
        assert item_metrics["MAE"] >= 0
    
    def test_multiple_items_forecast(self, client):
        """Тест прогнозирования для нескольких товаров одновременно"""
        items = [
            ("Хлеб белый", "1001", 50.0),
            ("Молоко 2.5%", "2001", 60.0),
            ("Сыр твердый", "3002", 250.0),
            ("Масло сливочное", "4002", 180.0),
        ]
        
        payload = [{"DaysCount": 10}]
        
        for name, code, price in items:
            payload.append({
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": name,
                "Код": code,
                "Количество": 5,
                "Цена_на_полке": price
            })
        
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        
        result = response.json()
        
        # Должны получить общую метрику + прогнозы для каждого товара
        assert len(result) == len(items) + 1
        
        # Проверяем, что каждый товар получил прогноз
        for i, (name, code, _) in enumerate(items):
            item_result = result[i + 1]
            assert item_result["Номенклатура"] == name
            assert item_result["Код"] == code
            assert item_result["Количество"] > 0
    
    def test_zero_sales_handling(self, client):
        """Тест обработки товаров с нулевыми продажами"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Редкий товар",
                "Код": "RARE001",
                "Количество": 0,
                "Цена_на_полке": 1000.0
            }
        ]
        
        response = client.post("/forecast", json=payload)
        assert response.status_code == 200
        
        result = response.json()
        predicted_quantity = result[1]["Количество"]
        
        # Даже для товаров с нулевыми продажами должен быть минимальный прогноз
        assert predicted_quantity >= 1
    
    def test_forecast_consistency(self, client):
        """Тест консистентности прогнозов"""
        payload = [
            {"DaysCount": 7},
            {
                "Type": "Продажа",
                "Период": datetime.now().strftime("%Y-%m-%d"),
                "Номенклатура": "Стабильный товар",
                "Код": "STABLE001",
                "Количество": 10,
                "Цена_на_полке": 100.0
            }
        ]
        
        # Делаем несколько запросов
        predictions = []
        for _ in range(3):
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            predictions.append(response.json()[1]["Количество"])
        
        # Прогнозы должны быть одинаковыми для одних и тех же входных данных
        assert all(p == predictions[0] for p in predictions), \
            f"Непоследовательные прогнозы: {predictions}"
    
    def test_long_term_forecast(self, client):
        """Тест долгосрочного прогнозирования"""
        forecast_periods = [7, 14, 30, 60, 90]
        item = "Тест долгосрочный"
        code = "LONG001"
        
        predictions = {}
        
        for days in forecast_periods:
            payload = [
                {"DaysCount": days},
                {
                    "Type": "Продажа",
                    "Период": datetime.now().strftime("%Y-%m-%d"),
                    "Номенклатура": item,
                    "Код": code,
                    "Количество": 10,
                    "Цена_на_полке": 100.0
                }
            ]
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            
            result = response.json()
            predictions[days] = result[1]["Количество"]
        
        # Прогнозы должны масштабироваться пропорционально периоду
        # (с некоторой погрешностью)
        for i in range(len(forecast_periods) - 1):
            days1 = forecast_periods[i]
            days2 = forecast_periods[i + 1]
            ratio = days2 / days1
            
            # Проверяем, что прогноз растет примерно пропорционально
            actual_ratio = predictions[days2] / predictions[days1]
            assert 0.5 * ratio <= actual_ratio <= 2.0 * ratio, \
                f"Непропорциональный рост прогноза: {days1}d -> {days2}d"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
