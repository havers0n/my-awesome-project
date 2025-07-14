#!/usr/bin/env python3
"""
Скрипт для запуска всех тестов ML-сервиса
"""

import sys
import os
import subprocess
import argparse
from datetime import datetime


def run_tests(test_type=None, verbose=False, coverage=False):
    """
    Запуск тестов с различными параметрами
    
    Args:
        test_type: Тип тестов для запуска (unit, integration, performance, etc.)
        verbose: Подробный вывод
        coverage: Запуск с измерением покрытия кода
    """
    cmd = ["pytest"]
    
    # Добавляем путь к корневой директории в PYTHONPATH
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)
    
    # Опции pytest
    if verbose:
        cmd.append("-vv")
    else:
        cmd.append("-v")
    
    # Покрытие кода
    if coverage:
        cmd.extend(["--cov=..", "--cov-report=html", "--cov-report=term"])
    
    # Фильтр по типу тестов
    if test_type:
        cmd.extend(["-m", test_type])
    
    # Цветной вывод
    cmd.append("--color=yes")
    
    # Вывод информации о запуске
    print(f"\n{'='*60}")
    print(f"Запуск тестов ML-сервиса")
    print(f"Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Команда: {' '.join(cmd)}")
    print(f"{'='*60}\n")
    
    # Запуск тестов
    result = subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))
    
    return result.returncode


def main():
    """Основная функция"""
    parser = argparse.ArgumentParser(description="Запуск тестов ML-сервиса")
    
    parser.add_argument(
        "--type", "-t",
        choices=["all", "unit", "integration", "performance", "edge_cases", "ab_testing", "caching"],
        default="all",
        help="Тип тестов для запуска"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Подробный вывод"
    )
    
    parser.add_argument(
        "--coverage", "-c",
        action="store_true",
        help="Измерение покрытия кода"
    )
    
    parser.add_argument(
        "--quick", "-q",
        action="store_true",
        help="Быстрый запуск (пропустить медленные тесты)"
    )
    
    args = parser.parse_args()
    
    # Определяем какие тесты запускать
    test_type = None if args.type == "all" else args.type
    
    # Для быстрого запуска исключаем медленные тесты
    if args.quick:
        os.environ["PYTEST_ADDOPTS"] = "-m 'not slow'"
    
    # Запускаем тесты
    exit_code = run_tests(
        test_type=test_type,
        verbose=args.verbose,
        coverage=args.coverage
    )
    
    # Вывод результатов
    print(f"\n{'='*60}")
    if exit_code == 0:
        print("✅ Все тесты пройдены успешно!")
    else:
        print("❌ Некоторые тесты провалились!")
    print(f"{'='*60}\n")
    
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
