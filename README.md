# Tailwind Admin Dashboard — Восстановленная и Реструктурированная Версия

Это репозиторий корпоративной админ-панели, которая прошла полный архитектурный рефакторинг. Изначально проект представлял собой монолит, который был успешно разделен на независимые Frontend и Backend сервисы, стабилизирован и приведен к современным стандартам разработки.

---

## 🚀 Архитектурная Карта Проекта

Для быстрого понимания текущей структуры и ключевых взаимосвязей была создана визуальная карта проекта.

[![Архитектурная карта проекта](docs/architecture-map.png)](docs/architecture.html)
_Кликните на изображение, чтобы открыть интерактивную HTML-версию_

---

## 🛠️ Технологический Стек

**Frontend:**
- **Фреймворк:** React
- **Сборщик:** Vite
- **Язык:** TypeScript
- **Стилизация:** Tailwind CSS v4 (c @theme)
- **Запросы к API:** Axios
- **Роутинг:** React Router DOM

**Backend:**
- **Среда выполнения:** Node.js
- **Фреймворк:** Express
- **Язык:** TypeScript
- **Аутентификация и БД:** Supabase (PostgreSQL)

---

## 🏁 Локальный Запуск (Setup)

Проект состоит из двух независимых сервисов. Для полного запуска выполните шаги для каждого из них в отдельных терминалах.

### 1. Запуск Backend

1. Перейдите в директорию бэкенда:
    ```bash
    cd backend
    ```
2. Создайте `.env` файл по примеру:
    ```dotenv
    PORT=3000
    DB_USER=postgres
    DB_HOST=db.xxxxxxxx.supabase.co
    DB_NAME=postgres
    DB_PASSWORD=your_db_password
    DB_PORT=5432
    JWT_SECRET=your-super-secret-jwt-key
    SUPABASE_URL=https://xxxxxxxx.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```
3. Установите зависимости:
    ```bash
    npm install
    ```
4. Запустите сервер:
    ```bash
    npm run dev
    ```
    Сервер будет доступен по адресу http://localhost:3000

### 2. Запуск Frontend

1. Перейдите в директорию фронтенда:
    ```bash
    cd frontend
    ```
2. Создайте `.env` файл по примеру:
    ```dotenv
    VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
3. Установите зависимости:
    ```bash
    npm install
    ```
4. Запустите сервер разработки:
    ```bash
    npm run dev
    ```
    Приложение будет доступно по адресу http://localhost:5173

---

## 🏛️ Структура Проекта

- **/frontend:** Клиентская часть (React-приложение)
- **/backend:** Серверная часть (Node.js/Express API)
- **/database:** Схемы и скрипты для PostgreSQL
- **/docs:** Документация и Cookbook (см. ниже)

---

## 📚 Cookbook (Практические рецепты)

- [Добавить новую страницу](docs/add-new-page.md)
- [Добавить новую иконку](docs/add-new-icon.md)
- [API endpoints](docs/api-endpoints.md)
- [Схема базы данных](docs/database-schema.md)
- [FAQ / Troubleshooting](docs/faq.md)

---

## 🖼️ Скриншоты

Ниже представлены ключевые экраны приложения:

![Дашборд](docs/screenshots/dashboard.png)
![Профиль пользователя](docs/screenshots/profile.png)

---

## 🧭 Архитектурный Аудит (Кратко)

### Точка входа и загрузка
- Старт: `index.html` с `<div id="root">`
- Инициализация: `src/main.tsx` монтирует React-приложение в #root
- Глобальные провайдеры: `<BrowserRouter>`, `<AuthProvider>`

### Система роутинга и защита маршрутов
- Центр роутинга: `src/App.tsx`
- Защита: `src/components/auth/ProtectedRoute.tsx` использует AuthContext для проверки авторизации

### Аутентификация и API
- Управление сессией: `src/context/AuthContext.tsx` (Supabase)
- Взаимодействие с API: `src/services/api.ts` (axios + interceptor для JWT)

### Tailwind CSS и стилизация
- Конфиг: `postcss.config.js`, `src/index.css` (директива @theme)

### Работа с иконками
- SVG: `public/images/icons/`
- Реестр: `src/helpers/icons.ts`

### Потоки данных
- useEffect для запросов к API, useState для хранения данных
- Пример: `src/components/ecommerce/MonthlySalesChart.tsx` (график продаж)

---

## 📂 Полезные ссылки
- [Cookbook: добавление страницы](docs/add-new-page.md)
- [Cookbook: добавление иконки](docs/add-new-icon.md)
- [Cookbook: API endpoints](docs/api-endpoints.md)

---

## 📄 Лицензия

MIT
