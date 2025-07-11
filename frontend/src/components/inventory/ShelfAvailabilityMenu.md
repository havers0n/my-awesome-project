# Shelf Availability Menu

The `ShelfAvailabilityMenu` component displays a detailed list of products, showing their availability on the shelves. It allows users to search, filter, and sort products to efficiently manage inventory.

## Features

- **Product Statuses**: Displays products with various availability statuses.
- **Search**: Allows searching by product name or shelf number.
- **Filtering**: Enables filtering by status (available, low stock, critical, out of stock).
- **Sorting**: Products can be sorted by name, stock quantity, or status.
- **Location Information**: Shows the exact shelf location for each product.
- **Out-of-Stock Tracking**: Displays how long a product has been out of stock.
- **Reserved Stock**: Shows the amount of stock that has been reserved.

## Usage

### Basic Usage

```tsx
import ShelfAvailabilityMenu from '@/components/inventory/ShelfAvailabilityMenu';

<ShelfAvailabilityMenu />
```

### With Product Selection Handler

```tsx
<ShelfAvailabilityMenu 
  onProductSelect={(product) => console.log('Selected:', product)}
  showFilters={true}
/>
```

### Compact Mode (No Filters)

```tsx
<ShelfAvailabilityMenu 
  showFilters={false}
/>
```

## Props

| Prop              | Type                                     | Default     | Description                               |
|-------------------|------------------------------------------|-------------|-------------------------------------------|
| `onProductSelect` | `(product: ProductAvailability) => void` | `undefined` | Callback function when a product is selected. |
| `showFilters`     | `boolean`                                | `true`      | Toggles the visibility of filters and search. |

## Data Interfaces

### ProductAvailability

```typescript
interface ProductAvailability {
  id: string;
  product_name: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  last_restock_date: string;
  out_of_stock_hours: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'critical';
  shelf_location: string;
}
```
