# Templates

Templates are the page-level structures that combine organisms, molecules, and atoms to create complete page layouts. They provide consistent, reusable layout patterns for different types of pages in the application.

## Design Philosophy

Templates follow the atomic design methodology as the highest level of components:

- **Atoms**: Basic building blocks (buttons, inputs, cards)
- **Molecules**: Simple combinations of atoms (forms, search bars)
- **Organisms**: Complex UI components (headers, grids, lists)
- **Templates**: Page-level structures that combine all the above

## Available Templates

### DashboardTemplate

A flexible, grid-based layout template specifically designed for dashboard interfaces.

#### Features

- **Grid-based layout**: Uses CSS Grid for flexible, responsive layouts
- **Predefined layouts**: Standard, compact, wide, sidebar-left, sidebar-right
- **Custom layouts**: Support for custom grid template areas
- **Responsive design**: Built-in breakpoint support
- **Theme support**: Dark/light theme compatibility
- **Flexible spacing**: Configurable gaps and padding

#### Usage

```tsx
import { DashboardTemplate, LayoutArea } from '@/components/templates';
import { MetricsGrid, ChartContainer } from '@/components/organisms';

const areas: LayoutArea[] = [
  {
    area: 'header',
    component: <DashboardHeader />,
    className: 'bg-white dark:bg-gray-800 shadow-sm',
  },
  {
    area: 'metrics',
    component: <MetricsGrid metrics={metricsData} />,
    className: 'mb-4',
  },
  {
    area: 'charts',
    component: <ChartContainer title="Sales Overview" chart={<SalesChart />} />,
  },
  {
    area: 'actions',
    component: <QuickActions />,
  },
];

function DashboardPage() {
  return (
    <DashboardTemplate
      layout="wide"
      gap="lg"
      padding="md"
      areas={areas}
      responsive={{
        sm: { gap: 'sm' },
        md: { gap: 'md' },
        lg: { gap: 'lg' },
      }}
    />
  );
}
```

#### Pre-configured Variants

For common use cases, use the pre-configured variants:

```tsx
import { StandardDashboardTemplate } from '@/components/templates';

// Standard 3-column layout
<StandardDashboardTemplate areas={areas} />

// Compact 2-column layout
<CompactDashboardTemplate areas={areas} />

// Wide 4-column layout
<WideDashboardTemplate areas={areas} />

// Sidebar layouts
<SidebarLeftDashboardTemplate areas={areas} />
<SidebarRightDashboardTemplate areas={areas} />
```

#### Custom Layout

For unique layouts, use the custom layout option:

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

#### Props

| Prop                 | Type                                                                                                     | Default         | Description                                |
| -------------------- | -------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------ |
| `layout`             | `'standard' \| 'compact' \| 'wide' \| 'sidebar-left' \| 'sidebar-right' \| 'custom'`                     | `'standard'`    | Predefined layout configuration            |
| `columns`            | `number`                                                                                                 | Layout-specific | Number of grid columns                     |
| `rows`               | `number`                                                                                                 | Layout-specific | Number of grid rows                        |
| `gap`                | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                 | `'md'`          | Gap between grid items                     |
| `padding`            | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                 | `'md'`          | Container padding                          |
| `maxWidth`           | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl' \| '6xl' \| '7xl' \| 'full'` | `'full'`        | Maximum width constraint                   |
| `background`         | `'none' \| 'white' \| 'gray' \| 'dark'`                                                                  | `'none'`        | Background color                           |
| `areas`              | `LayoutArea[]`                                                                                           | Required        | Array of layout areas and their components |
| `responsive`         | `object`                                                                                                 | `{}`            | Responsive breakpoint configurations       |
| `gridTemplateAreas`  | `string`                                                                                                 | Layout-specific | Custom CSS grid template areas             |
| `className`          | `string`                                                                                                 | `''`            | Additional CSS classes                     |
| `containerClassName` | `string`                                                                                                 | `''`            | Container-specific CSS classes             |

#### Layout Areas

Each layout area supports the following properties:

| Property    | Type              | Description                              |
| ----------- | ----------------- | ---------------------------------------- |
| `area`      | `DashboardArea`   | The grid area name                       |
| `component` | `React.ReactNode` | The component to render                  |
| `gridArea`  | `string`          | Custom grid area name (overrides `area`) |
| `className` | `string`          | Additional CSS classes for the area      |
| `visible`   | `boolean`         | Whether the area should be rendered      |

#### Available Dashboard Areas

- `header`: Page header/navigation
- `sidebar`: Side navigation or secondary content
- `main`: Primary content area
- `metrics`: Metrics/KPI display area
- `charts`: Chart/visualization area
- `actions`: Action buttons/quick actions
- `footer`: Page footer

## Best Practices

1. **Use predefined layouts** when possible for consistency
2. **Responsive design**: Always consider mobile-first responsive behavior
3. **Semantic areas**: Use meaningful area names that describe content purpose
4. **Performance**: Use React.memo for expensive organisms when needed
5. **Accessibility**: Ensure proper heading hierarchy and ARIA labels
6. **Theme support**: Use theme-aware styling for dark/light mode support

## Extending Templates

To add new templates:

1. Create a new template file in this directory
2. Export it from `index.ts`
3. Follow the established patterns for props and configuration
4. Include comprehensive TypeScript types
5. Add documentation to this README

## Integration with Organisms

Templates are designed to work seamlessly with organisms:

```tsx
// Import organisms
import { MetricsGrid, ChartContainer, CountryList, ProductTable } from '@/components/organisms';

// Use in template areas
const areas = [
  { area: 'metrics', component: <MetricsGrid metrics={data} /> },
  { area: 'charts', component: <ChartContainer chart={<MyChart />} /> },
  { area: 'main', component: <ProductTable products={products} /> },
];
```

This creates a clear separation of concerns where templates handle layout and organisms handle complex UI functionality.
