import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from microservice import app


class TestABTesting:
    """Тесты для A/B тестирования различных моделей"""
    
    @pytest.fixture
    def client(self):
        """Создание тестового клиента FastAPI"""
        return TestClient(app)
    
    @pytest.fixture
    def test_data(self):
        """Тестовые данные для A/B тестирования"""
        return {
            "products": [
                ("Хлеб белый", "1001", 50.0),
                ("Молоко 2.5%", "2001", 60.0),
                ("Яйца куриные С1", "3001", 90.0),
                ("Масло сливочное", "4001", 180.0),
                ("Сыр твердый", "5001", 350.0),
            ],
            "periods": [7, 14, 30],
            "dates": [
                datetime.now().strftime("%Y-%m-%d"),
                (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
                (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            ]
        }
    
    def test_model_consistency_across_runs(self, client, test_data):
        """Тест консистентности модели между запусками"""
        results_per_run = []
        
        # Делаем 5 одинаковых запросов
        for _ in range(5):
            payload = [{"DaysCount": 7}]
            for name, code, price in test_data["products"]:
                payload.append({
                    "Type": "Продажа",
                    "Период": test_data["dates"][0],
                    "Номенклатура": name,
                    "Код": code,
                    "Количество": 10,
                    "Цена_на_полке": price
                })
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            results_per_run.append(response.json())
        
        # Проверяем консистентность результатов
        for i in range(1, len(results_per_run)):
            for j in range(len(results_per_run[0])):
                if j > 0:  # Пропускаем общую метрику
                    assert results_per_run[0][j]["Количество"] == \
                           results_per_run[i][j]["Количество"], \
                           f"Несоответствие прогнозов между запусками для товара {j}"
    
    def test_model_performance_metrics_comparison(self, client, test_data):
        """Сравнение метрик производительности модели"""
        metrics = {
            "mape_values": [],
            "mae_values": [],
            "predictions": []
        }
        
        for name, code, price in test_data["products"]:
            payload = [
                {"DaysCount": 30},
                {
                    "Type": "Продажа",
                    "Период": test_data["dates"][0],
                    "Номенклатура": name,
                    "Код": code,
                    "Количество": 10,
                    "Цена_на_полке": price
                }
            ]
            
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            result = response.json()
            
            # Извлекаем метрики
            item_result = result[1]
            mape_str = item_result.get("MAPE", "0%")
            mape_value = float(mape_str.rstrip('%')) if isinstance(mape_str, str) else mape_str
            
            metrics["mape_values"].append(mape_value)
            metrics["mae_values"].append(item_result["MAE"])
            metrics["predictions"].append(item_result["Количество"])
        
        # Анализируем метрики
        avg_mape = np.mean(metrics["mape_values"])
        avg_mae = np.mean(metrics["mae_values"])
        
        print(f"\nМетрики модели:")
        print(f"Средний MAPE: {avg_mape:.2f}%")
        print(f"Средний MAE: {avg_mae:.2f}")
        print(f"Диапазон MAPE: {min(metrics['mape_values']):.2f}% - {max(metrics['mape_values']):.2f}%")
        print(f"Диапазон MAE: {min(metrics['mae_values']):.2f} - {max(metrics['mae_values']):.2f}")
        
        # Проверяем, что метрики в разумных пределах
        assert avg_mape < 50, f"Средний MAPE слишком высокий: {avg_mape}%"
        assert avg_mae < 10, f"Средний MAE слишком высокий: {avg_mae}"
    
    def test_sensitivity_to_input_variations(self, client):
        """Тест чувствительности модели к вариациям входных данных"""
        base_item = {
            "Type": "Продажа",
            "Период": datetime.now().strftime("%Y-%m-%d"),
            "Номенклатура": "Тестовый товар",
            "Код": "TEST001",
            "Количество": 10,
            "Цена_на_полке": 100.0
        }
        
        # Базовый прогноз
        payload = [{"DaysCount": 7}, base_item.copy()]
        response = client.post("/forecast", json=payload)
        base_prediction = response.json()[1]["Количество"]
        
        # Тестируем вариации
        variations = [
            ("price_increase", {"Цена_на_полке": 150.0}),
            ("price_decrease", {"Цена_на_полке": 50.0}),
            ("quantity_increase", {"Количество": 20}),
            ("quantity_decrease", {"Количество": 5}),
            ("different_date", {"Период": (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")}),
        ]
        
        results = {"base": base_prediction}
        
        for variation_name, changes in variations:
            test_item = base_item.copy()
            test_item.update(changes)
            
            payload = [{"DaysCount": 7}, test_item]
            response = client.post("/forecast", json=payload)
            results[variation_name] = response.json()[1]["Количество"]
        
        print("\nЧувствительность модели к изменениям:")
        for key, value in results.items():
            if key != "base":
                change_pct = ((value - results["base"]) / results["base"]) * 100
                print(f"{key}: {value} (изменение: {change_pct:+.1f}%)")
        
        # Проверяем логичность изменений
        assert results["price_increase"] <= results["base"], \
            "Повышение цены должно снижать прогноз продаж"
        assert results["price_decrease"] >= results["base"], \
            "Снижение цены должно увеличивать прогноз продаж"
    
    def test_cross_validation_stability(self, client, test_data):
        """Тест стабильности модели при кросс-валидации"""
        predictions_by_period = {period: [] for period in test_data["periods"]}
        
        for period in test_data["periods"]:
            for name, code, price in test_data["products"]:
                payload = [
                    {"DaysCount": period},
                    {
                        "Type": "Продажа",
                        "Период": test_data["dates"][0],
                        "Номенклатура": name,
                        "Код": code,
                        "Количество": 10,
                        "Цена_на_полке": price
                    }
                ]
                
                response = client.post("/forecast", json=payload)
                assert response.status_code == 200
                
                daily_avg = response.json()[1]["Количество"] / period
                predictions_by_period[period].append(daily_avg)
        
        # Анализируем стабильность среднедневных прогнозов
        print("\nСтабильность среднедневных прогнозов по периодам:")
        for i, (name, _, _) in enumerate(test_data["products"]):
            daily_avgs = [predictions_by_period[p][i] for p in test_data["periods"]]
            cv = np.std(daily_avgs) / np.mean(daily_avgs) if np.mean(daily_avgs) > 0 else 0
            print(f"{name}: CV = {cv:.3f}")
            
            # Коэффициент вариации не должен быть слишком высоким
            assert cv < 0.5, f"Слишком высокая вариабельность для {name}: CV = {cv}"
    
    def test_model_robustness_to_outliers(self, client):
        """Тест устойчивости модели к выбросам"""
        normal_quantities = [10, 12, 11, 13, 10, 11, 12]
        outlier_quantities = [10, 12, 11, 100, 10, 11, 12]  # 100 - выброс
        
        results = {}
        
        for scenario, quantities in [("normal", normal_quantities), ("outlier", outlier_quantities)]:
            total_prediction = 0
            
            for i, qty in enumerate(quantities):
                payload = [
                    {"DaysCount": 7},
                    {
                        "Type": "Продажа",
                        "Период": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
                        "Номенклатура": "Товар для теста выбросов",
                        "Код": "OUTLIER001",
                        "Количество": qty,
                        "Цена_на_полке": 100.0
                    }
                ]
                
                response = client.post("/forecast", json=payload)
                assert response.status_code == 200
                total_prediction += response.json()[1]["Количество"]
            
            results[scenario] = total_prediction / len(quantities)
        
        print(f"\nУстойчивость к выбросам:")
        print(f"Средний прогноз (нормальные данные): {results['normal']:.1f}")
        print(f"Средний прогноз (с выбросом): {results['outlier']:.1f}")
        
        # Модель должна быть устойчива к выбросам
        change_pct = abs((results['outlier'] - results['normal']) / results['normal']) * 100
        assert change_pct < 50, f"Модель слишком чувствительна к выбросам: изменение {change_pct:.1f}%"
    
    def test_seasonal_model_accuracy(self, client):
        """Тест точности модели для сезонных товаров"""
        seasonal_products = [
            {
                "name": "Мороженое",
                "code": "ICE001",
                "summer_sales": 50,
                "winter_sales": 10,
            },
            {
                "name": "Горячий шоколад",
                "code": "HOT001",
                "summer_sales": 5,
                "winter_sales": 30,
            }
        ]
        
        for product in seasonal_products:
            # Летний прогноз
            summer_payload = [
                {"DaysCount": 30},
                {
                    "Type": "Продажа",
                    "Период": "2025-07-15",
                    "Номенклатура": product["name"],
                    "Код": product["code"],
                    "Количество": product["summer_sales"],
                    "Цена_на_полке": 100.0
                }
            ]
            
            # Зимний прогноз
            winter_payload = [
                {"DaysCount": 30},
                {
                    "Type": "Продажа",
                    "Период": "2025-01-15",
                    "Номенклатура": product["name"],
                    "Код": product["code"],
                    "Количество": product["winter_sales"],
                    "Цена_на_полке": 100.0
                }
            ]
            
            summer_response = client.post("/forecast", json=summer_payload)
            winter_response = client.post("/forecast", json=winter_payload)
            
            assert summer_response.status_code == 200
            assert winter_response.status_code == 200
            
            summer_forecast = summer_response.json()[1]["Количество"]
            winter_forecast = winter_response.json()[1]["Количество"]
            
            print(f"\nСезонность для {product['name']}:")
            print(f"Летний прогноз: {summer_forecast}")
            print(f"Зимний прогноз: {winter_forecast}")
            
            # Проверяем, что модель учитывает сезонность
            if product["summer_sales"] > product["winter_sales"]:
                assert summer_forecast > winter_forecast * 0.8, \
                    f"Модель не учитывает летнюю сезонность для {product['name']}"
            else:
                assert winter_forecast > summer_forecast * 0.8, \
                    f"Модель не учитывает зимнюю сезонность для {product['name']}"
    
    def test_model_comparison_framework(self, client, test_data):
        """Фреймворк для сравнения различных версий модели"""
        # Симулируем результаты двух моделей
        # В реальности здесь были бы разные эндпоинты или версии
        
        models_results = {
            "current_model": [],
            "baseline_model": []  # Простая базовая модель
        }
        
        for name, code, price in test_data["products"]:
            payload = [
                {"DaysCount": 30},
                {
                    "Type": "Продажа",
                    "Период": test_data["dates"][0],
                    "Номенклатура": name,
                    "Код": code,
                    "Количество": 10,
                    "Цена_на_полке": price
                }
            ]
            
            # Текущая модель
            response = client.post("/forecast", json=payload)
            assert response.status_code == 200
            current_prediction = response.json()[1]["Количество"]
            models_results["current_model"].append(current_prediction)
            
            # Базовая модель (простое среднее * дни)
            baseline_prediction = 10 * 30  # количество * дни
            models_results["baseline_model"].append(baseline_prediction)
        
        # Сравниваем модели
        print("\nСравнение моделей:")
        print(f"{'Товар':<20} {'Текущая модель':<15} {'Базовая модель':<15} {'Разница %':<10}")
        print("-" * 60)
        
        improvements = []
        for i, (name, _, _) in enumerate(test_data["products"]):
            current = models_results["current_model"][i]
            baseline = models_results["baseline_model"][i]
            diff_pct = ((current - baseline) / baseline) * 100 if baseline > 0 else 0
            improvements.append(abs(diff_pct))
            
            print(f"{name:<20} {current:<15} {baseline:<15} {diff_pct:+.1f}%")
        
        avg_improvement = np.mean(improvements)
        print(f"\nСредняя разница: {avg_improvement:.1f}%")
        
        # Проверяем, что текущая модель дает более разнообразные прогнозы
        current_cv = np.std(models_results["current_model"]) / np.mean(models_results["current_model"])
        baseline_cv = np.std(models_results["baseline_model"]) / np.mean(models_results["baseline_model"])
        
        assert current_cv > baseline_cv, \
            "Текущая модель должна давать более дифференцированные прогнозы"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
