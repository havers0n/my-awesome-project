# Исправление ошибок API 404

## 🔍 Проблема
Frontend получал ошибки 404 для следующих endpoints:
- `GET /api/inventory/products` 
- `GET /api/forecast/metrics`

## ✅ Исправления

### 1. Исправлена аутентификация в `warehouseApi.ts`
**Проблема**: Использовался устаревший способ получения токена из localStorage
**Решение**: Обновлен на современный Supabase API

```typescript
// Старый код:
const getAuthToken = (): string | null => {
  const authData = localStorage.getItem('supabase.auth.token');
  // ...
};

// Новый код:
const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};
```

### 2. Добавлен недостающий endpoint `/api/forecast/metrics`
**Проблема**: Endpoint не существовал в backend
**Решение**: Создан новый метод `getOverallMetrics` в `forecastController.ts`

```typescript
// Новый endpoint:
router.get('/metrics', dualAuthenticateToken, getOverallMetrics as any);
```

### 3. Метод возвращает общие метрики:
- `totalPredictions` - общее количество прогнозов
- `averageAccuracy` - средняя точность
- `avgMAPE` - средняя абсолютная процентная ошибка
- `avgMAE` - средняя абсолютная ошибка
- `accuracyTrend` - тренд точности (improving/stable/declining)
- `lastUpdated` - дата последнего обновления

## 🧪 Тестирование

Запустите тест для проверки endpoints:
```bash
python test_api_endpoints.py
```

## 🚀 Запуск системы

1. **Запустите ML микросервис**:
   ```bash
   cd mlnew
   python mock_microservice.py
   ```

2. **Запустите backend** (в новой консоли):
   ```bash
   cd backend
   npm run dev
   ```

3. **Запустите frontend** (в новой консоли):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Откройте в браузере**:
   ```
   http://localhost:5174/sales-forecast-new
   ```

## 📋 Проверка работы

1. **Проверьте аутентификацию**: Войдите в систему через frontend
2. **Проверьте загрузку данных**: Страница должна загрузиться без ошибок 404
3. **Проверьте консоль браузера**: Не должно быть ошибок API

## 🔧 Дополнительные исправления

Если проблемы остаются:

1. **Очистите кеш браузера** и обновите страницу
2. **Проверьте токен аутентификации** в Developer Tools > Application > Local Storage
3. **Убедитесь, что все сервисы запущены** на правильных портах:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:5174`
   - ML Service: `http://localhost:8000`

## 📝 Техническая информация

- **Backend endpoints**: Все требуют аутентификации через `dualAuthenticateToken`
- **Frontend**: Использует Supabase для аутентификации
- **ML Service**: Подключается через `ML_SERVICE_URL` environment variable
- **Database**: Supabase PostgreSQL для хранения данных прогнозов 