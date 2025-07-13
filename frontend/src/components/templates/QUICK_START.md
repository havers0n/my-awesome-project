# Quick Start Guide: Dashboard Templates

## Overview

The Dashboard Templates provide a flexible, grid-based layout system for creating consistent dashboard interfaces. They follow the atomic design pattern and seamlessly integrate with existing organisms, molecules, and atoms.

## Basic Usage

### 1. Import the Template

```tsx
import { DashboardTemplate, LayoutArea } from '@/components/templates';
```

### 2. Define Layout Areas

```tsx
const areas: LayoutArea[] = [
  {
    area: 'header',
    component: <DashboardHeader />,
    className: 'col-span-full',
  },
  {
    area: 'metrics',
    component: <MetricsGrid metrics={data} />,
    className: 'col-span-full',
  },
  {
    area: 'charts',
    component: <ChartContainer title="Sales" chart={<Chart />} />,
    className: 'lg:col-span-2',
  },
  {
    area: 'actions',
    component: <QuickActions />,
    className: 'lg:col-span-1',
  },
];
```

### 3. Use the Template

```tsx
function DashboardPage() {
  return (
    <DashboardTemplate
      layout="wide"
      areas={areas}
      gap="lg"
      padding="md"
      background="gray"
      responsive={{
        sm: { gap: 'sm' },
        md: { gap: 'md' },
        lg: { gap: 'lg' },
      }}
    />
  );
}
```

## Pre-configured Templates

For common layouts, use the pre-configured variants:

```tsx
import { 
  StandardDashboardTemplate,
  CompactDashboardTemplate,
  WideDashboardTemplate,
  SidebarLeftDashboardTemplate,
  SidebarRightDashboardTemplate 
} from '@/components/templates';

// Use directly
<StandardDashboardTemplate areas={areas} />
```

## Integration with Organisms

Templates work seamlessly with existing organisms:

```tsx
import { MetricsGrid, ChartContainer, CountryList } from '@/components/organisms';

const areas = [
  {
    area: 'metrics',
    component: <MetricsGrid metrics={metricsData} columns={4} />,
  },
  {
    area: 'charts',
    component: <ChartContainer title="Revenue" chart={<LineChart />} />,
  },
  {
    area: 'main',
    component: <CountryList countries={countryData} />,
  },
];
```

## Responsive Design

Templates include built-in responsive behavior:

```tsx
<DashboardTemplate
  layout="wide"
  areas={areas}
  responsive={{
    sm: { gap: 'sm', padding: 'sm' },
    md: { gap: 'md', padding: 'md' },
    lg: { gap: 'lg', padding: 'lg' },
  }}
/>
```

## Custom Layouts

For unique requirements, create custom layouts:

```tsx
<DashboardTemplate
  layout="custom"
  columns={5}
  rows={3}
  gridTemplateAreas={`
    "header header header header actions"
    "sidebar metrics metrics charts charts"
    "sidebar footer footer footer footer"
  `}
  areas={areas}
/>
```

## Available Props

| Prop | Type | Description |
|------|------|-------------|
| `layout` | `'standard' \| 'compact' \| 'wide' \| 'sidebar-left' \| 'sidebar-right' \| 'custom'` | Layout preset |
| `areas` | `LayoutArea[]` | Components to render in each area |
| `gap` | `'sm' \| 'md' \| 'lg'` | Spacing between grid items |
| `padding` | `'sm' \| 'md' \| 'lg'` | Container padding |
| `background` | `'none' \| 'white' \| 'gray' \| 'dark'` | Background color |
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| ... \| 'full'` | Maximum width |
| `responsive` | `object` | Responsive breakpoint settings |

## Examples

Check out the demo and example files:

- `TemplatesDemo.tsx` - Interactive demo with all layout options
- `ExampleDashboardPage.tsx` - Real-world usage example with organisms

## Best Practices

1. **Use semantic area names** that describe the content purpose
2. **Leverage responsive props** for mobile-first design
3. **Combine with organisms** for complex UI components
4. **Keep layouts consistent** across similar pages
5. **Test on different screen sizes** to ensure responsive behavior

## Next Steps

- Explore the full documentation in `README.md`
- View the demo component to see all layout options
- Check the example page for real-world usage patterns
- Extend with custom templates for specific use cases
