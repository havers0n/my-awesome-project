# Интеграция API продуктов в основной backend (порт 3000)

## Проблема

Пользователь требовал убрать "танцы с бубном" и интегрировать функциональность пагинации и реальных данных прямо в основной backend на порту 3000, вместо использования отдельного сервера на порту 3001.

## Выполненные изменения

### 1. Интеграция в основной backend (backend/src/app.ts)

**Добавлен import supabaseAdmin:**
```typescript
import { supabaseAdmin } from './supabaseClient';
```

**Добавлен полный эндпоинт `/api/inventory/products` с:**
- ✅ Пагинацией (параметры `page` и `limit`)
- ✅ Реальными данными из БД (таблицы `products` и `operations`)
- ✅ Правильной структурой ответа `{data: Product[], pagination: {}}`
- ✅ JOIN запросами для получения остатков из `operations.stock_on_hand`
- ✅ Обработкой ошибок и логированием

**Функциональность:**
- Пагинация: `?page=1&limit=50` (по умолчанию 50 товаров)
- Подсчёт общего количества товаров
- Реальные остатки из таблицы operations
- Метаданные пагинации (hasNext, hasPrev, totalPages)

### 2. Обновление frontend proxy (frontend/vite.config.ts)

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',  // Переключились на основной backend
    changeOrigin: true,
    secure: false,
  },
},
```

### 3. Настройка переменных среды

Настроены переменные окружения для backend:
- `SUPABASE_URL=https://uxcsziylmyogvcqyyuiw.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Исправление импортов

Заменили `require('./supabaseClient')` на ES6 import для корректной работы TypeScript.

### 5. Очистка проекта

Удален временный файл `backend/real_data_server.js`, так как его функциональность полностью интегрирована в основной backend.

## Результат

### ✅ Всё работает на одном порту 3000

```
Frontend (localhost:5174) 
→ vite proxy /api/* 
→ Main Backend (localhost:3000)
→ Supabase Database
→ Реальные продукты с пагинацией
```

### ✅ API возвращает правильные данные

```json
{
  "data": [
    {
      "product_id": 43,
      "product_name": "Батон нарезной",
      "sku": "BREAD-NRZN-400G",
      "price": 45,
      "organization_id": 1,
      "stock_by_location": [
        {
          "location_id": 1,
          "location_name": "Основной склад",
          "location_type": "warehouse",
          "stock": 15
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 34,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### ✅ Никаких дополнительных серверов

- Убран `real_data_server.js` на порту 3001
- Все данные через основной backend на порту 3000
- Простая архитектура без "танцев с бубном"

## Тестирование

### Backend
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2025-07-18T16:23:59.211Z"}

curl "http://localhost:3000/api/inventory/products"
# Возвращает реальные продукты с пагинацией
```

### Frontend
- Запуск: `npm run dev` в папке frontend
- URL: http://localhost:5174/inventory/management
- Пагинация: все 34 продукта отображаются корректно
- Данные: реальные продукты из БД, не mock-данные

## Архитектура

```
┌─────────────────┐    proxy     ┌──────────────────┐    SQL     ┌──────────────┐
│   Frontend      │─────────────→│   Main Backend   │───────────→│   Supabase   │
│ localhost:5174  │   /api/*     │  localhost:3000  │            │   Database   │
└─────────────────┘              └──────────────────┘            └──────────────┘
```

**Простая, понятная архитектура без дополнительных серверов!** 