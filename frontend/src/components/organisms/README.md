# Organisms

Organisms are complex UI components that combine molecules and atoms to create substantial page sections. They represent distinct sections of an interface and provide complete functionality for specific use cases.

## Available Organisms

### 1. MetricsGrid

**Purpose**: Displays multiple metric cards in a responsive grid layout.

**Key Features**:

- Responsive grid system (1-6 columns)
- Customizable sizing and spacing
- Support for different card variants
- Empty state handling

**Usage**:

```tsx
import { MetricsGrid } from '@/components/organisms';

const metrics = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$45,231.89',
    change: 20.1,
    changeType: 'increase',
    iconName: 'dollar',
    badge: { text: 'This month', color: 'success' },
  },
  // ... more metrics
];

<MetricsGrid metrics={metrics} columns={4} size="md" variant="elevated" />;
```

**Props**:

- `metrics`: Array of metric data objects
- `columns`: Number of columns (1-6)
- `gap`: Spacing between items ('sm' | 'md' | 'lg')
- `size`: Size of metric cards ('sm' | 'md' | 'lg')
- `variant`: Card variant ('default' | 'elevated' | 'outlined' | 'filled')

### 2. ChartContainer

**Purpose**: Combines chart header with chart content and optional actions.

**Key Features**:

- Header with title and subtitle
- Dropdown for filtering options
- Custom actions support
- Empty state with placeholder
- Responsive design

**Usage**:

```tsx
import { ChartContainer } from '@/components/organisms';

<ChartContainer
  title="Sales Performance"
  subtitle="Revenue trends over time"
  chart={<MyChart />}
  dropdownOptions={[
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
  ]}
  selectedOption={selectedPeriod}
  onOptionChange={setSelectedPeriod}
  variant="default"
/>;
```

**Props**:

- `title`: Chart title
- `subtitle`: Optional subtitle
- `chart`: React node containing the chart
- `dropdownOptions`: Array of filter options
- `selectedOption`: Currently selected option
- `onOptionChange`: Callback for option changes
- `actions`: Custom action buttons

### 3. CountryList

**Purpose**: Displays countries with flags, values, and progress indicators.

**Key Features**:

- Country flags with automatic name resolution
- Progress indicators with customizable colors
- Horizontal and vertical layouts
- Pagination support
- Empty state handling

**Usage**:

```tsx
import { CountryList } from '@/components/organisms';

const countries = [
  {
    id: '1',
    countryCode: 'US',
    countryName: 'United States',
    value: 12500,
    max: 15000,
    progressColor: 'blue',
  },
  // ... more countries
];

<CountryList
  countries={countries}
  title="Top Countries"
  subtitle="Sales by country"
  layout="horizontal"
  variant="default"
/>;
```

**Props**:

- `countries`: Array of country data objects
- `title`: Optional title
- `subtitle`: Optional subtitle
- `showProgress`: Whether to show progress bars
- `layout`: Layout style ('horizontal' | 'vertical')
- `maxItems`: Maximum number of items to display

### 4. ProductTable

**Purpose**: Displays products with detailed information and actions.

**Key Features**:

- Product cards with images, ratings, and badges
- Horizontal and vertical layouts
- Pagination support
- Click handlers for product interactions
- Flexible header with actions
- Empty state handling

**Usage**:

```tsx
import { ProductTable } from '@/components/organisms';

const products = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones',
    price: 299.99,
    originalPrice: 399.99,
    status: 'in-stock',
    rating: 4.8,
    reviews: 1234,
    badge: { text: 'Best Seller', color: 'success' },
  },
  // ... more products
];

<ProductTable
  products={products}
  title="Product Catalog"
  subtitle="Manage your inventory"
  layout="horizontal"
  onProductClick={handleProductClick}
  actions={<AddProductButton />}
/>;
```

**Props**:

- `products`: Array of product data objects
- `title`: Optional title
- `subtitle`: Optional subtitle
- `layout`: Layout style ('horizontal' | 'vertical')
- `onProductClick`: Callback for product clicks
- `actions`: Custom action buttons
- `showPagination`: Enable pagination
- `maxItems`: Maximum items per page

### 5. TargetDisplay

**Purpose**: Combines radial chart with statistics to show target progress.

**Key Features**:

- Radial progress chart with customizable colors
- Statistics section with multiple metrics
- Flexible layout options
- Target vs current value display
- Progress percentage calculation

**Usage**:

```tsx
import { TargetDisplay } from '@/components/organisms';

const target = {
  id: '1',
  title: 'Monthly Sales Target',
  current: 85000,
  target: 100000,
  unit: 'USD',
  color: '#10b981',
};

const stats = [
  {
    id: '1',
    label: 'This Week',
    value: '$18,500',
    change: 12.5,
    changeType: 'increase',
    iconName: 'calendar',
  },
  // ... more stats
];

<TargetDisplay
  target={target}
  stats={stats}
  title="Sales Target"
  subtitle="Monthly progress tracking"
  chartSize="lg"
  variant="default"
/>;
```

**Props**:

- `target`: Target data object with current and target values
- `stats`: Array of statistic objects
- `title`: Optional title
- `subtitle`: Optional subtitle
- `chartSize`: Size of the radial chart ('sm' | 'md' | 'lg')
- `statsLayout`: Layout for statistics ('horizontal' | 'vertical')
- `showPercentage`: Whether to show percentage completed

## Common Features

All organisms share these common features:

- **Responsive Design**: Automatically adapt to different screen sizes
- **Theme Support**: Full dark/light theme compatibility
- **Empty States**: Graceful handling of missing data
- **TypeScript Support**: Full type safety with exported interfaces
- **Customizable Styling**: Flexible className and variant props
- **Accessibility**: ARIA labels and keyboard navigation support

## Data Interfaces

### MetricData

```typescript
interface MetricData {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  iconName?: string;
  badge?: {
    text: string;
    variant?: 'light' | 'solid' | 'outline';
    color?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  };
}
```

### CountryData

```typescript
interface CountryData {
  id: string;
  countryCode: string;
  countryName?: string;
  value: number;
  max?: number;
  percentage?: number;
  progressColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
}
```

### ProductData

```typescript
interface ProductData {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  originalPrice?: string | number;
  image?: string;
  imageAlt?: string;
  badge?: BadgeProps;
  status?: 'in-stock' | 'out-of-stock' | 'low-stock';
  rating?: number;
  reviews?: number;
}
```

### TargetData

```typescript
interface TargetData {
  id: string;
  title: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}
```

## Best Practices

1. **Data Structure**: Always provide unique `id` fields for array items
2. **Performance**: Use `React.memo` for expensive organisms when data doesn't change frequently
3. **Loading States**: Show loading indicators while data is being fetched
4. **Error Handling**: Implement proper error boundaries for robust UX
5. **Accessibility**: Test with screen readers and keyboard navigation
6. **Responsive Design**: Test on various screen sizes and devices

## Demo

See `OrganismsDemo.tsx` for comprehensive usage examples of all organisms with sample data and interactive features.

## Integration with Atomic Design

**Organisms** → **Molecules** → **Atoms**

- **Atoms**: Basic UI elements (buttons, inputs, text)
- **Molecules**: Simple combinations of atoms (search bar, navigation item)
- **Organisms**: Complex, functional sections (header, product grid, sidebar)
- **Templates**: Page-level layouts combining organisms
- **Pages**: Specific instances of templates with real data
