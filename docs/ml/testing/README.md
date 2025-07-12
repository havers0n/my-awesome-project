# ML Service Tests

Комплексный набор тестов для ML-сервиса прогнозирования продаж.

## Структура тестов

```
ML/tests/
├── test_data_preprocessing.py  # Unit-тесты для preprocessing данных
├── test_prediction_quality.py   # Тесты качества прогнозов на эталонных данных
├── test_performance.py          # Тесты производительности модели
├── test_edge_cases.py          # Тесты обработки edge cases
├── test_ab_testing.py          # A/B тестирование различных моделей
├── test_integration.py         # Интеграционные тесты с основной системой
├── test_caching.py             # Тесты кэширования прогнозов
├── pytest.ini                  # Конфигурация pytest
├── run_tests.py               # Скрипт для запуска тестов
└── README.md                  # Этот файл
```

## Установка зависимостей

```bash
pip install pytest pytest-cov pytest-timeout fastapi httpx pandas numpy scikit-learn psutil
```

## Запуск тестов

### Запуск всех тестов
```bash
python run_tests.py
```

### Запуск конкретной категории тестов
```bash
# Unit-тесты
python run_tests.py --type unit

# Интеграционные тесты
python run_tests.py --type integration

# Тесты производительности
python run_tests.py --type performance

# Edge cases
python run_tests.py --type edge_cases

# A/B тестирование
python run_tests.py --type ab_testing

# Тесты кэширования
python run_tests.py --type caching
```

### Дополнительные опции
```bash
# Подробный вывод
python run_tests.py -v

# С измерением покрытия кода
python run_tests.py -c

# Быстрый запуск (без медленных тестов)
python run_tests.py -q

# Комбинация опций
python run_tests.py --type performance -v -c
```

### Прямой запуск через pytest
```bash
# Запуск всех тестов
pytest

# Запуск конкретного файла
pytest test_performance.py

# Запуск с покрытием
pytest --cov=.. --cov-report=html

# Запуск по маркерам
pytest -m performance
pytest -m "not slow"
```

## Категории тестов

### 1. Unit-тесты препроцессинга (test_data_preprocessing.py)
- Извлечение признаков из данных
- Обработка отсутствующих значений
- Циклическое кодирование временных признаков
- Валидация типов данных
- Обработка специальных символов

### 2. Тесты качества прогнозов (test_prediction_quality.py)
- Точность прогнозов на эталонных данных
- Учет сезонных паттернов
- Влияние цены на прогноз
- Валидность метрик (MAPE, MAE)
- Консистентность прогнозов

### 3. Тесты производительности (test_performance.py)
- Время отклика одиночных запросов
- Обработка пакетных запросов
- Параллельные запросы
- Использование памяти
- Масштабируемость

### 4. Edge cases (test_edge_cases.py)
- Минимальные данные
- Выбросы в данных
- Большое количество товаров
- Нулевые продажи
- Экстремальные даты
- Unicode и специальные символы

### 5. A/B тестирование (test_ab_testing.py)
- Сравнение моделей
- Чувствительность к входным данным
- Кросс-валидация
- Устойчивость к выбросам
- Сезонная точность

### 6. Интеграционные тесты (test_integration.py)
- Health check эндпоинты
- Fallback механизмы
- Обработка таймаутов
- Параллельные запросы
- Валидация запросов
- Большие payload

### 7. Тесты кэширования (test_caching.py)
- Кэширование идентичных запросов
- Инвалидация кэша
- Производительность кэша
- Консистентность ключей
- Параллельный доступ

## Метрики качества

### Целевые показатели
- **MAPE** (Mean Absolute Percentage Error): < 15%
- **MAE** (Mean Absolute Error): < 1.0
- **Время отклика**: < 1с для одного товара
- **Пропускная способность**: > 100 запросов/с
- **Использование памяти**: < 1GB для 1000 товаров

### SLA для продакшена
- Доступность: 99.9%
- P95 latency: < 2с
- P99 latency: < 5с
- Максимальный размер запроса: 10MB
- Таймаут запроса: 30с

## CI/CD интеграция

### GitHub Actions
```yaml
- name: Run ML tests
  run: |
    cd ML/tests
    python run_tests.py --coverage
```

### Pre-commit hook
```bash
#!/bin/bash
cd ML/tests
python run_tests.py --quick
```

## Отладка

### Запуск конкретного теста
```bash
pytest test_performance.py::TestModelPerformance::test_prediction_time_under_threshold -v
```

### Вывод print statements
```bash
pytest -s
```

### Отладка с pdb
```bash
pytest --pdb
```

## Известные проблемы

1. **Медленные тесты**: Некоторые тесты производительности могут занимать много времени. Используйте флаг `-q` для быстрого запуска.

2. **Зависимости от модели**: Тесты зависят от наличия файлов модели в `ML/models/`. Убедитесь, что они существуют.

3. **Память**: Тесты с большим количеством товаров могут требовать значительной памяти.

## Контрибьюции

При добавлении новых тестов:
1. Используйте соответствующие маркеры pytest
2. Добавьте docstring с описанием теста
3. Следуйте существующим паттернам именования
4. Обновите этот README при необходимости
