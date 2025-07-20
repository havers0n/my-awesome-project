# 🚀 РУЧНОЙ ЗАПУСК ML СЕРВИСА

## ✅ ТЕКУЩИЙ СТАТУС

**Все сервисы запущены и работают:**
- ✅ **Frontend** (порт 5173): http://localhost:5173/
- ✅ **Backend** (порт 3000): http://localhost:3000/
- ✅ **ML сервис** (порт 8000): http://localhost:8000/

## 🎯 КАК ЗАПУСТИТЬ ML СЕРВИС ВРУЧНУЮ

### **1. Переход в директорию ML сервиса:**
```bash
cd SalesPrediction-Vlad_branch/microservice
```

### **2. Запуск ML сервиса:**
```bash
uvicorn microservice:app --host 0.0.0.0 --port 8000 --reload
```

### **3. Проверка работоспособности:**
```bash
# В новом терминале
curl http://localhost:8000/health
```

**Ожидаемый ответ:**
```json
{
  "status": "healthy", 
  "model_loaded": true, 
  "timestamp": "2025-07-20T13:29:19.420409"
}
```

## 🔧 АЛЬТЕРНАТИВНЫЕ СПОСОБЫ ЗАПУСКА

### **Способ 1: Через Python напрямую**
```bash
cd SalesPrediction-Vlad_branch/microservice
python -m uvicorn microservice:app --host 0.0.0.0 --port 8000 --reload
```

### **Способ 2: Через Docker (если настроен)**
```bash
cd SalesPrediction-Vlad_branch
docker build -t ml-service .
docker run -p 8000:8000 ml-service
```

### **Способ 3: Через скрипт build_and_run.sh**
```bash
cd SalesPrediction-Vlad_branch
./build_and_run.sh
```

## 🧪 ТЕСТИРОВАНИЕ ML СЕРВИСА

### **Автоматический тест:**
```bash
python test_ml_service.py
```

### **Ручной тест через curl:**
```bash
# Проверка здоровья
curl http://localhost:8000/health

# Тест прогнозирования
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "DaysCount": 7,
    "events": [
      {
        "Type": "Продажа",
        "Период": "2025-01-01",
        "Номенклатура": "Абрикосовый аромат 0,4кг",
        "Код": "CSV_1",
        "Количество": 5,
        "Цена": 100.0
      }
    ]
  }'
```

## 📊 ПАРАМЕТРЫ ЗАПУСКА

### **Основные параметры uvicorn:**
- `--host 0.0.0.0` - Привязка ко всем интерфейсам
- `--port 8000` - Порт для работы сервиса
- `--reload` - Автоматическая перезагрузка при изменениях

### **Дополнительные параметры:**
- `--workers 4` - Количество рабочих процессов
- `--log-level debug` - Уровень логирования
- `--access-log` - Логирование запросов

## 🔍 ДИАГНОСТИКА ПРОБЛЕМ

### **Проблема: Порт 8000 занят**
```bash
# Проверка занятых портов
netstat -an | findstr :8000

# Завершение процесса на порту 8000
taskkill /f /im python.exe
```

### **Проблема: Модуль не найден**
```bash
# Установка зависимостей
pip install -r requirements.txt
```

### **Проблема: CSV файл не найден**
```bash
# Проверка наличия файла
ls SalesPrediction-Vlad_branch/microservice/all_sku_metrics_1.csv
```

## 🌐 ДОСТУП К СЕРВИСАМ

### **Основные URL:**
- **Frontend:** http://localhost:5173/
- **CSV прогнозирование:** http://localhost:5173/sales-forecast-csv
- **Backend API:** http://localhost:3000/
- **ML сервис:** http://localhost:8000/

### **ML сервис эндпоинты:**
- **Здоровье:** GET http://localhost:8000/health
- **Корневой:** GET http://localhost:8000/
- **Прогнозирование:** POST http://localhost:8000/predict

## ✅ ПРОВЕРКА РАБОТОСПОСОБНОСТИ

### **Полная проверка системы:**
```bash
python test_full_integration.py
```

### **Проверка с аутентификацией:**
```bash
python test_with_auth.py
```

## 🎉 РЕЗУЛЬТАТ

**ML сервис успешно запущен и готов к работе!**

- ✅ Модель загружена
- ✅ API эндпоинты доступны
- ✅ Интеграция с backend работает
- ✅ Система готова к прогнозированию

**Следующий шаг:** Откройте браузер и протестируйте систему! 🚀 