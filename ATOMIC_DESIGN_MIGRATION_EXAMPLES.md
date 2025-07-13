# 📖 Примеры кода для миграции на Atomic Design

Этот документ содержит конкретные примеры, которые помогут вам в процессе исправления и завершения миграции.

---

## Пример 1: Устранение дублирования компонентов

**Проблема**: Существование `atoms/Button.tsx` и `atoms/Button/` одновременно.
**Решение**: Объединить все в одну папку `atoms/Button/`.

### 👎 До (неправильно)

```
frontend/src/components/atoms/
├── Button.tsx          # <-- Дубликат 1
└── Button/             # <-- Дубликат 2
    ├── index.tsx
    └── Button.stories.tsx
```

### 👍 После (правильно)

1.  **Объедините код** в `frontend/src/components/atoms/Button/index.tsx`.
2.  **Удалите** `frontend/src/components/atoms/Button.tsx`.
3.  **Обновите импорты** по всему проекту.

**Структура папки:**
```
frontend/src/components/atoms/
└── Button/
    ├── index.tsx              # <-- Весь код компонента здесь
    ├── Button.stories.tsx     # <-- Истории для Storybook
    └── Button.test.tsx        # <-- Тесты для компонента
```

**Пример импорта в другом компоненте:**
```tsx
// Правильный импорт из директории
import { Button } from '@/components/atoms/Button';

// НЕПРАВИЛЬНО: import { Button } from '@/components/atoms/Button/index';
// НЕПРАВИЛЬНО: import { Button } from '@/components/atoms/Button.tsx';
```

---

## Пример 2: Правильное размещение компонентов по уровням

**Проблема**: `FormField` находится в `atoms`, хотя является молекулой.
**Решение**: Переместить компонент в `molecules` и убедиться, что он использует атомы.

### 👎 До (неправильно)

-   `FormField` находится в `frontend/src/components/atoms/FormField.tsx`.

### 👍 После (правильно)

1.  **Создайте новую папку** `frontend/src/components/molecules/FormField/`.
2.  **Переместите логику** в `index.tsx` внутри этой папки.
3.  Убедитесь, что `FormField` **импортирует атомы `Input` и `Label`**.

**Структура папки:**
```
frontend/src/components/
├── atoms/
│   ├── Input/
│   │   └── index.tsx
│   └── Label/
│       └── index.tsx
└── molecules/
    └── FormField/
        └── index.tsx
```

**Пример кода для `molecules/FormField/index.tsx`:**
```tsx
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label'; // Предполагая, что атом Label существует

interface FormFieldProps {
  label: string;
  // ...другие props
}

export const FormField = ({ label, ...props }: FormFieldProps) => {
  return (
    <div className="form-field">
      <Label>{label}</Label>
      <Input {...props} />
      {/* Можно добавить и атом для отображения ошибки */}
    </div>
  );
};
```

---

## Пример 3: Рефакторинг страницы для использования новых компонентов

**Проблема**: Страницы используют старые компоненты из `common/`, `dashboard/` и т.д.
**Решение**: Заменить их на новые, унифицированные атомарные компоненты.

### 👎 До (гипотетический пример)

```tsx
// src/pages/Auth/SignIn.tsx

import { OldButton } from '@/components/common/OldButton'; // <-- Старый компонент
import { CustomInput } from '@/pages/Auth/CustomInput'; // <-- Локальный компонент

const SignIn = () => {
  return (
    <div>
      <h1>Sign In</h1>
      <CustomInput placeholder="Email" />
      <OldButton>Log In</OldButton>
    </div>
  );
};
```

### 👍 После (правильно)

```tsx
// src/pages/Auth/SignIn.tsx

import { Button } from '@/components/atoms/Button';         // <-- Новый атом
import { FormField } from '@/components/molecules/FormField'; // <-- Новая молекула

const SignIn = () => {
  return (
    <div>
      <h1>Sign In</h1>
      <FormField label="Email" type="email" placeholder="Email" />
      <FormField label="Password" type="password" placeholder="Password" />
      <Button variant="primary">Log In</Button>
    </div>
  );
};
```

Этот подход делает код страницы чище, более предсказуемым и консистентным с остальным приложением. 