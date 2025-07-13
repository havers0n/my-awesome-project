# UI Atoms

This directory contains standardized atomic UI components that ensure consistent design across the application.

## Components

### Card

A consistent layout component for sections with borders and padding.

```tsx
import { Card } from '@/components/atoms';

<Card padding="md" shadow="sm" hover>
  <h2>Title</h2>
  <p>Content</p>
</Card>;
```

**Props:**

- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `border`: boolean
- `hover`: boolean
- `variant`: 'default' | 'elevated' | 'outlined' | 'filled'

### Text

Standardized text component for consistent typography.

```tsx
import { Text } from '@/components/atoms';

<Text variant="h1" size="2xl" weight="bold" color="primary">
  Heading
</Text>
<Text variant="p" size="base" color="secondary">
  Paragraph text
</Text>
```

**Props:**

- `variant`: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'label' | 'span'
- `size`: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
- `weight`: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
- `color`: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'muted' | 'white'
- `align`: 'left' | 'center' | 'right' | 'justify'

### ProgressBar

Visual progress indicator component.

```tsx
import { ProgressBar } from '@/components/atoms';

<ProgressBar value={75} max={100} size="md" color="blue" showLabel animated />;
```

**Props:**

- `value`: number (current progress)
- `max`: number (maximum value)
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
- `showLabel`: boolean
- `animated`: boolean
- `striped`: boolean

### MetricValue

Specialized component for displaying numeric metrics with emphasis.

```tsx
import { MetricValue } from '@/components/atoms';

<MetricValue
  value={1234}
  label="Total Sales"
  prefix="$"
  change={12.5}
  changeType="increase"
  showTrend
/>;
```

**Props:**

- `value`: string | number
- `label`: string
- `prefix`: string
- `suffix`: string
- `change`: number (percentage change)
- `changeType`: 'increase' | 'decrease' | 'neutral'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
- `showTrend`: boolean

### CountryFlag

Component for displaying country flags with optional names.

```tsx
import { CountryFlag, COUNTRY_NAMES } from '@/components/atoms';

<CountryFlag countryCode="us" countryName={COUNTRY_NAMES.us} size="md" showName />;
```

**Props:**

- `countryCode`: string (ISO 2-letter code)
- `countryName`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showName`: boolean
- `variant`: 'rounded' | 'square' | 'circle'

### IconButton

Consistent icon-based button component.

```tsx
import { IconButton } from '@/components/atoms';
import { PlusIcon } from 'lucide-react';

<IconButton
  icon={<PlusIcon />}
  onClick={() => console.log('clicked')}
  variant="primary"
  size="md"
  ariaLabel="Add item"
/>;
```

**Props:**

- `icon`: React.ReactNode
- `onClick`: () => void
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'warning'
- `disabled`: boolean
- `tooltip`: string
- `ariaLabel`: string
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'full'
- `loading`: boolean

### Separator

Divider component for creating visual separations.

```tsx
import { Separator, HorizontalSeparator, VerticalSeparator, TextSeparator } from '@/components/atoms';

<Separator orientation="horizontal" size="md" />
<HorizontalSeparator />
<VerticalSeparator />
<TextSeparator text="OR" />
```

**Props:**

- `orientation`: 'horizontal' | 'vertical'
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'light' | 'medium' | 'dark'
- `decorative`: boolean

## Usage Guidelines

1. **Import from atoms**: Always import atoms from the main index file for consistency
2. **Use TypeScript**: All components are fully typed - use the exported types for custom implementations
3. **Consistent styling**: Use the provided variants and sizes rather than overriding with custom CSS
4. **Accessibility**: Components include proper ARIA labels and semantic HTML
5. **Dark mode**: All components support dark mode through Tailwind's dark: variants

## Example Usage

```tsx
import { Card, Text, MetricValue, ProgressBar, IconButton } from '@/components/atoms';
import { Settings } from 'lucide-react';

function DashboardCard() {
  return (
    <Card padding="lg" shadow="md" hover>
      <div className="flex justify-between items-center mb-4">
        <Text variant="h3" weight="semibold">
          Dashboard Metrics
        </Text>
        <IconButton icon={<Settings />} variant="ghost" ariaLabel="Settings" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricValue
          value={1234}
          label="Total Users"
          change={12.5}
          changeType="increase"
          showTrend
        />
        <MetricValue value="98.5%" label="Uptime" variant="success" />
      </div>

      <div className="mt-6">
        <Text variant="label" size="sm" color="secondary">
          Progress
        </Text>
        <ProgressBar value={75} size="md" color="blue" showLabel animated />
      </div>
    </Card>
  );
}
```
