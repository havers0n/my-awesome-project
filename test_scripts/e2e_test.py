#!/usr/bin/env python3
"""
E2E тестирование полного потока:
Frontend загрузка файла → Backend парсинг → ML прогноз → Frontend отображение
"""

import requests
import json
import time
import csv
import os
from datetime import datetime
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_results/e2e_test.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class E2ETestRunner:
    def __init__(self):
        self.backend_url = "http://localhost:3000"
        self.ml_url = "http://localhost:5678"
        self.frontend_url = "http://localhost:5173"
        self.test_results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
    def check_services_health(self):
        """Проверка работоспособности всех сервисов"""
        logger.info("Проверка состояния сервисов...")
        
        services = [
            ("Backend", f"{self.backend_url}/health/simple"),
            ("ML Service", f"{self.ml_url}/health"),
            ("Frontend", f"{self.frontend_url}")
        ]
        
        for service_name, url in services:
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    logger.info(f"[OK] {service_name} работает корректно")
                else:
                    logger.error(f"[FAIL] {service_name} вернул код {response.status_code}")
                    return False
            except Exception as e:
                logger.error(f"[FAIL] {service_name} недоступен: {str(e)}")
                return False
                
        return True
    
    def test_csv_upload_and_forecast(self, csv_file_path, test_name):
        """Тест загрузки CSV и получения прогноза"""
        logger.info(f"Запуск теста: {test_name}")
        self.test_results['total_tests'] += 1
        
        try:
            # Шаг 1: Загрузка CSV файла
            with open(csv_file_path, 'rb') as file:
                files = {'file': file}
                response = requests.post(
                    f"{self.backend_url}/api/upload-csv",
                    files=files,
                    timeout=30
                )
                
                if response.status_code != 200:
                    raise Exception(f"Ошибка загрузки CSV: {response.status_code} - {response.text}")
                
                upload_result = response.json()
                logger.info(f"CSV успешно загружен: {upload_result}")
                
            # Шаг 2: Запрос прогноза к ML сервису
            forecast_data = [
                {
                    "DaysCount": 7
                },
                {
                    "Период": "2024-01-01",
                    "Номенклатура": "Товар1",
                    "Количество": 1,
                    "Type": "Продажа"
                }
            ]
            
            response = requests.post(
                f"{self.ml_url}/forecast",
                json=forecast_data,
                timeout=30
            )
            
            if response.status_code != 200:
                raise Exception(f"Ошибка ML прогноза: {response.status_code} - {response.text}")
            
            forecast_result = response.json()
            logger.info(f"Прогноз получен: {forecast_result}")
            
            # Шаг 3: Проверка структуры ответа
            if not isinstance(forecast_result, list) or len(forecast_result) < 2:
                raise Exception("Ответ ML сервиса должен быть списком минимум с 2 элементами")
            
            header = forecast_result[0]
            forecast_row = forecast_result[1]
            
            # Проверяем заголовок
            required_header_fields = ['MAPE', 'MAE', 'DaysPredict']
            for field in required_header_fields:
                if field not in header:
                    raise Exception(f"Отсутствует обязательное поле в заголовке: {field}")
            
            # Проверяем строку прогноза
            required_row_fields = ['Период', 'Номенклатура', 'Количество']
            for field in required_row_fields:
                if field not in forecast_row:
                    raise Exception(f"Отсутствует обязательное поле в строке прогноза: {field}")
            
            # Шаг 4: Проверка корректности данных
            if not isinstance(forecast_row['Количество'], int):
                raise Exception("Прогноз количества не является целым числом")
            
            if not (0 <= header['MAPE'] <= 100):
                raise Exception("MAPE должен быть между 0 и 100")
            
            logger.info(f"[PASS] Тест {test_name} прошел успешно")
            self.test_results['passed'] += 1
            
        except Exception as e:
            logger.error(f"[FAIL] Тест {test_name} провален: {str(e)}")
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {str(e)}")
    
    def test_error_handling(self):
        """Тест обработки ошибок"""
        logger.info("Тестирование обработки ошибок...")
        
        # Тест 1: Загрузка некорректного файла
        self.test_results['total_tests'] += 1
        try:
            response = requests.post(
                f"{self.backend_url}/api/upload-csv",
                files={'file': ('test.txt', 'not a csv content', 'text/plain')},
                timeout=30
            )
            
            if response.status_code == 200:
                raise Exception("Ожидалась ошибка при загрузке некорректного файла")
            
            logger.info("[PASS] Некорректный файл корректно отклонен")
            self.test_results['passed'] += 1
            
        except Exception as e:
            logger.error(f"[FAIL] Тест обработки ошибок провален: {str(e)}")
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"Error handling: {str(e)}")
        
        # Тест 2: Запрос прогноза с некорректными данными
        self.test_results['total_tests'] += 1
        try:
            invalid_data = [
                {
                    "DaysCount": 999  # Превышает максимум
                },
                {
                    "Период": "invalid-date",
                    "Номенклатура": "",
                    "Количество": "not-a-number",
                    "Type": "Продажа"
                }
            ]
            
            response = requests.post(
                f"{self.ml_url}/forecast",
                json=invalid_data,
                timeout=30
            )
            
            if response.status_code == 200:
                raise Exception("Ожидалась ошибка при некорректных данных прогноза")
            
            logger.info("[PASS] Некорректные данные прогноза корректно отклонены")
            self.test_results['passed'] += 1
            
        except Exception as e:
            logger.error(f"[FAIL] Тест некорректных данных провален: {str(e)}")
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"Invalid data handling: {str(e)}")
    
    def test_performance(self):
        """Тест производительности"""
        logger.info("Тестирование производительности...")
        self.test_results['total_tests'] += 1
        
        try:
            start_time = time.time()
            
            # Загрузка большого файла
            large_file_path = "test_data/large_dataset.csv"
            with open(large_file_path, 'rb') as file:
                files = {'file': file}
                response = requests.post(
                    f"{self.backend_url}/api/upload-csv",
                    files=files,
                    timeout=60
                )
                
                if response.status_code != 200:
                    raise Exception(f"Ошибка загрузки большого файла: {response.status_code}")
            
            upload_time = time.time() - start_time
            
            # Получение прогноза
            forecast_start = time.time()
            forecast_data = [
                {
                    "DaysCount": 30
                },
                {
                    "Период": "2024-01-01",
                    "Номенклатура": "Товар1",
                    "Количество": 1,
                    "Type": "Продажа"
                }
            ]
            
            response = requests.post(
                f"{self.ml_url}/forecast",
                json=forecast_data,
                timeout=60
            )
            
            forecast_time = time.time() - forecast_start
            total_time = time.time() - start_time
            
            logger.info(f"Время загрузки: {upload_time:.2f}s")
            logger.info(f"Время прогноза: {forecast_time:.2f}s")
            logger.info(f"Общее время: {total_time:.2f}s")
            
            # Проверка производительности
            if upload_time > 30:
                raise Exception(f"Загрузка слишком медленная: {upload_time:.2f}s")
            
            if forecast_time > 10:
                raise Exception(f"Прогноз слишком медленный: {forecast_time:.2f}s")
            
            logger.info("[PASS] Тест производительности пройден")
            self.test_results['passed'] += 1
            
        except Exception as e:
            logger.error(f"[FAIL] Тест производительности провален: {str(e)}")
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"Performance: {str(e)}")
    
    def run_all_tests(self):
        """Запуск всех тестов"""
        logger.info("=" * 50)
        logger.info("НАЧАЛО E2E ТЕСТИРОВАНИЯ")
        logger.info("=" * 50)
        
        # Проверка сервисов
        if not self.check_services_health():
            logger.error("Сервисы недоступны. Тестирование прервано.")
            return
        
        # Создание папки для результатов
        os.makedirs("test_results", exist_ok=True)
        
        # Тест 1: Нормальный поток с валидными данными
        self.test_csv_upload_and_forecast("test_data/sales_history.csv", "Нормальный поток")
        
        # Тест 2: Большой датасет
        self.test_csv_upload_and_forecast("test_data/large_dataset.csv", "Большой датасет")
        
        # Тест 3: Обработка ошибок
        self.test_error_handling()
        
        # Тест 4: Производительность
        self.test_performance()
        
        # Результаты
        logger.info("=" * 50)
        logger.info("РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ")
        logger.info("=" * 50)
        logger.info(f"Всего тестов: {self.test_results['total_tests']}")
        logger.info(f"Пройдено: {self.test_results['passed']}")
        logger.info(f"Провалено: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            logger.info("Ошибки:")
            for error in self.test_results['errors']:
                logger.info(f"  - {error}")
        
        # Сохранение результатов
        with open("test_results/e2e_results.json", 'w') as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        success_rate = (self.test_results['passed'] / self.test_results['total_tests']) * 100
        logger.info(f"Успешность: {success_rate:.1f}%")
        
        return success_rate >= 80  # Тесты считаются успешными при 80%+ успешности

if __name__ == "__main__":
    runner = E2ETestRunner()
    success = runner.run_all_tests()
    
    if success:
        logger.info("[SUCCESS] E2E тестирование завершено успешно!")
    else:
        logger.error("[ERROR] E2E тестирование провалено!")
        exit(1)
