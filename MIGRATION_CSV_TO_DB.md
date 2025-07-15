# Руководство по миграции с CSV на базу данных

## Обзор изменений

Мы создали гибридную архитектуру, которая позволяет ML модели работать как с CSV файлами (для обратной совместимости), так и получать данные из базы данных через API.

## Новая архитектура

### 1. Backend API для ML данных

**Новые эндпоинты:**
- `GET /api/ml/features/:productId` - получить признаки для товара
- `GET /api/ml/metrics/:productId` - получить метрики точности

**Сервис `MLDataService`:**
- Вычисляет статистические признаки из истории продаж в БД
- Заменяет функционал `historical_data.csv`

### 2. Обновленный ML микросервис

**Файл:** `mlnew/microservice_v2.py`

**Режимы работы:**
- **CSV режим** (по умолчанию) - работает как раньше
- **API режим** - получает данные из БД через backend API

**Переменные окружения:**
```bash
# Включить получение данных из БД
USE_API_FOR_FEATURES=true

# URL backend API
BACKEND_API_URL=http://localhost:3000/api

# JWT токен для авторизации (опционально)
API_TOKEN=your_jwt_token_here
```

## Пошаговая миграция

### Шаг 1: Установка зависимостей

```bash
# Backend
cd backend
npm install date-fns

# ML сервис
cd mlnew
pip install requests
```

### Шаг 2: Запуск в режиме CSV (тестирование)

```bash
# Backend
cd backend
npm run dev

# ML сервис (режим CSV)
cd mlnew
uvicorn microservice_v2:app --reload --port 8000
```

### Шаг 3: Тестирование API эндпоинтов

```bash
# Получить признаки для товара
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/ml/features/PRODUCT_ID?targetDate=2025-01-15

# Получить метрики
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/ml/metrics/PRODUCT_ID
```

### Шаг 4: Запуск в режиме API

```bash
# ML сервис с данными из БД
cd mlnew
export USE_API_FOR_FEATURES=true
export BACKEND_API_URL=http://localhost:3000/api
export API_TOKEN=your_jwt_token
uvicorn microservice_v2:app --reload --port 8000
```

### Шаг 5: Обновление backend для передачи ProductId

В `forecastController.ts` добавьте `ProductId` в события:

```javascript
const events = operations.map((op: any) => ({
  Type: op.type,
  Период: op.date,
  Номенклатура: op.productName, // Название товара
  ProductId: op.product_id,      // ID товара для API
  Код: op.productCode,
  Количество: op.quantity,
  Цена: op.price
}));
```

## Преимущества новой архитектуры

1. **Актуальные данные** - признаки вычисляются из свежих данных в БД
2. **Масштабируемость** - нет ограничений размера CSV файлов
3. **Новые товары** - автоматически работает с новыми товарами
4. **Обратная совместимость** - можно вернуться к CSV в любой момент

## Дальнейшие улучшения

### 1. Кеширование признаков

Добавить Redis для кеширования вычисленных признаков:

```typescript
// В MLDataService
const cacheKey = `features:${productId}:${targetDate}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// После вычисления
await redis.setex(cacheKey, 3600, JSON.stringify(features));
```

### 2. Batch API

Для оптимизации можно добавить batch эндпоинт:

```typescript
// POST /api/ml/features/batch
router.post('/features/batch', async (req, res) => {
  const { products } = req.body; // [{productId, targetDate}, ...]
  const features = await Promise.all(
    products.map(p => MLDataService.getProductFeatures(p.productId, p.targetDate, orgId))
  );
  res.json(features);
});
```

### 3. Предрасчет признаков

Создать фоновую задачу для предрасчета признаков:

```typescript
// Cron job каждую ночь
async function precomputeFeatures() {
  const products = await getActiveProducts();
  for (const product of products) {
    const features = await MLDataService.getProductFeatures(
      product.id, 
      new Date(), 
      product.organization_id
    );
    await saveToFeaturesTable(product.id, features);
  }
}
```

### 4. Мониторинг качества

Сохранять предсказания и актуальные продажи для оценки точности:

```sql
CREATE TABLE ml_predictions (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  prediction_date DATE,
  predicted_quantity INTEGER,
  actual_quantity INTEGER,
  mape FLOAT,
  created_at TIMESTAMP
);
```

## Troubleshooting

### Проблема: ML сервис не может подключиться к backend

**Решение:**
1. Проверьте, что backend запущен
2. Проверьте правильность `BACKEND_API_URL`
3. Проверьте валидность JWT токена

### Проблема: Нет данных для новых товаров

**Решение:**
1. Убедитесь, что есть операции продаж в БД
2. Проверьте, что операции имеют тип 'sale'
3. ML модель вернет дефолтные признаки для товаров без истории

### Проблема: Медленные запросы

**Решение:**
1. Добавьте индексы в БД:
   ```sql
   CREATE INDEX idx_operations_product_date 
   ON operations(product_id, operation_date);
   ```
2. Используйте кеширование
3. Рассмотрите batch API 