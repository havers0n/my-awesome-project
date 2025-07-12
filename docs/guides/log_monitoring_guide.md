# Руководство по диагностике и мониторингу логов ML-системы

## Обзор компонентов системы

Система состоит из трех основных компонентов:
1. **Backend** (Node.js/TypeScript) - API сервер на порту 3000
2. **ML-сервис** (FastAPI/Python) - ML микросервис на порту 5678
3. **Frontend** (React/TypeScript) - веб-интерфейс

## 1. Backend логи

### Ключевые точки мониторинга:

#### 1.1 Запуск прогнозирования
```
=== predictSales called ===
```
- Проверяет инициализацию процесса прогнозирования
- Логирует входящие данные запроса

#### 1.2 Форматирование данных для ML
```
=== ML REQUEST DATA (formatted) ===
```
**Что проверять:**
- **Корректность payload**: Первый элемент должен содержать `DaysCount`
- **Реальные названия товаров**: Поле `Номенклатура` должно содержать реальные названия продуктов из БД
- **Формат дат**: Поле `Период` должно быть в формате YYYY-MM-DD
- **Целые числа**: Поле `Количество` должно содержать целые числа (проверка `Math.round()`)

**Пример корректных данных:**
```json
[
  { "DaysCount": 14 },
  {
    "Период": "2025-01-15",
    "Номенклатура": "Хлеб белый",
    "Количество": 45,
    "Код": "CODE-123",
    "ВидНоменклатуры": "Хлеб белый",
    "Type": "Продажа",
    "Адрес_точки": "Location 1"
  }
]
```

#### 1.3 Отправка в ML-сервис
```
--- FINAL PAYLOAD SENT TO ML SERVICE ---
```
**Что проверять:**
- URL ML-сервиса: `http://ml-service:5678/forecast`
- Полный payload перед отправкой
- Проверка формата даты: `/^\d{4}-\d{2}-\d{2}$/`
- Проверка типа количества: `Number.isInteger()`

#### 1.4 Обработка ошибок
```
=== VALIDATION ERROR - NOT RETRYING ===
```
- Появляется при ошибке 422 от ML-сервиса
- Указывает на проблемы с форматом данных

### Команды для мониторинга backend:

```bash
# Просмотр логов прогнозирования
tail -f backend.log | grep -E "(=== ML REQUEST DATA|--- FINAL PAYLOAD|VALIDATION ERROR)"

# Проверка формата данных
tail -f backend.log | grep -A 10 "=== ML REQUEST DATA"

# Мониторинг ошибок ML-сервиса
tail -f backend.log | grep -E "(ML service.*failed|Status.*422)"
```

## 2. ML-сервис логи

### Ключевые точки мониторинга:

#### 2.1 Запуск сервиса
```
INFO:     Запуск сервиса прогнозирования
INFO:     Модель успешно загружена и проверена
```

#### 2.2 Получение запроса
```
INFO:     POST /forecast
```

#### 2.3 Обработка данных
**Что проверять:**
- Отсутствие ошибок `y contains previously unseen labels`
- Успешное создание признаков (features)
- Корректная работа энкодера

#### 2.4 Коды ответа
- **200**: Успешный прогноз
- **422**: Ошибка валидации данных
- **500**: Внутренняя ошибка сервиса

### Команды для мониторинга ML-сервиса:

```bash
# Запуск ML-сервиса с логированием
cd ml && python -m uvicorn api_main:app --host 0.0.0.0 --port 5678 --log-level info

# Мониторинг логов ML-сервиса
tail -f ml_service.log | grep -E "(INFO|ERROR|WARNING)"

# Проверка health-check
curl http://localhost:5678/health

# Просмотр метрик
curl http://localhost:5678/metrics
```

## 3. Frontend логи (консоль браузера)

### Ключевые точки мониторинга:

#### 3.1 Запуск прогнозирования
```javascript
console.log('Forecast prediction initiated successfully');
```

#### 3.2 Обработка ошибок
```javascript
console.error('Failed to start forecast prediction:', error);
console.error('ML Error during forecast initiation:', mlError);
```

#### 3.3 Fallback на моки
```javascript
console.warn('API недоступен, используем моки:', error);
```

### Как проверить в браузере:

1. Открыть DevTools (F12)
2. Перейти на вкладку Console
3. Запустить прогнозирование
4. Проверить:
   - Отсутствие ошибок 422/500
   - Успешные ответы 200/201
   - Корректное обновление UI

## 4. Скрипт для автоматического мониторинга

```bash
#!/bin/bash

# log_monitor.sh
echo "=== Мониторинг логов ML-системы ==="
echo "Дата: $(date)"
echo

# Проверка backend
echo "1. Backend логи:"
if [ -f "backend.log" ]; then
    echo "✓ Последние запросы прогнозирования:"
    tail -n 50 backend.log | grep -E "(=== ML REQUEST DATA|--- FINAL PAYLOAD)" | tail -5
    
    echo "✓ Ошибки ML-сервиса:"
    tail -n 100 backend.log | grep -E "(VALIDATION ERROR|ML service.*failed)" | tail -3
else
    echo "✗ backend.log не найден"
fi

echo

# Проверка ML-сервиса
echo "2. ML-сервис:"
if curl -s http://localhost:5678/health > /dev/null; then
    echo "✓ ML-сервис доступен"
    curl -s http://localhost:5678/health | jq '.status'
else
    echo "✗ ML-сервис недоступен"
fi

echo

# Проверка frontend
echo "3. Frontend (требует manual check в браузере)"
echo "   - Откройте DevTools → Console"
echo "   - Запустите прогнозирование"
echo "   - Проверьте отсутствие ошибок"

echo
echo "=== Конец мониторинга ==="
```

## 5. Решение типовых проблем

### Проблема: Ошибка 422 "y contains previously unseen labels"

**Причина**: ML-модель встретила товар, которого не было в обучающих данных

**Решение:**
1. Проверить mapping товаров в `mlPayloadFormatter.ts`
2. Убедиться, что используются реальные названия из БД
3. Переобучить модель с новыми данными

### Проблема: Неправильный формат даты

**Причина**: Дата не в формате YYYY-MM-DD

**Решение:**
```typescript
// В mlPayloadFormatter.ts
Период: op.operation_date ? new Date(op.operation_date).toISOString().slice(0, 10) : null
```

### Проблема: Нецелые количества

**Причина**: Количество передается как float

**Решение:**
```typescript
// В mlPayloadFormatter.ts
Количество: Math.round(op.quantity || 0)
```

## 6. Регулярные проверки

### Ежедневно:
- Проверка доступности ML-сервиса
- Мониторинг ошибок 422
- Проверка корректности данных

### Еженедельно:
- Анализ качества прогнозов
- Проверка метрик MAPE/MAE
- Очистка логов

### Ежемесячно:
- Переобучение модели
- Оптимизация кеша
- Обновление системы мониторинга

## 7. Полезные команды

```bash
# Очистка логов
> backend.log
> ml_service.log

# Мониторинг в реальном времени
tail -f backend.log | grep -E "(ERROR|WARNING|=== ML REQUEST)"

# Проверка статуса всех сервисов
curl http://localhost:3000/health
curl http://localhost:5678/health

# Просмотр последних прогнозов
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/predictions/history
```
