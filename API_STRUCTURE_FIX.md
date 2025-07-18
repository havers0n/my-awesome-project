# Решение проблемы "API вернул некорректные данные"

## Проблема
На странице инвентаря отображалось предупреждение:
```
Предупреждение: API вернул некорректные данные. Показаны демонстрационные данные.
```

## Корневая причина
Frontend обращался к основному backend (порт 3000), который возвращал данные в старом формате (массив напрямую), но `fetchAllProducts()` ожидал новую структуру `{data: Product[], pagination: any}`.

### Проблемная цепочка:
1. **Frontend** (порт 5174) → прокси к порту 3000
2. **Основной backend** (порт 3000) → возвращает `Product[]`
3. **fetchAllProducts()** → пытается получить `response.data` из массива = `undefined`
4. **Компонент** → получает `undefined`, показывает предупреждение и fallback данные

## Решение
Переключили frontend на использование `real_data_server.js`, который корректно реализует новую структуру API.

### Изменения:

1. **Frontend прокси** (`vite.config.ts`):
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3001', // real_data_server
     }
   }
   ```

2. **Backend сервер** (`real_data_server.js`):
   ```javascript
   const PORT = 3001; // порт для frontend прокси
   ```

3. **Структура API ответа**:
   ```json
   {
     "data": [
       {
         "product_id": 43,
         "product_name": "Батон нарезной",
         "sku": "BREAD-NRZN-400G",
         "price": 45,
         "organization_id": 1,
         "stock_by_location": [...]
       }
     ],
     "pagination": {
       "page": 1,
       "limit": 50,
       "total": 34,
       "totalPages": 1
     }
   }
   ```

## Результат

### ✅ Предупреждение исчезло:
- Больше нет сообщения "API вернул некорректные данные"
- Frontend корректно обрабатывает структуру `{data: Product[]}`

### ✅ Реальные данные отображаются:
- **34 продукта** из базы данных
- **Реальные названия**: "Батон нарезной", "Молоко", "Хлеб"
- **Реальные SKU**: "BREAD-NRZN-400G", "MILK-3.2-1L"
- **Остатки из таблицы operations**

### ✅ Пагинация работает:
- API возвращает метаданные пагинации
- Поддерживается `?page=1&limit=50`

## Архитектура
```
Frontend (5174) 
    ↓ прокси /api/*
real_data_server.js (3001) 
    ↓ запросы к БД
Supabase Database
    ↓ реальные данные
products, locations, operations
```

## Запуск
```bash
# Backend
cd backend
node real_data_server.js

# Frontend
cd frontend  
npm run dev
```

---
*Дата: 18.07.2025*
*Статус: ✅ Исправлено* 