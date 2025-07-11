#!/usr/bin/env python3
"""
Скрипт для проверки готовности ML модели
"""

import os
import glob
import pickle
import subprocess
import time
import requests
import sys
from pathlib import Path

def check_model_files():
    """Проверяем наличие файлов модели"""
    print("1. Проверка наличия файлов модели...")
    
    models_dir = Path("models")
    if not models_dir.exists():
        print("❌ Папка models не существует")
        return False
    
    model_files = list(models_dir.glob("model-*.pkl"))
    if not model_files:
        print("❌ Файлы модели не найдены")
        return False
    
    latest_model = max(model_files, key=lambda x: x.stat().st_mtime)
    print(f"✅ Найдена модель: {latest_model}")
    
    # Проверим, что модель может быть загружена
    try:
        with open(latest_model, 'rb') as f:
            artifact = pickle.load(f)
        print(f"✅ Модель успешно загружена")
        print(f"   - Метрики: MAE={artifact['metrics']['mae']:.3f}, MAPE={artifact['metrics']['mape']:.3f}")
        return True
    except Exception as e:
        print(f"❌ Ошибка загрузки модели: {e}")
        return False

def start_api_server():
    """Запускаем API сервер в фоновом режиме"""
    print("2. Запуск API сервера...")
    
    try:
        # Проверим, не запущен ли уже сервер
        try:
            response = requests.get("http://localhost:5678/health", timeout=2)
            if response.status_code == 200:
                print("✅ API сервер уже запущен")
                return True
        except:
            pass
        
        # Запускаем сервер
        process = subprocess.Popen(
            [sys.executable, "api_main.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
        )
        
        # Ждем запуска
        print("   Ожидание запуска сервера...")
        for i in range(10):
            time.sleep(1)
            try:
                response = requests.get("http://localhost:5678/health", timeout=2)
                if response.status_code == 200:
                    print("✅ API сервер запущен")
                    return True
            except:
                continue
        
        print("❌ Не удалось запустить API сервер")
        return False
        
    except Exception as e:
        print(f"❌ Ошибка запуска API сервера: {e}")
        return False

def test_health_endpoint():
    """Тестируем health endpoint"""
    print("3. Тестирование health endpoint...")
    
    try:
        response = requests.get("http://localhost:5678/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health endpoint работает")
            print(f"   - Статус: {data['status']}")
            print(f"   - Модель загружена: {data['model_loaded']}")
            if 'train_metrics' in data:
                metrics = data['train_metrics']
                print(f"   - MAE: {metrics['mae']:.3f}")
                print(f"   - MAPE: {metrics['mape']:.3f}")
            return True
        else:
            print(f"❌ Health endpoint вернул статус {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка при тестировании health endpoint: {e}")
        return False

def test_forecast_endpoint():
    """Тестируем forecast endpoint"""
    print("4. Тестирование forecast endpoint...")
    
    try:
        payload = [
            {"DaysCount": 7},
            {"Type": "Продажа", "Период": "2024-03-01", "Номенклатура": "Товар1", "Количество": 10, "Код": "T001", "ВидНоменклатуры": "Продукты"},
            {"Type": "Продажа", "Период": "2024-03-02", "Номенклатура": "Товар1", "Количество": 12, "Код": "T001", "ВидНоменклатуры": "Продукты"},
            {"Type": "Продажа", "Период": "2024-03-03", "Номенклатура": "Товар1", "Количество": 8, "Код": "T001", "ВидНоменклатуры": "Продукты"},
            {"Type": "Продажа", "Период": "2024-03-04", "Номенклатура": "Товар1", "Количество": 15, "Код": "T001", "ВидНоменклатуры": "Продукты"},
            {"Type": "Продажа", "Период": "2024-03-05", "Номенклатура": "Товар1", "Количество": 9, "Код": "T001", "ВидНоменклатуры": "Продукты"}
        ]
        
        response = requests.post("http://localhost:5678/forecast", json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Forecast endpoint работает")
            print(f"   - Получено {len(data)} записей в ответе")
            if data:
                print(f"   - Первая запись: {data[0]}")
            return True
        else:
            print(f"❌ Forecast endpoint вернул статус {response.status_code}")
            print(f"   - Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка при тестировании forecast endpoint: {e}")
        return False

def main():
    """Основная функция проверки"""
    print("=== Проверка готовности ML модели ===\n")
    
    results = []
    
    # 1. Проверка файлов модели
    results.append(check_model_files())
    
    # 2. Запуск API сервера
    if results[-1]:
        results.append(start_api_server())
    else:
        print("❌ Пропуск тестов API из-за отсутствия модели")
        return False
    
    # 3. Тестирование health endpoint
    if results[-1]:
        results.append(test_health_endpoint())
    else:
        print("❌ Пропуск тестов endpoints из-за проблем с сервером")
        return False
    
    # 4. Тестирование forecast endpoint
    if results[-1]:
        results.append(test_forecast_endpoint())
    
    print(f"\n=== Результаты проверки ===")
    
    if all(results):
        print("✅ Все проверки пройдены успешно!")
        print("✅ ML модель готова к использованию")
        return True
    else:
        print("❌ Некоторые проверки не прошли")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
