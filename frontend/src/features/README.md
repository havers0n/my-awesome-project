# Features Layer Structure

Этот каталог содержит бизнес-фичи приложения, организованные по принципу Feature-Sliced Design.

## Структура

```
features/
├── auth/                    # Аутентификация и авторизация
│   ├── sign-in/            # Вход в систему
│   │   ├── ui/             # Компоненты UI
│   │   │   ├── SignInForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── model/          # Логика и состояние
│   │   │   └── authModel.ts
│   │   ├── api/            # API вызовы
│   │   │   └── authApi.ts
│   │   └── lib/            # Утилиты
│   │       └── authUtils.ts
│   ├── sign-up/            # Регистрация
│   ├── sign-out/           # Выход из системы
│   ├── reset-password/     # Сброс пароля
│   └── index.tsx           # Экспорты фичи
├── inventory/              # Управление инвентарем
│   ├── shelf-availability/ # Доступность на полках
│   │   ├── ui/
│   │   │   └── ShelfAvailabilityWidget.tsx
│   │   ├── model/
│   │   │   └── inventoryModel.ts
│   │   ├── api/
│   │   │   └── inventoryApi.ts
│   │   └── lib/
│   ├── manage-stock/       # Управление запасами
│   └── index.tsx
├── sales-forecast/         # Прогнозирование продаж
│   ├── ui/
│   │   └── ForecastResults.tsx
│   ├── model/
│   ├── api/
│   │   └── forecastApi.ts
│   └── lib/
├── admin/                  # Административные функции
│   ├── ui/
│   │   └── AdminPageWrapper.tsx
│   ├── model/
│   ├── api/
│   └── lib/
├── monitoring/             # Мониторинг системы
├── quality-control/        # Контроль качества
└── index.tsx               # Главный экспорт всех фич
```

## Принципы организации

### 1. Структура каждой фичи

Каждая фича содержит следующие слои:

- **`ui/`** - React компоненты и UI логика
- **`model/`** - Бизнес-логика, типы, валидация
- **`api/`** - HTTP запросы и API интеграция
- **`lib/`** - Утилиты и вспомогательные функции

### 2. Импорты и экспорты

```typescript
// Импорт из фичи
import { SignInForm, ProtectedRoute } from '@/features/auth';

// Импорт из конкретного слоя
import { validateEmail } from '@/features/auth/sign-in/lib/authUtils';
```

### 3. Зависимости

- Фичи могут использовать **shared** слой
- Фичи могут использовать **entities** слой
- Фичи **не должны** зависеть друг от друга напрямую
- Для взаимодействия между фичами используйте **app** слой

## Мигрированные компоненты

### Auth
- ✅ `SignInForm` - `components/auth/SignInForm.tsx` → `features/auth/sign-in/ui/SignInForm.tsx`
- ✅ `SignUpForm` - `components/auth/SignUpForm.tsx` → `features/auth/sign-up/ui/SignUpForm.tsx`
- ✅ `ProtectedRoute` - `components/auth/ProtectedRoute.tsx` → `features/auth/sign-in/ui/ProtectedRoute.tsx`

### Inventory
- ✅ `ShelfAvailabilityWidget` - `components/inventory/ShelfAvailabilityWidget.tsx` → `features/inventory/shelf-availability/ui/ShelfAvailabilityWidget.tsx`

### Sales Forecast
- ✅ `ForecastResults` - `components/forecast/ForecastResults.tsx` → `features/sales-forecast/ui/ForecastResults.tsx`

### Admin
- ✅ `AdminPageWrapper` - `components/admin/AdminPageWrapper.tsx` → `features/admin/ui/AdminPageWrapper.tsx`

## TODO

### Планируемые к миграции
- [ ] Компоненты мониторинга
- [ ] Компоненты контроля качества
- [ ] Управление запасами (manage-stock)
- [ ] Дополнительные админ компоненты

### Рефакторинг
- [ ] Обновить импорты в существующих компонентах
- [ ] Создать хуки для фич
- [ ] Добавить тесты для каждой фичи
- [ ] Создать storybook истории

## Использование

```typescript
// Пример использования SignInForm
import { SignInForm } from '@/features/auth';

const LoginPage = () => {
  return (
    <div>
      <SignInForm />
    </div>
  );
};

// Пример использования ProtectedRoute
import { ProtectedRoute } from '@/features/auth';

const App = () => {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
};
```

## Правила разработки

1. **Один компонент = одна фича** - каждый компонент должен решать одну бизнес-задачу
2. **Инкапсуляция** - все что касается фичи, должно быть внутри ее папки
3. **Публичный API** - экспортируйте только то, что нужно другим частям приложения
4. **Тестирование** - каждая фича должна иметь свои тесты
5. **Документация** - документируйте сложную бизнес-логику
