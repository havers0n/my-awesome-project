# Инструкции по настройке и запуску проекта

## 1. Подготовка окружения и установка зависимостей

### Все зависимости успешно установлены:

✅ **Frontend**: `npm install --legacy-peer-deps` (выполнено)
✅ **Backend**: `npm install` (выполнено)
✅ **ML Service**: `pip install -r requirements.txt` (выполнено)

## 2. Запуск сервисов

### Вариант 1: Запуск в трех отдельных терминалах (рекомендуется)

#### Терминал 1 - Frontend:
```powershell
cd C:\Projects\newv\tailwind-admin-dashboard\frontend
npm run dev
```
Или используйте готовый скрипт:
```powershell
.\start_frontend.ps1
```

#### Терминал 2 - Backend:
```powershell
cd C:\Projects\newv\tailwind-admin-dashboard\backend
npm run dev
```
Или используйте готовый скрипт:
```powershell
.\start_backend.ps1
```

#### Терминал 3 - ML Service:
```powershell
cd C:\Projects\newv\tailwind-admin-dashboard\ml
python api_main.py
```
Или используйте готовый скрипт:
```powershell
.\start_ml.ps1
```

### Вариант 2: Запуск через Docker (требует Docker Desktop)
```powershell
docker-compose up -d
```

## 3. Проверка доступности сервисов

### Адреса сервисов:
- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:3000/health
- **ML Service**: http://localhost:5678/health

### Автоматическая проверка:
```powershell
.\check_services.ps1
```

### Ручная проверка:
```powershell
# Frontend
curl http://localhost:5173/

# Backend
curl http://localhost:3000/health

# ML Service
curl http://localhost:5678/health
```

## 4. Особенности запуска

### Frontend:
- Использует Vite для разработки
- Запускается на порту 5173
- Поддерживает hot-reload

### Backend:
- Использует Node.js с TypeScript
- Запускается на порту 3000
- Health check доступен на /health

### ML Service:
- Использует Python FastAPI
- Запускается на порту 5678
- Может требовать подключение к Redis (для полной функциональности)

## 5. Устранение неполадок

### Если Frontend не запускается:
- Проверьте, что зависимости установлены: `npm install --legacy-peer-deps`
- Убедитесь, что порт 5173 свободен

### Если Backend не запускается:
- Проверьте, что зависимости установлены: `npm install`
- Убедитесь, что порт 3000 свободен
- Проверьте настройки базы данных в .env файле

### Если ML Service не запускается:
- Проверьте, что зависимости установлены: `pip install -r requirements.txt`
- Убедитесь, что порт 5678 свободен
- Проверьте доступность Redis (если используется)

## 6. Созданные скрипты

В корне проекта созданы следующие скрипты:
- `start_frontend.ps1` - Запуск Frontend сервиса
- `start_backend.ps1` - Запуск Backend сервиса
- `start_ml.ps1` - Запуск ML сервиса
- `check_services.ps1` - Проверка доступности всех сервисов

## 7. Следующие шаги

После запуска всех сервисов вы можете:
1. Открыть Frontend в браузере: http://localhost:5173/
2. Протестировать API Backend: http://localhost:3000/health
3. Протестировать ML Service: http://localhost:5678/health
4. Начать разработку и тестирование функций проекта
