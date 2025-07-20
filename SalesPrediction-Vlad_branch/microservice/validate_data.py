#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для проверки соответствия данных между файлами в микросервисе
"""

import pandas as pd
import numpy as np
from pathlib import Path

def check_data_consistency():
    """Проверка консистентности данных между файлами"""
    
    # Загружаем данные
    try:
        sku_metrics = pd.read_csv('sku_metrics.csv')
        val_predictions = pd.read_csv('val_predictions.csv')
        historical_data = pd.read_csv('historical_data.csv')
        
        print("✓ Все файлы успешно загружены")
        print(f"  - sku_metrics.csv: {len(sku_metrics)} строк, {len(sku_metrics.columns)} столбцов")
        print(f"  - val_predictions.csv: {len(val_predictions)} строк, {len(val_predictions.columns)} столбцов")
        print(f"  - historical_data.csv: {len(historical_data)} строк, {len(historical_data.columns)} столбцов")
        
    except Exception as e:
        print(f"✗ Ошибка при загрузке файлов: {e}")
        return False
    
    # Проверяем столбцы
    print("\n=== Проверка столбцов ===")
    
    # Проверяем sku_metrics
    expected_metrics_columns = ['Номенклатура', 'RMSE', 'MAE', 'MAPE', 'wMAPE', 'R2']
    if list(sku_metrics.columns) == expected_metrics_columns:
        print("✓ Столбцы sku_metrics.csv корректны")
    else:
        print(f"✗ Столбцы sku_metrics.csv не совпадают с ожидаемыми")
        print(f"  Ожидаются: {expected_metrics_columns}")
        print(f"  Получены: {list(sku_metrics.columns)}")
    
    # Проверяем наличие ключевых столбцов в val_predictions
    required_val_columns = ['Номенклатура', 'TotalQuantity', 'Pred']
    missing_val_columns = [col for col in required_val_columns if col not in val_predictions.columns]
    if not missing_val_columns:
        print("✓ Ключевые столбцы в val_predictions.csv найдены")
    else:
        print(f"✗ Отсутствуют ключевые столбцы в val_predictions.csv: {missing_val_columns}")
    
    # Проверяем наличие ключевых столбцов в historical_data
    required_hist_columns = ['ItemName', 'TotalQuantity']
    missing_hist_columns = [col for col in required_hist_columns if col not in historical_data.columns]
    if not missing_hist_columns:
        print("✓ Ключевые столбцы в historical_data.csv найдены")
    else:
        print(f"✗ Отсутствуют ключевые столбцы в historical_data.csv: {missing_hist_columns}")
    
    # Проверяем пересечение номенклатуры
    print("\n=== Проверка пересечения номенклатуры ===")
    
    metrics_items = set(sku_metrics['Номенклатура'].dropna())
    val_items = set(val_predictions['Номенклатура'].dropna())
    hist_items = set(historical_data['ItemName'].dropna())
    
    print(f"Уникальных товаров в sku_metrics.csv: {len(metrics_items)}")
    print(f"Уникальных товаров в val_predictions.csv: {len(val_items)}")
    print(f"Уникальных товаров в historical_data.csv: {len(hist_items)}")
    
    # Проверяем пересечение val_predictions и sku_metrics
    val_in_metrics = val_items.intersection(metrics_items)
    val_not_in_metrics = val_items - metrics_items
    
    print(f"\nТоваров из val_predictions найдено в sku_metrics: {len(val_in_metrics)}")
    print(f"Товаров из val_predictions НЕ найдено в sku_metrics: {len(val_not_in_metrics)}")
    
    if val_not_in_metrics:
        print("Первые 5 товаров, не найденных в метриках:")
        for item in list(val_not_in_metrics)[:5]:
            print(f"  - {item}")
    
    # Проверяем пересечение val_predictions и historical_data
    val_in_hist = val_items.intersection(hist_items)
    val_not_in_hist = val_items - hist_items
    
    print(f"\nТоваров из val_predictions найдено в historical_data: {len(val_in_hist)}")
    print(f"Товаров из val_predictions НЕ найдено в historical_data: {len(val_not_in_hist)}")
    
    if val_not_in_hist:
        print("Первые 5 товаров, не найденных в исторических данных:")
        for item in list(val_not_in_hist)[:5]:
            print(f"  - {item}")
    
    # Проверяем качество данных
    print("\n=== Проверка качества данных ===")
    
    # Проверяем пропуски в метриках
    metrics_na = sku_metrics.isnull().sum()
    print("Пропуски в sku_metrics.csv:")
    for col, count in metrics_na.items():
        if count > 0:
            print(f"  - {col}: {count} пропусков ({count/len(sku_metrics)*100:.1f}%)")
    
    # Проверяем валидность предсказаний и фактических значений
    valid_predictions = val_predictions['Pred'].notna() & (val_predictions['Pred'] >= 0)
    valid_actual = val_predictions['TotalQuantity'].notna() & (val_predictions['TotalQuantity'] >= 0)
    
    print(f"\nВалидные предсказания в val_predictions: {valid_predictions.sum()}/{len(val_predictions)} ({valid_predictions.mean()*100:.1f}%)")
    print(f"Валидные фактические значения в val_predictions: {valid_actual.sum()}/{len(val_predictions)} ({valid_actual.mean()*100:.1f}%)")
    
    # Статистики по предсказаниям
    if valid_predictions.sum() > 0:
        pred_stats = val_predictions.loc[valid_predictions, 'Pred'].describe()
        print(f"\nСтатистики предсказаний:")
        print(f"  - Среднее: {pred_stats['mean']:.4f}")
        print(f"  - Медиана: {pred_stats['50%']:.4f}")
        print(f"  - Мин: {pred_stats['min']:.4f}")
        print(f"  - Макс: {pred_stats['max']:.4f}")
    
    # Статистики по фактическим значениям
    if valid_actual.sum() > 0:
        actual_stats = val_predictions.loc[valid_actual, 'TotalQuantity'].describe()
        print(f"\nСтатистики фактических значений:")
        print(f"  - Среднее: {actual_stats['mean']:.4f}")
        print(f"  - Медиана: {actual_stats['50%']:.4f}")
        print(f"  - Мин: {actual_stats['min']:.4f}")
        print(f"  - Макс: {actual_stats['max']:.4f}")
    
    # Проверяем несколько конкретных товаров
    print("\n=== Проверка конкретных товаров ===")
    
    sample_items = [
        'Абрикосовый аромат 0,4кг',
        'Айран «Турецкий» 2% 500г БЗМЖ',
        'Апельсиновая карамель 0,48'
    ]
    
    for item in sample_items:
        print(f"\nТовар: {item}")
        
        # Проверяем в метриках
        metrics_row = sku_metrics[sku_metrics['Номенклатура'] == item]
        if not metrics_row.empty:
            mae = metrics_row['MAE'].iloc[0]
            mape = metrics_row['MAPE'].iloc[0]
            print(f"  ✓ В метриках: MAE={mae:.4f}, MAPE={mape:.2f}%")
        else:
            print(f"  ✗ Не найден в метриках")
        
        # Проверяем в валидационных данных
        val_rows = val_predictions[val_predictions['Номенклатура'] == item]
        if not val_rows.empty:
            pred_mean = val_rows['Pred'].mean()
            actual_mean = val_rows['TotalQuantity'].mean()
            print(f"  ✓ В валидационных данных: {len(val_rows)} записей")
            print(f"    Среднее предсказание: {pred_mean:.4f}")
            print(f"    Среднее фактическое: {actual_mean:.4f}")
        else:
            print(f"  ✗ Не найден в валидационных данных")
    
    print("\n=== Проверка завершена ===")
    return True

if __name__ == "__main__":
    check_data_consistency()
