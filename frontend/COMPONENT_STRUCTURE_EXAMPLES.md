# Примеры использования новой структуры компонентов

## Создание нового компонента

### 1. Создание атома (Button)

```bash
# Создание папки для компонента
mkdir -p src/components/atoms/Button

# Создание файлов
touch src/components/atoms/Button/Button.tsx
touch src/components/atoms/Button/Button.test.tsx
touch src/components/atoms/Button/Button.stories.tsx
touch src/components/atoms/Button/index.ts
```

### 2. Пример структуры файлов

```
src/components/atoms/Button/
├── Button.tsx            # Основной компонент ✅
├── Button.test.tsx       # Тесты ✅
├── Button.stories.tsx    # Storybook stories ✅
├── index.ts              # Экспорт ✅
└── README.md             # Документация (для сложных компонентов)
```

## Импорты и использование

### Импорт компонентов

```typescript
// Импорт из центрального экспорта
import { Button } from '@/components/atoms';
import { Button, Input, Label } from '@/components/atoms';

// Прямой импорт
import { Button } from '@/components/atoms/Button';

// Импорт с алиасом
import { Button as PrimaryButton } from '@/components/atoms';
```

### Использование дизайн-токенов

```typescript
import { colors, spacing, typography } from '@/styles/tokens';

const MyComponent = () => (
  <div style={{
    backgroundColor: colors.brand[500],
    padding: spacing[4],
    fontSize: typography.fontSize.base,
  }}>
    Content
  </div>
);
```

### Использование утилитарных классов

```typescript
import { cn } from '@/utils';

const MyComponent = ({ className, variant, ...props }) => (
  <button
    className={cn(
      'base-button-classes',
      {
        'variant-primary': variant === 'primary',
        'variant-secondary': variant === 'secondary',
      },
      className
    )}
    {...props}
  />
);
```

## Создание молекулы (SearchBox)

```typescript
// src/components/molecules/SearchBox/SearchBox.tsx
import React from 'react';
import { Button, Input, Icon } from '@/components/atoms';
import { cn } from '@/utils';

interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = 'Поиск...',
  onSearch,
  className,
}) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="md">
        <Icon name="search" size="sm" />
        Поиск
      </Button>
    </form>
  );
};

export default SearchBox;
```

## Создание организма (DataTable)

```typescript
// src/components/organisms/DataTable/DataTable.tsx
import React from 'react';
import { Button, Icon } from '@/components/atoms';
import { SearchBox } from '@/components/molecules';
import { cn } from '@/utils';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSearch?: (query: string) => void;
  className?: string;
}

export const DataTable = <T,>({
  data,
  columns,
  onSearch,
  className,
}: DataTableProps<T>) => {
  const [sortBy, setSortBy] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  return (
    <div className={cn('space-y-4', className)}>
      {onSearch && (
        <div className="flex justify-between items-center">
          <SearchBox onSearch={onSearch} />
          <Button variant="outline" size="sm">
            <Icon name="filter" size="sm" />
            Фильтры
          </Button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="table-header-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortBy === column.key && (
                      <Icon
                        name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                        size="sm"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {data.map((item, index) => (
              <tr key={index} className="table-row">
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
```

## Создание шаблона (DashboardLayout)

```typescript
// src/components/templates/DashboardLayout/DashboardLayout.tsx
import React from 'react';
import { cn } from '@/utils';

interface DashboardLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  header,
  sidebar,
  children,
  className,
}) => {
  return (
    <div className={cn('h-screen-safe flex flex-col', className)}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        {header}
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {sidebar}
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
```

## Создание страницы (DashboardPage)

```typescript
// src/components/pages/DashboardPage/DashboardPage.tsx
import React from 'react';
import { DashboardLayout } from '@/components/templates';
import { Header, Sidebar } from '@/components/organisms';
import { Card, Button } from '@/components/atoms';
import { MetricCard, ChartWidget } from '@/components/molecules';

export const DashboardPage: React.FC = () => {
  const metrics = [
    { label: 'Всего пользователей', value: '1,234', change: '+12%' },
    { label: 'Продажи', value: '₽45,678', change: '+8%' },
    { label: 'Заказы', value: '89', change: '-3%' },
  ];

  return (
    <DashboardLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Дашборд
          </h1>
          <Button variant="primary">
            Создать отчет
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Продажи по месяцам</Card.Title>
            </Card.Header>
            <Card.Body>
              <ChartWidget type="line" data={[]} />
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Топ продукты</Card.Title>
            </Card.Header>
            <Card.Body>
              <ChartWidget type="bar" data={[]} />
            </Card.Body>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
```

## Тестирование компонентов

### Тест атома

```typescript
// src/components/atoms/Button/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant classes', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-500');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });
});
```

### Тест молекулы

```typescript
// src/components/molecules/SearchBox/SearchBox.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('calls onSearch when form is submitted', () => {
    const handleSearch = jest.fn();
    render(<SearchBox onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText('Поиск...');
    const button = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.click(button);
    
    expect(handleSearch).toHaveBeenCalledWith('test query');
  });

  it('prevents form submission when input is empty', () => {
    const handleSearch = jest.fn();
    render(<SearchBox onSearch={handleSearch} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleSearch).toHaveBeenCalledWith('');
  });
});
```

## Storybook Stories

### Story для атома

```typescript
// src/components/atoms/Button/Button.stories.tsx
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
    children: 'Primary Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-x-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};
```

### Story для молекулы

```typescript
// src/components/molecules/SearchBox/SearchBox.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SearchBox } from './SearchBox';

const meta: Meta<typeof SearchBox> = {
  title: 'Molecules/SearchBox',
  component: SearchBox,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Поиск продуктов...',
    onSearch: (query) => console.log('Search:', query),
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Найти пользователя...',
    onSearch: (query) => console.log('User search:', query),
  },
};
```

## Миграция существующих компонентов

### Пример миграции

```typescript
// До миграции
// src/components/common/CustomButton.tsx
export const CustomButton = ({ variant, children, ...props }) => {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
};

// После миграции
// src/components/atoms/Button/Button.tsx
export const Button = ({ variant = 'primary', children, ...props }) => {
  return (
    <button
      className={cn(
        'base-button-classes',
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
        }
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Обратная совместимость
// src/components/common/CustomButton.tsx
export { Button as CustomButton } from '../atoms/Button';
```

## Лучшие практики

1. **Начинайте с атомов** - создавайте базовые компоненты первыми
2. **Тестируйте поведение** - тестируйте функциональность, а не реализацию
3. **Используйте TypeScript** - обеспечивайте типобезопасность
4. **Документируйте компоненты** - создавайте stories и README
5. **Следуйте соглашениям** - используйте единый стиль именования и структуры

Эта структура обеспечивает масштабируемость, поддерживаемость и переиспользуемость компонентов в проекте.
