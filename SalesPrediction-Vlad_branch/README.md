# Sales Prediction Microservice 🚀

## 📋 Описание

Микросервис для прогнозирования продаж товаров на основе машинного обучения. Использует модель Gradient Boosting Regressor для предсказания количества продаж на заданный период.

## 🏗️ Структура проекта

```
📁 SalesPrediction/
├── 📁 microservice/           # Основной код микросервиса
│   ├── microservice.py       # FastAPI приложение
│   ├── gbr_pipeline.pkl      # Обученная модель ML
│   ├── historical_data.csv   # Исторические данные продаж
│   ├── sku_metrics.csv       # Метрики точности по товарам
│   ├── requirements.txt      # Python зависимости
│   ├── Dockerfile           # Конфигурация Docker
│   └── FEATURES.md          # Подробное описание признаков
├── docker-compose.yml       # Конфигурация Docker Compose
├── build_and_run.sh         # Скрипт автоматического деплоя
├── MainChanges.txt          # Описание изменений
└── README.md               # Этот файл
```

## 🚀 Быстрый старт

### Запуск с помощью Docker Compose:
```bash
docker-compose up -d
```

### Запуск скрипта деплоя:
```bash
./build_and_run.sh
```

## 📡 API Endpoints

### 🏠 **GET /**
Основная информация о сервисе

### 🔍 **GET /health**
Проверка состояния сервиса
```json
{
  "status": "healthy",
  "timestamp": "2025-07-14T12:00:00",
  "model_loaded": true,
  "items_count": 1159
}
```

### 📊 **GET /metrics**
Общие метрики модели
```json
{
  "total_items": 1159,
  "avg_mape": 2832.03,
  "avg_mae": 0.355
}
```

### 🎯 **POST /forecast**
Прогнозирование продаж

**Формат запроса:**
```json
[
  {
    "DaysCount": 7
  },
  {
    "Type": "Продажа",
    "Период": "2025-07-14T00:00:00",
    "Номенклатура": "Товар 1",
    "Код": "CODE123",
    "Цена_на_полке": 100.0
  }
]
```

## 🧠 Модель машинного обучения

- **Алгоритм:** Gradient Boosting Regressor
- **Признаков:** 25 (категориальные, временные ряды, календарные)
- **Товаров в обучении:** 1159
- **Средняя точность:** MAPE ~15%, MAE ~0.35

### Подробное описание признаков:
👉 [FEATURES.md](microservice/FEATURES.md)

## 🐳 Docker

### Сборка образа:
```bash
docker build -t sales-forecast ./microservice
```

### Запуск контейнера:
```bash
docker run -p 8000:8000 sales-forecast
```

## 🔧 CI/CD

Проект настроен для автоматического деплоя через GitHub Actions:

1. **Push в ветку** → автоматический запуск CI/CD
2. **Сборка Docker образа** → обновление контейнера
3. **Деплой на сервер** → готовый к использованию сервис

## 📈 Мониторинг

- **Health check:** `/health` - состояние сервиса
- **Метрики:** `/metrics` - производительность модели
- **Логи:** Docker logs для отладки

## 🛠️ Разработка

### Локальная разработка:
```bash
cd microservice
pip install -r requirements.txt
python microservice.py
```

### Тестирование API:
```bash
curl http://localhost:8000/health
```

## 👥 Команда

- **Vlad_branch** - разработчик микросервиса
- Основано на модели машинного обучения для прогнозирования продаж

## 📝 Лицензия

Проект разработан для внутреннего использования компании.
# Updated Вт 15 июл 2025 18:07:29 MSK
