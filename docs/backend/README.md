# Backend Documentation

## Обзор

Данный раздел содержит всю документацию, связанную с backend частью приложения Tailwind Admin Dashboard.

## Структура

### 📁 **api/** - API документация
- Описание API эндпоинтов
- ETL процессы
- Интеграции

### 📁 **database/** - База данных
- Схемы базы данных
- Миграции
- Индексы и оптимизация

### 📁 **security/** - Безопасность
- Аутентификация и авторизация
- Политики безопасности
- Руководства по безопасности

### 📁 **testing/** - Тестирование
- Стратегии тестирования backend
- Настройка тестовой среды
- Примеры тестов

## Технологии

- **Node.js** - Основная платформа
- **Express.js** - Web фреймворк
- **TypeScript** - Типизация
- **PostgreSQL** - Основная база данных
- **Supabase** - Backend-as-a-Service
- **Jest** - Тестирование
- **Winston** - Логирование

## Архитектура

### Структура проекта
```
backend/
├── src/
│   ├── controllers/     # Контроллеры
│   ├── middleware/      # Middleware
│   ├── routes/          # Маршруты
│   ├── services/        # Бизнес-логика
│   ├── utils/           # Утилиты
│   ├── schemas/         # Схемы валидации
│   └── __tests__/       # Тесты
├── docs/                # Документация
└── scripts/             # Скрипты
```

### Слои архитектуры
1. **Routes** - Определение маршрутов
2. **Controllers** - Обработка HTTP запросов
3. **Services** - Бизнес-логика
4. **Database** - Работа с данными

## Быстрые ссылки

### API
- [ETL процессы](api/ETL_PROCESS_FLOW.md)

### База данных
- [Схема базы данных](database/database-schema.md)

### Безопасность
- [Быстрое руководство по безопасности](security/QUICK_SECURITY_GUIDE.md)
- [README по безопасности](security/README.md)

### Тестирование
- [Документация по тестированию](testing/TESTING.md)
- [Лучшие практики](testing/best-practices.md)
- [Примеры тестов](testing/test-examples.md)

## Конфигурация

### Переменные окружения
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-jwt-secret
```

### Настройка базы данных
1. Создайте базу данных PostgreSQL
2. Запустите миграции
3. Заполните тестовыми данными (опционально)

## Разработка

### Запуск проекта
```bash
cd backend
npm install
npm run dev
```

### Сборка
```bash
npm run build
```

### Тестирование
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Линтинг
```bash
npm run lint
npm run lint:fix
```

## API Эндпоинты

### Аутентификация
- `POST /auth/login` - Вход в систему
- `POST /auth/logout` - Выход из системы
- `GET /auth/me` - Получение информации о пользователе

### Администрирование
- `POST /admin/users` - Создание пользователя
- `GET /admin/users` - Получение списка пользователей
- `PUT /admin/users/:id` - Обновление пользователя
- `DELETE /admin/users/:id` - Удаление пользователя

### Прогнозирование
- `POST /forecast` - Создание прогноза
- `GET /forecast/history` - История прогнозов
- `GET /forecast/data` - Данные для прогноза

## Мониторинг и логирование

### Логи
- Используется Winston для структурированного логирования
- Логи сохраняются в файлы и отправляются в консоль
- Различные уровни логирования: error, warn, info, debug

### Мониторинг
- Health checks для проверки состояния сервиса
- Метрики производительности
- Мониторинг базы данных

## Безопасность

### Аутентификация
- JWT токены для аутентификации
- Refresh токены для обновления сессий
- Интеграция с Supabase Auth

### Авторизация
- Role-based access control (RBAC)
- Middleware для проверки прав доступа
- Защита чувствительных эндпоинтов

### Валидация
- Валидация входных данных
- Санитизация пользовательского ввода
- Защита от SQL инъекций

## Развертывание

### Требования
- Node.js 18+
- PostgreSQL 13+
- Redis (для кеширования)

### Docker
```bash
docker-compose up -d
```

### Переменные окружения
Убедитесь, что все необходимые переменные окружения настроены для продакшена.

---

*Последнее обновление: 2025-01-16* 