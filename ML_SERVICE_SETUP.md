# Настройка внешнего ML микросервиса

## 🔧 Конфигурация

Ваша система уже готова для работы с внешним ML микросервисом! Нужно только изменить URL.

### 1. Через переменные окружения

```bash
# В PowerShell
$env:ML_SERVICE_URL="http://your-ml-server.com:8000/predict"

# В bash/Linux
export ML_SERVICE_URL="http://your-ml-server.com:8000/predict"
```

### 2. Через .env файл

Добавьте в `backend/.env`:
```
ML_SERVICE_URL=http://your-ml-server.com:8000/predict
```

### 3. Примеры URL для различных сценариев

```bash
# Локальный сервер
ML_SERVICE_URL=http://localhost:8000/predict

# Сервер в локальной сети
ML_SERVICE_URL=http://192.168.1.100:8000/predict

# Внешний сервер
ML_SERVICE_URL=https://ml-api.yourcompany.com/predict

# Docker Compose (по имени сервиса)
ML_SERVICE_URL=http://ml-service:8000/predict

# Kubernetes (полное имя сервиса)
ML_SERVICE_URL=http://ml-service.namespace.svc.cluster.local:8000/predict
```

## 📋 Требования к микросервису

### Endpoint
- **URL**: `[YOUR_URL]/predict`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Формат входных данных
```json
{
  "DaysCount": 30,
  "events": [
    {
      "Type": "Продажа",
      "Период": "2025-07-15T00:00:00",
      "Номенклатура": "Молоко \"Домик в деревне\" 1л",
      "Код": "123456"
    }
  ]
}
```

### Формат ответа
```json
[
  { "MAPE": 42.1, "MAE": 0.8, "DaysPredict": 30 },
  { 
    "Период": "2025-07-15 - 2025-08-13", 
    "Номенклатура": "Молоко \"Домик в деревне\" 1л", 
    "Код": "123456", 
    "MAPE": "35.0%", 
    "MAE": 0.6, 
    "Количество": 120 
  }
]
```

## 🚀 Запуск с внешним сервисом

```bash
# 1. Установить переменную окружения
$env:ML_SERVICE_URL="http://your-ml-server.com:8000/predict"

# 2. Запустить backend
cd backend
npm run dev

# 3. Запустить frontend  
cd frontend
npm run dev
```

## 🔍 Проверка подключения

```bash
# Проверить доступность ML сервиса
curl -X GET http://your-ml-server.com:8000/health

# Проверить работу через backend
curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{"DaysCount": 30, "events": [{"Type": "Продажа", "Период": "2025-07-15T00:00:00", "Номенклатура": "Тест", "Код": "TEST"}]}'
```

## 🐳 Docker Compose пример

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - ML_SERVICE_URL=http://ml-service:8000/predict
    depends_on:
      - ml-service
      
  ml-service:
    image: your-ml-service:latest
    ports:
      - "8000:8000"
```

## 🛡️ Безопасность

Если микросервис требует аутентификацию, можно расширить код:

```typescript
// В backend/src/controllers/forecastController.ts
const response = await axios.post(ML_SERVICE_URL, mlRequestData, {
  headers: {
    'Authorization': `Bearer ${process.env.ML_SERVICE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});
```

## ✅ Проверочный список

- [ ] ML сервис доступен по сети
- [ ] Endpoint `/predict` работает
- [ ] Формат данных соответствует спецификации
- [ ] Настроена переменная `ML_SERVICE_URL`
- [ ] Backend может подключиться к ML сервису
- [ ] Frontend получает данные через backend API 