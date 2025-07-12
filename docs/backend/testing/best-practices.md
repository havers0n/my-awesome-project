# Best Practices для написания тестов

## Общие принципы

### 1. Чистые и читаемые тесты
- Используйте понятные имена для тестов, описывающие что тестируется
- Следуйте паттерну AAA (Arrange, Act, Assert)
- Избегайте сложной логики в тестах

### 2. Изоляция тестов
- Один тест должен проверять одну функциональность
- Тесты должны быть независимы друг от друга
- Используйте `beforeEach` и `afterEach` для подготовки и очистки

### 3. Использование моков
```typescript
// Хорошо
jest.mock('@supabase/supabase-js');

// Плохо - реальное подключение к БД в юнит-тестах
const supabase = createClient(url, key);
```

### 4. Тестовые данные
```typescript
// Используйте фабрики для создания тестовых данных
const createTestUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  ...overrides
});
```

### 5. Асинхронные тесты
```typescript
// Всегда используйте async/await для асинхронных операций
test('should fetch user data', async () => {
  const userData = await fetchUser('123');
  expect(userData).toBeDefined();
});
```

### 6. Покрытие кода
- Стремитесь к покрытию 80%+
- Фокусируйтесь на критичной бизнес-логике
- Не гонитесь за 100% покрытием любой ценой

### 7. Группировка тестов
```typescript
describe('UserController', () => {
  describe('createUser', () => {
    test('should create user with valid data', () => {
      // ...
    });

    test('should throw error with invalid email', () => {
      // ...
    });
  });
});
```

### 8. Обработка ошибок
```typescript
// Проверяйте не только успешные сценарии
test('should handle database error', async () => {
  mockDatabase.query.mockRejectedValue(new Error('DB Error'));
  
  await expect(createUser(userData)).rejects.toThrow('DB Error');
});
```

### 9. Snapshot тестирование
- Используйте для проверки структуры данных
- Регулярно обновляйте snapshots
- Добавляйте комментарии к сложным snapshot'ам

### 10. Performance тестирование
```typescript
test('should complete within 100ms', async () => {
  const start = Date.now();
  await processData(largeDataset);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(100);
});
```
