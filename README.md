# Tailwind Admin Dashboard

## Обзор

Современная админ-панель для управления продажами, инвентарем и прогнозированием, построенная на React, TypeScript и Tailwind CSS.

## Основные возможности

- 📊 **Дашборд с аналитикой** - Интерактивные графики и метрики
- 🔮 **Прогнозирование продаж** - ML-модели для предсказания продаж
- 👥 **Управление пользователями** - Система ролей и разрешений
- 📦 **Управление инвентарем** - Отслеживание товаров и складов
- 📈 **Отчеты** - Детальная аналитика и экспорт данных
- 🔐 **Безопасность** - Аутентификация и авторизация
- 📱 **Адаптивный дизайн** - Работает на всех устройствах

## Технологический стек

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Vite** - Сборка и разработка
- **React Router** - Маршрутизация

### Backend
- **Node.js** - Серверная платформа
- **Express.js** - Web фреймворк
- **TypeScript** - Типизация
- **PostgreSQL** - База данных
- **Supabase** - Backend-as-a-Service

### ML/AI
- **Python** - Машинное обучение
- **FastAPI** - API для ML сервиса
- **scikit-learn** - ML библиотека

## Быстрый старт

### Предварительные требования
- Node.js 18+
- Python 3.8+
- PostgreSQL 13+

### Установка

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd tailwind-admin-dashboard
```

2. **Установка зависимостей**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# ML Service
cd ../ML
pip install -r requirements.txt
```

3. **Настройка окружения**
```bash
# Скопируйте файлы конфигурации
cp .env.example .env
# Настройте переменные окружения
```

4. **Запуск сервисов**
```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: ML Service
cd ML && python microservice.py
```

5. **Открытие приложения**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- ML Service: http://localhost:5678

## Структура проекта

```
tailwind-admin-dashboard/
├── 📁 docs/                    # Документация
├── 📁 frontend/                # React приложение
├── 📁 backend/                 # Node.js API
├── 📁 ML/                      # Python ML сервис
├── 📁 database/                # SQL миграции
├── 📁 scripts/                 # Утилиты и скрипты
├── 📁 test_data/               # Тестовые данные
└── 📁 cypress/                 # E2E тесты
```

## Документация

Полная документация доступна в папке [`docs/`](docs/):

- 📚 **[Общая документация](docs/README.md)** - Обзор и навигация
- 🏗️ **[Архитектура](docs/architecture/)** - Архитектурные решения
- 🔧 **[Установка](docs/setup/)** - Подробные инструкции по установке
- 🖥️ **[Frontend](docs/frontend/)** - Документация фронтенда
- ⚙️ **[Backend](docs/backend/)** - Документация бэкенда
- 🧪 **[Тестирование](docs/testing/)** - Стратегии тестирования
- 📊 **[Отчеты](docs/reports/)** - Аудиты и отчеты

## Разработка

### Команды разработки

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Тестирование
npm run test

# Линтинг
npm run lint
```

### Соглашения

- Используйте TypeScript для типизации
- Следуйте ESLint правилам
- Пишите тесты для новой функциональности
- Обновляйте документацию при изменениях

## Тестирование

### Типы тестов
- **Unit тесты** - Jest + React Testing Library
- **Integration тесты** - API тестирование
- **E2E тесты** - Cypress
- **Performance тесты** - Lighthouse CI

### Запуск тестов
```bash
# Все тесты
npm run test

# Конкретный тип тестов
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Развертывание

### Продакшен
1. Настройте переменные окружения
2. Соберите приложение: `npm run build`
3. Запустите сервисы: `npm start`

### Docker
```bash
docker-compose up -d
```

## Вклад в проект

1. Создайте форк репозитория
2. Создайте ветку для функции: `git checkout -b feature/amazing-feature`
3. Зафиксируйте изменения: `git commit -m 'Add amazing feature'`
4. Отправьте в ветку: `git push origin feature/amazing-feature`
5. Создайте Pull Request

## Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE.md](docs/LICENSE.md).

## Поддержка

- 📧 Email: support@example.com
- 💬 Slack: #admin-dashboard
- 📋 Issues: GitHub Issues

---

**Статус проекта:** ✅ Активная разработка  
**Версия:** 1.0.0  
**Последнее обновление:** 2025-07-12