# Структура компонентов (Atomic Design)

Этот проект использует методологию Atomic Design для организации компонентов React. Все компоненты организованы в иерархическую структуру, которая упрощает разработку, тестирование и поддержку кода.

## Структура папок

```
src/
├── components/
│   ├── atoms/              # Базовые элементы UI
│   ├── molecules/          # Комбинации атомов
│   ├── organisms/          # Сложные компоненты
│   ├── templates/          # Макеты страниц
│   ├── pages/             # Специфичные для страниц компоненты
│   └── common/            # Общие компоненты (для обратной совместимости)
├── styles/
│   ├── tokens/            # Дизайн-токены
│   ├── utilities/         # Утилитарные классы
│   └── components/        # Компонентные стили
└── utils/                 # Утилитарные функции
```

## Уровни компонентов

### 🔹 Atoms (Атомы)

**Самые базовые элементы UI, которые нельзя разложить дальше**

- **Примеры**: Button, Input, Label, Icon, Avatar, Badge
- **Характеристики**:
  - Не содержат бизнес-логику
  - Максимально переиспользуемые
  - Имеют минимальные зависимости
- **Папка**: `src/components/atoms/`

### 🔹 Molecules (Молекулы)

**Комбинации атомов для создания функциональных единиц**

- **Примеры**: SearchBox, FormField, NavigationItem, CardWithActions
- **Характеристики**:
  - Комбинируют несколько атомов
  - Имеют простую функциональность
  - Переиспользуемые в разных контекстах
- **Папка**: `src/components/molecules/`

### 🔹 Organisms (Организмы)

**Комплексные компоненты из атомов и молекул**

- **Примеры**: Header, Sidebar, DataTable, UserForm, Chart
- **Характеристики**:
  - Содержат бизнес-логику
  - Могут иметь состояние
  - Специализированные для конкретных задач
- **Папка**: `src/components/organisms/`

### 🔹 Templates (Шаблоны)

**Макеты страниц, определяющие структуру контента**

- **Примеры**: DashboardLayout, AuthLayout, MainLayout
- **Характеристики**:
  - Определяют компоновку страницы
  - Не содержат конкретных данных
  - Показывают структуру и взаимосвязи
- **Папка**: `src/components/templates/`

### 🔹 Pages (Страницы)

**Специфичные для страниц компоненты**

- **Примеры**: LoginPage, DashboardPage, SettingsPage
- **Характеристики**:
  - Содержат конкретные данные
  - Комбинируют шаблоны с реальным контентом
  - Управляют состоянием страницы
- **Папка**: `src/components/pages/`

## Соглашения по именованию

### Структура файлов компонента

Каждый компонент должен находиться в отдельной папке со следующей структурой:

```
ComponentName/
├── ComponentName.tsx      # Основной компонент
├── ComponentName.test.tsx # Тесты
├── ComponentName.stories.tsx # Storybook stories
├── index.ts              # Экспорт компонента
└── README.md             # Документация (для сложных компонентов)
```

### Обязательные файлы

1. **ComponentName.tsx** - Основной файл компонента
2. **ComponentName.test.tsx** - Тесты с Jest/React Testing Library
3. **ComponentName.stories.tsx** - Stories для Storybook
4. **index.ts** - Централизованный экспорт

### Дополнительные файлы

- **README.md** - Документация для сложных компонентов
- **ComponentName.module.css** - Стили компонента (если нужны)
- **types.ts** - Типы TypeScript (если много типов)
- **utils.ts** - Утилитарные функции компонента

## Примеры кода

### Базовый компонент (Button)

```typescript
// Button.tsx
import React from 'react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  ...props
}) => {
  // Компонент здесь
};

export default Button;
```

### Файл экспорта (index.ts)

```typescript
// index.ts
export { Button as default } from './Button';
export * from './Button';
```

### Тестовый файл

```typescript
// Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Storybook stories

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};
```

## Централизованный экспорт

### Уровень компонентов

```typescript
// src/components/atoms/index.ts
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Label } from './Label';
```

### Корневой экспорт

```typescript
// src/components/index.ts
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';
export * from './pages';
```

## Импорты

### Рекомендуемые способы импорта

```typescript
// Импорт конкретного компонента
import { Button } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';

// Импорт множества компонентов
import { Button, Input, Label } from '@/components/atoms';

// Импорт с алиасом
import { Button as PrimaryButton } from '@/components/atoms';
```

## Стили и дизайн-токены

### Использование дизайн-токенов

```typescript
import { colors, spacing, typography } from '@/styles/tokens';

const buttonStyles = {
  backgroundColor: colors.brand[500],
  padding: spacing[4],
  fontSize: typography.fontSize.base,
};
```

### Утилитарные классы

```typescript
// Использование предопределенных классов
<button className="btn-primary focus-ring">
  Click me
</button>

// Комбинирование с Tailwind
<button className="btn-primary hover:scale-105 transition-transform">
  Click me
</button>
```

## Лучшие практики

### 1. Компоненты должны быть Pure Functions

```typescript
// ✅ Хорошо
const Button = ({ variant, children, ...props }) => {
  return <button className={getVariantClass(variant)} {...props}>{children}</button>;
};

// ❌ Плохо
const Button = ({ variant, children, ...props }) => {
  const [clicked, setClicked] = useState(false);
  // Состояние клика не должно быть в кнопке
};
```

### 2. Использовать TypeScript

```typescript
// ✅ Хорошо
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

// ❌ Плохо
const Button = (props: any) => {
  // Отсутствие типизации
};
```

### 3. Тестировать поведение, а не реализацию

```typescript
// ✅ Хорошо
it('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

// ❌ Плохо
it('has correct className', () => {
  render(<Button variant="primary">Click</Button>);
  expect(screen.getByRole('button')).toHaveClass('btn-primary');
});
```

### 4. Документировать сложные компоненты

Для сложных компонентов создавайте README.md с:

- Описанием назначения
- Примерами использования
- Описанием props
- Особенностями поведения

### 5. Использовать композицию

```typescript
// ✅ Хорошо
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Body>
    Content
  </Card.Body>
</Card>

// ❌ Плохо
<Card title="Title" body="Content" />
```

## Миграция существующих компонентов

При рефакторинге существующих компонентов:

1. Определите уровень компонента (atom, molecule, organism)
2. Создайте новую структуру папок
3. Добавьте тесты и stories
4. Обновите импорты в зависимых компонентах
5. Обеспечьте обратную совместимость через реэкспорты

## Инструменты разработки

- **TypeScript** - типизация
- **Jest + React Testing Library** - тестирование
- **Storybook** - документация и разработка
- **ESLint + Prettier** - линтинг и форматирование
- **Tailwind CSS** - стилизация

---

Эта структура обеспечивает:

- 📦 Модульность и переиспользуемость
- 🧪 Легкое тестирование
- 📚 Понятную документацию
- 🔄 Простую поддержку
- 🚀 Быструю разработку
