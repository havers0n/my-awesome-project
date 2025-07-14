import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from microservice import get_item_features, get_item_metrics


class TestDataPreprocessing:
    """Тесты для функций предобработки данных"""

    def test_get_item_features_existing_item(self):
        """Тест получения признаков для существующего товара"""
        # Тестируем с известным товаром из исторических данных
        item_name = "Хлеб белый"
        item_code = "1001"
        target_date = pd.Timestamp("2025-07-15")
        price = 50.0
        
        features = get_item_features(item_name, item_code, target_date, price)
        
        # Проверяем, что все необходимые признаки присутствуют
        assert 'ItemName_Enc' in features
        assert 'Месяц' in features
        assert features['Месяц'] == 7
        assert 'ДеньМесяца' in features
        assert features['ДеньМесяца'] == 15
        assert 'ДеньНедели' in features
        assert 'Квартал' in features
        assert features['Квартал'] == 3
        assert 'PricePerUnit' in features
        assert features['PricePerUnit'] == 50.0
        
        # Проверяем циклические признаки
        assert 'month_sin' in features
        assert 'month_cos' in features
        assert -1 <= features['month_sin'] <= 1
        assert -1 <= features['month_cos'] <= 1

    def test_get_item_features_new_item(self):
        """Тест получения признаков для нового товара"""
        item_name = "Новый товар который точно не существует"
        item_code = "99999"
        target_date = pd.Timestamp("2025-08-01")
        
        features = get_item_features(item_name, item_code, target_date)
        
        # Проверяем, что используются дефолтные значения
        assert features['Sales_Avg_7'] == 1.0
        assert features['Sales_Avg_14'] == 1.0
        assert features['Sales_Avg_30'] == 1.0
        assert features['Sales_Std_7'] == 0.5
        assert features['PricePerUnit'] == 100.0  # Дефолтная цена

    def test_get_item_features_with_null_price(self):
        """Тест обработки null значения цены"""
        item_name = "Test Item"
        item_code = "1234"
        target_date = pd.Timestamp("2025-07-20")
        
        features = get_item_features(item_name, item_code, target_date, None)
        
        # Проверяем, что используется дефолтная цена
        assert features['PricePerUnit'] > 0

    def test_date_features_extraction(self):
        """Тест правильности извлечения временных признаков"""
        item_name = "Test"
        item_code = "123"
        
        # Тестируем разные даты
        test_cases = [
            (pd.Timestamp("2025-01-01"), 1, 1, 2, 1),  # месяц, день, день недели, квартал
            (pd.Timestamp("2025-04-15"), 4, 15, 1, 2),
            (pd.Timestamp("2025-07-31"), 7, 31, 3, 3),
            (pd.Timestamp("2025-12-25"), 12, 25, 3, 4),
        ]
        
        for date, expected_month, expected_day, expected_weekday, expected_quarter in test_cases:
            features = get_item_features(item_name, item_code, date)
            assert features['Месяц'] == expected_month
            assert features['ДеньМесяца'] == expected_day
            assert features['ДеньНедели'] == expected_weekday
            assert features['Квартал'] == expected_quarter

    def test_cyclic_encoding(self):
        """Тест циклического кодирования временных признаков"""
        item_name = "Test"
        item_code = "123"
        
        # Проверяем циклическое кодирование для всех месяцев
        for month in range(1, 13):
            date = pd.Timestamp(f"2025-{month:02d}-15")
            features = get_item_features(item_name, item_code, date)
            
            # sin и cos должны быть в диапазоне [-1, 1]
            assert -1 <= features['month_sin'] <= 1
            assert -1 <= features['month_cos'] <= 1
            
            # Проверяем, что sin²+cos²=1 (с учетом погрешности вычислений)
            sum_squares = features['month_sin']**2 + features['month_cos']**2
            assert abs(sum_squares - 1.0) < 0.0001

    def test_feature_completeness(self):
        """Тест полноты набора признаков"""
        from microservice import feature_cols
        
        item_name = "Test Item"
        item_code = "1234"
        target_date = pd.Timestamp("2025-07-15")
        
        features = get_item_features(item_name, item_code, target_date)
        
        # Проверяем, что все признаки из feature_cols присутствуют
        for col in feature_cols:
            assert col in features, f"Missing feature: {col}"
            assert features[col] is not None, f"Feature {col} is None"
            assert not np.isnan(features[col]), f"Feature {col} is NaN"

    def test_item_metrics_existing_item(self):
        """Тест получения метрик для существующего товара"""
        # Предполагаем, что в файле all_item_metrics.csv есть какие-то товары
        mape, mae = get_item_metrics("Хлеб белый", "1001")
        
        # Проверяем, что метрики в разумных пределах
        assert 0 <= mape <= 100  # MAPE в процентах
        assert mae >= 0

    def test_item_metrics_new_item(self):
        """Тест получения метрик для нового товара"""
        mape, mae = get_item_metrics("Несуществующий товар", "99999")
        
        # Должны использоваться дефолтные значения
        assert mape == 15.0  # Дефолтный MAPE
        assert mae == 0.5    # Дефолтный MAE

    def test_data_types_consistency(self):
        """Тест консистентности типов данных"""
        item_name = "Test"
        item_code = "123"
        target_date = pd.Timestamp("2025-07-15")
        
        features = get_item_features(item_name, item_code, target_date)
        
        # Все признаки должны быть числовыми
        for key, value in features.items():
            assert isinstance(value, (int, float, np.number)), \
                f"Feature {key} has non-numeric type: {type(value)}"

    def test_edge_cases_dates(self):
        """Тест граничных случаев для дат"""
        item_name = "Test"
        item_code = "123"
        
        # Тестируем граничные даты
        edge_dates = [
            pd.Timestamp("2025-01-01"),  # Начало года
            pd.Timestamp("2025-12-31"),  # Конец года
            pd.Timestamp("2025-02-29"),  # Високосный год
        ]
        
        for date in edge_dates:
            features = get_item_features(item_name, item_code, date)
            assert features is not None
            assert len(features) > 0

    def test_special_characters_handling(self):
        """Тест обработки специальных символов в названиях"""
        special_names = [
            "Товар с пробелами",
            "Товар-с-дефисами",
            "Товар/с/слешами",
            "Товар (с скобками)",
            "Товар №1",
            "Товар 'с кавычками'",
            "Товар \"с двойными кавычками\"",
        ]
        
        target_date = pd.Timestamp("2025-07-15")
        
        for name in special_names:
            features = get_item_features(name, "123", target_date)
            assert features is not None
            assert 'ItemName_Enc' in features
            assert isinstance(features['ItemName_Enc'], (int, float))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
