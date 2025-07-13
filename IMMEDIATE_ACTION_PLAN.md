# План немедленных действий

## 🚨 Критические задачи (выполнить в первую очередь)

### 1. Устранение дублирования компонентов (1-2 дня)

#### Задача 1.1: Удалить дублирующиеся файлы
```bash
# Команды для выполнения:
rm -rf frontend/src/components/atoms/Button/
rm -rf frontend/src/components/ui/button/
rm -rf frontend/src/components/common/Text.tsx
rm -rf frontend/src/components/ui/badge/Badge.tsx

# Оставить только:
# frontend/src/components/atoms/Button.tsx
# frontend/src/components/atoms/Typography/
# frontend/src/components/atoms/Badge.tsx
```

#### Задача 1.2: Исправить Button API
```typescript
// frontend/src/components/atoms/Button.tsx
// ИЗМЕНИТЬ:
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'; // убрать success, warning, danger
  size?: 'sm' | 'md' | 'lg'; // убрать xs, xl
  // ... остальные props
}
```

#### Задача 1.3: Создать deprecation warnings
```typescript
// frontend/src/utils/deprecation.ts
export function deprecated<T>(component: T, message: string): T {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[DEPRECATED] ${message}`);
  }
  return component;
}

// frontend/src/components/ui/index.ts
import { Button } from '../atoms/Button';
export const UIButton = deprecated(
  Button,
  'Import Button from @/components/atoms/Button instead'
);
```

### 2. Создание скрипта миграции импортов (1 день)

#### Задача 2.1: Создать автоматический скрипт
```javascript
// scripts/migrate-imports.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const MIGRATION_MAP = {
  "from '@/components/ui/button'": "from '@/components/atoms/Button'",
  "from '@/components/ui/button/Button'": "from '@/components/atoms/Button'",
  "from '@/components/common/Text'": "from '@/components/atoms/Typography'",
  "from '@/components/ui/badge'": "from '@/components/atoms/Badge'",
  "import Button from '@/components/ui/button'": "import { Button } from '@/components/atoms/Button'",
  "import Text from '@/components/common/Text'": "import { Typography } from '@/components/atoms/Typography'",
};

function migrateImports() {
  const files = glob.sync('frontend/src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/build/**']
  });

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    Object.entries(MIGRATION_MAP).forEach(([oldImport, newImport]) => {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport, 'g'), newImport);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(file, content);
      console.log(`✅ Migrated: ${file}`);
    }
  });
}

migrateImports();
```

#### Задача 2.2: Запустить миграцию
```bash
cd frontend
node ../scripts/migrate-imports.js
```

### 3. Настройка ESLint правил (0.5 дня)

#### Задача 3.1: Добавить правила в .eslintrc.js
```javascript
// frontend/.eslintrc.js
module.exports = {
  // ... существующие правила
  rules: {
    // ... существующие правила
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/ui/button/**', '**/ui/badge/**', '**/common/Text*'],
            message: 'Use atomic design components: @/components/atoms/Button, @/components/atoms/Badge, @/components/atoms/Typography'
          }
        ]
      }
    ]
  }
};
```

#### Задача 3.2: Проверить и исправить нарушения
```bash
cd frontend
npm run lint -- --fix
```

---

## 🔥 Высокий приоритет (выполнить на этой неделе)

### 4. Создание недостающих atoms (2-3 дня)

#### Задача 4.1: Создать Spinner компонент
```typescript
// frontend/src/components/atoms/Spinner/Spinner.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-brand-500',
  secondary: 'text-gray-500',
  white: 'text-white'
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  return (
    <svg
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      fill="none"
      viewBox="0 0 24 24"
      data-testid="spinner"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};
```

#### Задача 4.2: Создать Checkbox компонент
```typescript
// frontend/src/components/atoms/Checkbox/Checkbox.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  error?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  description,
  error,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          ref={(input) => {
            if (input) input.indeterminate = indeterminate;
          }}
          className={cn(
            'w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className={cn(
              'text-sm font-medium text-gray-900',
              disabled && 'opacity-50'
            )}>
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
```

#### Задача 4.3: Создать Link компонент
```typescript
// frontend/src/components/atoms/Link/Link.tsx
import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LinkProps extends Omit<RouterLinkProps, 'className'> {
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  underline?: 'always' | 'hover' | 'never';
  external?: boolean;
  className?: string;
}

const variantClasses = {
  default: 'text-brand-500 hover:text-brand-600',
  primary: 'text-brand-500 hover:text-brand-600',
  secondary: 'text-gray-600 hover:text-gray-800',
  muted: 'text-gray-500 hover:text-gray-600'
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

const underlineClasses = {
  always: 'underline',
  hover: 'hover:underline',
  never: 'no-underline'
};

export const Link: React.FC<LinkProps> = ({
  variant = 'default',
  size = 'md',
  underline = 'hover',
  external = false,
  className,
  children,
  ...props
}) => {
  const classes = cn(
    'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded',
    variantClasses[variant],
    sizeClasses[size],
    underlineClasses[underline],
    className
  );

  if (external) {
    return (
      <a
        href={props.to as string}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink className={classes} {...props}>
      {children}
    </RouterLink>
  );
};
```

### 5. Обновление существующих компонентов (2 дня)

#### Задача 5.1: Интегрировать Spinner в Button
```typescript
// frontend/src/components/atoms/Button.tsx
import { Spinner } from './Spinner';

// В компоненте Button:
{loading && <Spinner size="sm" color="white" />}
```

#### Задача 5.2: Обновить index.ts файлы
```typescript
// frontend/src/components/atoms/index.ts
export { Button } from './Button';
export { Typography, Heading, Text, Caption } from './Typography';
export { Badge } from './Badge';
export { Icon } from './Icon';
export { Input } from './Input';
export { Spinner } from './Spinner';
export { Checkbox } from './Checkbox';
export { Link } from './Link';
```

### 6. Создание базовых тестов (1-2 дня)

#### Задача 6.1: Тесты для новых компонентов
```typescript
// frontend/src/components/atoms/Spinner/Spinner.test.tsx
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with correct size classes', () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with correct color classes', () => {
    render(<Spinner color="secondary" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('text-gray-500');
  });
});
```

---

## 📋 Средний приоритет (выполнить на следующей неделе)

### 7. Создание molecules компонентов (3-4 дня)

#### Задача 7.1: FormField компонент
```typescript
// frontend/src/components/molecules/FormField/FormField.tsx
import React from 'react';
import { Input } from '@/components/atoms/Input';
import { Typography } from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
  // Пропсы для Input
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  required = false,
  className,
  children,
  ...inputProps
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Typography variant="label" className="block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Typography>
      )}
      {description && (
        <Typography variant="p" size="sm" color="secondary">
          {description}
        </Typography>
      )}
      {children || <Input {...inputProps} error={!!error} />}
      {error && (
        <Typography variant="p" size="sm" color="danger">
          {error}
        </Typography>
      )}
    </div>
  );
};
```

#### Задача 7.2: Pagination компонент
```typescript
// frontend/src/components/molecules/Pagination/Pagination.tsx
import React from 'react';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  className
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {showInfo && (
        <Typography variant="p" size="sm" color="secondary">
          Страница {currentPage} из {totalPages}
        </Typography>
      )}
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Назад
        </Button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Вперед
        </Button>
      </div>
    </div>
  );
};
```

### 8. Обновление Storybook (1 день)

#### Задача 8.1: Создать stories для новых компонентов
```typescript
// frontend/src/components/atoms/Spinner/Spinner.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Atoms/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'white'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
    color: 'primary',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner color="primary" />
      <Spinner color="secondary" />
      <div className="bg-gray-800 p-2 rounded">
        <Spinner color="white" />
      </div>
    </div>
  ),
};
```

---

## 🎯 Чек-лист выполнения

### Критические задачи ✅
- [ ] Удалить дублирующиеся компоненты
- [ ] Исправить Button API
- [ ] Создать deprecation warnings
- [ ] Создать скрипт миграции импортов
- [ ] Настроить ESLint правила

### Высокий приоритет ⚡
- [ ] Создать Spinner компонент
- [ ] Создать Checkbox компонент
- [ ] Создать Link компонент
- [ ] Интегрировать Spinner в Button
- [ ] Обновить index.ts файлы
- [ ] Создать базовые тесты

### Средний приоритет 📋
- [ ] Создать FormField компонент
- [ ] Создать Pagination компонент
- [ ] Обновить Storybook stories
- [ ] Создать документацию по миграции

---

## 🚀 Команды для быстрого выполнения

```bash
# 1. Очистка дублирующихся компонентов
rm -rf frontend/src/components/atoms/Button/
rm -rf frontend/src/components/ui/button/
rm -rf frontend/src/components/common/Text.tsx

# 2. Создание скрипта миграции
node scripts/migrate-imports.js

# 3. Проверка линтера
cd frontend && npm run lint

# 4. Запуск тестов
npm run test

# 5. Сборка проекта
npm run build

# 6. Запуск Storybook
npm run storybook
```

Этот план обеспечит быстрое устранение критических проблем и завершение миграции в кратчайшие сроки. 