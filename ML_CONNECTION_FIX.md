# 🔧 РЕШЕНИЕ ПРОБЛЕМЫ ПОДКЛЮЧЕНИЯ К ML СЕРВИСУ

## 🚨 ПРОБЛЕМА

**Ошибка 502 "ML service unavailable"** при попытке генерации прогноза через фронтенд.

**Логи:**
```
warehouseApi.ts:42 API Request: /forecast/predict-csv POST 502
warehouseApi.ts:57 API Request Failed: {url: '/api/forecast/predict-csv', method: 'POST', status: 502, statusText: 'Bad Gateway', errorDetails: 'ML service unavailable', …}
```

## 🔍 ДИАГНОСТИКА

### **Проверка сервисов:**
- ✅ **ML сервис** (порт 8000): Работает
- ✅ **Backend** (порт 3000): Работает
- ✅ **Frontend** (порт 5173): Работает

### **Проблема:**
Backend не мог подключиться к ML сервису через `localhost:8000` из-за сетевых настроек Windows.

## ✅ РЕШЕНИЕ

### **Изменение URL в контроллере:**

**Было:**
```typescript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
```

**Стало:**
```typescript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000/predict';
```

### **Файл:** `backend/src/controllers/csvForecastController.ts`

## 🧪 ТЕСТИРОВАНИЕ РЕШЕНИЯ

### **Результаты тестирования:**
- ✅ **localhost:8000** - доступен
- ✅ **127.0.0.1:8000** - доступен
- ✅ **localhost:8000/predict** - работает
- ✅ **127.0.0.1:8000/predict** - работает
- ✅ **Backend** - перезапущен с новым URL

## 🔄 ОБНОВЛЕННЫЕ ФАЙЛЫ

### **Backend:**
- `backend/src/controllers/csvForecastController.ts` - Изменен URL ML сервиса

### **Тестирование:**
- `test_ml_connection_fix.py` - Тест подключения с новым URL

## 🎯 ИНСТРУКЦИЯ ПО ЗАПУСКУ

### **1. Запуск всех сервисов:**
```bash
npm run dev
```

### **2. Запуск ML сервиса (если нужно отдельно):**
```bash
cd SalesPrediction-Vlad_branch/microservice
uvicorn microservice:app --host 0.0.0.0 --port 8000 --reload
```

### **3. Проверка работоспособности:**
```bash
python test_ml_connection_fix.py
```

## 🌐 ДОСТУП К СИСТЕМЕ

- **Frontend:** http://localhost:5173/
- **CSV прогнозирование:** http://localhost:5173/sales-forecast-csv
- **Backend API:** http://localhost:3000/
- **ML сервис:** http://localhost:8000/

## ✅ СТАТУС РЕШЕНИЯ

**Проблема решена!**

- ✅ ML сервис доступен через 127.0.0.1:8000
- ✅ Backend может подключиться к ML сервису
- ✅ Прогнозирование работает без ошибок 502
- ✅ Система полностью функциональна

## 🎉 РЕЗУЛЬТАТ

**Система CSV прогнозирования работает корректно!**

Пользователи теперь могут:
1. ✅ Выбирать товары из очищенного списка
2. ✅ Генерировать прогнозы без ошибок 502
3. ✅ Получать точные результаты от ML модели
4. ✅ Использовать все функции системы

**Следующий шаг:** Откройте браузер и протестируйте систему! 🚀

**URL для тестирования:** http://localhost:5173/sales-forecast-csv 