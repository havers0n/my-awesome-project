# UI Molecules

Molecules are components that combine atoms to create more complex, reusable UI elements. They represent specific functionality and are designed to be consistent across the application.

## Components

### MetricCard

A molecule combining Card, Icon, Text, and Badge to represent metrics with change indicators.

```tsx
import { MetricCard } from '@/components/molecules';

<MetricCard
  title="Total Revenue"
  value={125340}
  change={12.5}
  changeType="increase"
  iconName="dollar-sign"
  badge={{ text: 'Monthly', variant: 'light', color: 'primary' }}
  variant="elevated"
/>;
```

**Props:**

- `title`: Metric title/label
- `value`: Numeric or string value
- `change`: Percentage change (optional)
- `changeType`: 'increase' | 'decrease' | 'neutral'
- `icon`: Custom React icon component
- `iconName`: Icon name from ICONS helper
- `badge`: Badge configuration object
- `variant`: Card variant
- `size`: 'sm' | 'md' | 'lg'

### ChartHeader

A molecule combining Text and Dropdown for chart headers with filter options.

```tsx
import { ChartHeader } from '@/components/molecules';

<ChartHeader
  title="Sales Overview"
  subtitle="Monthly revenue and growth"
  dropdownOptions={[
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
  ]}
  selectedOption="30days"
  onOptionChange={value => console.log(value)}
  actions={<button>Export</button>}
/>;
```

**Props:**

- `title`: Chart title
- `subtitle`: Optional subtitle
- `dropdownOptions`: Array of filter options
- `selectedOption`: Currently selected option
- `onOptionChange`: Callback for option changes
- `actions`: Additional action buttons/components

### ProgressIndicator

Combines ProgressBar and Text for detailed progress reports.

```tsx
import { ProgressIndicator } from '@/components/molecules';

<ProgressIndicator
  label="Project Completion"
  value={75}
  max={100}
  showPercentage={true}
  showValue={true}
  description="3 of 4 milestones completed"
  size="md"
  color="blue"
  animated={true}
/>;
```

**Props:**

- `label`: Progress label
- `value`: Current progress value
- `max`: Maximum value (default: 100)
- `showPercentage`: Show percentage indicator
- `showValue`: Show raw value
- `description`: Optional description text
- `size`: 'sm' | 'md' | 'lg'
- `color`: Progress bar color
- `animated`: Enable animation

### CountryItem

Combines CountryFlag, Text, and ProgressIndicator to represent demographic info.

```tsx
import { CountryItem } from '@/components/molecules';

<CountryItem
  countryCode="us"
  countryName="United States"
  value={1250}
  max={2000}
  showProgress={true}
  progressColor="green"
  size="md"
  layout="horizontal"
/>;
```

**Props:**

- `countryCode`: ISO 2-letter country code
- `countryName`: Country display name (optional)
- `value`: Numeric value
- `max`: Maximum value for progress calculation
- `percentage`: Manual percentage override
- `showProgress`: Show progress indicator
- `progressColor`: Progress bar color
- `size`: 'sm' | 'md' | 'lg'
- `layout`: 'horizontal' | 'vertical'

### TableRow

Create a TableRow molecule for consistent table row structure.

```tsx
import { TableRow } from '@/components/molecules';

<TableRow
  cells={[
    { children: 'John Doe', width: '200px' },
    { children: 'Manager', align: 'center' },
    { children: '$75,000', align: 'right' },
    { children: <button>Edit</button>, align: 'center' },
  ]}
  isHeader={false}
  isSelected={false}
  isHoverable={true}
  onClick={() => console.log('Row clicked')}
  variant="striped"
  size="md"
/>;
```

**Props:**

- `cells`: Array of cell objects with content and styling
- `isHeader`: Whether this is a header row
- `isSelected`: Row selection state
- `isHoverable`: Enable hover effects
- `onClick`: Row click handler
- `variant`: 'default' | 'striped' | 'bordered'
- `size`: 'sm' | 'md' | 'lg'

### ProductItem

Combines Image, Text, and Badge for a detailed product listing.

```tsx
import { ProductItem } from '@/components/molecules';

<ProductItem
  name="Wireless Headphones"
  description="Premium quality wireless headphones with noise cancellation"
  price={299.99}
  originalPrice={399.99}
  image="/images/headphones.jpg"
  badge={{ text: 'Sale', variant: 'solid', color: 'error' }}
  status="in-stock"
  rating={4.5}
  reviews={128}
  layout="horizontal"
  size="md"
  onClick={() => console.log('Product clicked')}
/>;
```

**Props:**

- `name`: Product name
- `description`: Product description
- `price`: Current price
- `originalPrice`: Original price (for discounts)
- `image`: Product image URL
- `imageAlt`: Alt text for image
- `badge`: Badge configuration
- `status`: 'in-stock' | 'out-of-stock' | 'low-stock'
- `rating`: Star rating (1-5)
- `reviews`: Number of reviews
- `layout`: 'horizontal' | 'vertical'
- `size`: 'sm' | 'md' | 'lg'
- `onClick`: Click handler

### StatItem

Develop a StatItem molecule for displaying footer statistics.

```tsx
import { StatItem } from '@/components/molecules';

<StatItem
  label="Total Users"
  value={12540}
  iconName="users"
  change={8.2}
  changeType="increase"
  description="Active users this month"
  prefix=""
  suffix=""
  size="md"
  layout="vertical"
  variant="bordered"
/>;
```

**Props:**

- `label`: Statistic label
- `value`: Numeric or string value
- `icon`: Custom React icon
- `iconName`: Icon name from ICONS helper
- `change`: Percentage change
- `changeType`: 'increase' | 'decrease' | 'neutral'
- `trend`: 'up' | 'down' | 'neutral' (alternative to changeType)
- `description`: Optional description
- `prefix`: Value prefix (e.g., "$")
- `suffix`: Value suffix (e.g., "%")
- `size`: 'sm' | 'md' | 'lg'
- `layout`: 'horizontal' | 'vertical'
- `variant`: 'default' | 'minimal' | 'bordered'

## Usage Guidelines

1. **Import from molecules**: Always import molecules from the main index file
2. **Compose with atoms**: Molecules should primarily use atoms for consistency
3. **Flexible props**: Design molecules to be flexible and reusable across contexts
4. **Responsive design**: Ensure molecules work well on different screen sizes
5. **Accessibility**: Include proper ARIA labels and keyboard navigation
6. **Performance**: Optimize for rendering performance with proper memoization

## Example Usage

```tsx
import {
  MetricCard,
  ChartHeader,
  ProgressIndicator,
  CountryItem,
  TableRow,
  ProductItem,
  StatItem,
} from '@/components/molecules';

function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={125340}
          change={12.5}
          changeType="increase"
          iconName="dollar-sign"
        />
        <MetricCard
          title="New Users"
          value={1250}
          change={-2.3}
          changeType="decrease"
          iconName="users"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <ChartHeader
          title="Sales Trends"
          subtitle="Monthly performance overview"
          dropdownOptions={[
            { value: '7days', label: 'Last 7 days' },
            { value: '30days', label: 'Last 30 days' },
          ]}
          selectedOption="30days"
          onOptionChange={value => console.log(value)}
        />
        {/* Chart component would go here */}
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <h3>Project Status</h3>
        <ProgressIndicator
          label="Development Progress"
          value={75}
          description="3 of 4 phases completed"
          animated={true}
        />
      </div>

      {/* Country Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CountryItem countryCode="us" value={1250} max={2000} layout="horizontal" />
        <CountryItem countryCode="ca" value={850} max={2000} layout="horizontal" />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProductItem
          name="Wireless Headphones"
          price={299.99}
          originalPrice={399.99}
          image="/images/headphones.jpg"
          status="in-stock"
          rating={4.5}
          layout="vertical"
        />
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatItem
          label="Total Sales"
          value={125340}
          prefix="$"
          change={12.5}
          changeType="increase"
        />
        <StatItem label="Active Users" value={8420} change={-2.1} changeType="decrease" />
      </div>
    </div>
  );
}
```
