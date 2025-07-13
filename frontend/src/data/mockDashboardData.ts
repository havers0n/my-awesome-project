import { MetricData } from '../components/organisms/MetricsGrid';
import { CountryData } from '../components/organisms/CountryList';
import { ProductData } from '../components/organisms/ProductTable';
import { TargetData, TargetStat } from '../components/organisms/TargetDisplay';

// Mock data for MetricsGrid
export const mockMetricsData: MetricData[] = [
  {
    id: 'customers',
    title: 'Customers',
    value: '3,782',
    change: 11.01,
    changeType: 'increase',
    iconName: 'GROUP',
    badge: {
      text: '11.01%',
      variant: 'solid',
      color: 'success',
    },
  },
  {
    id: 'orders',
    title: 'Orders',
    value: '5,359',
    change: -9.05,
    changeType: 'decrease',
    iconName: 'BOX_LINE',
    badge: {
      text: '9.05%',
      variant: 'solid',
      color: 'error',
    },
  },
  {
    id: 'revenue',
    title: 'Revenue',
    value: '$45,628',
    change: 15.3,
    changeType: 'increase',
    iconName: 'DOLLAR',
    badge: {
      text: '15.3%',
      variant: 'solid',
      color: 'success',
    },
  },
  {
    id: 'profit',
    title: 'Profit',
    value: '$9,762',
    change: 2.4,
    changeType: 'increase',
    iconName: 'CHART_BAR',
    badge: {
      text: '2.4%',
      variant: 'solid',
      color: 'success',
    },
  },
];

// Mock data for CountryList
export const mockCountryData: CountryData[] = [
  {
    id: 'us',
    countryCode: 'US',
    countryName: 'United States',
    value: 2847,
    max: 5000,
    percentage: 56.9,
    progressColor: 'blue',
  },
  {
    id: 'uk',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    value: 1943,
    max: 5000,
    percentage: 38.9,
    progressColor: 'green',
  },
  {
    id: 'ca',
    countryCode: 'CA',
    countryName: 'Canada',
    value: 1456,
    max: 5000,
    percentage: 29.1,
    progressColor: 'purple',
  },
  {
    id: 'au',
    countryCode: 'AU',
    countryName: 'Australia',
    value: 1089,
    max: 5000,
    percentage: 21.8,
    progressColor: 'yellow',
  },
  {
    id: 'de',
    countryCode: 'DE',
    countryName: 'Germany',
    value: 856,
    max: 5000,
    percentage: 17.1,
    progressColor: 'red',
  },
];

// Mock data for ProductTable
export const mockProductData: ProductData[] = [
  {
    id: 'product-1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    originalPrice: 399.99,
    image: '/images/products/headphones.jpg',
    imageAlt: 'Wireless headphones',
    badge: {
      text: 'Best Seller',
      variant: 'solid',
      color: 'success',
    },
    status: 'in-stock',
    rating: 4.5,
    reviews: 128,
  },
  {
    id: 'product-2',
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with health monitoring',
    price: 199.99,
    originalPrice: 249.99,
    image: '/images/products/smartwatch.jpg',
    imageAlt: 'Smart watch',
    badge: {
      text: 'New',
      variant: 'solid',
      color: 'info',
    },
    status: 'in-stock',
    rating: 4.3,
    reviews: 89,
  },
  {
    id: 'product-3',
    name: 'Laptop Stand',
    description: 'Ergonomic laptop stand for better productivity',
    price: 79.99,
    image: '/images/products/laptop-stand.jpg',
    imageAlt: 'Laptop stand',
    status: 'low-stock',
    rating: 4.7,
    reviews: 256,
  },
  {
    id: 'product-4',
    name: 'Wireless Mouse',
    description: 'Precision wireless mouse for gaming and work',
    price: 49.99,
    originalPrice: 69.99,
    image: '/images/products/mouse.jpg',
    imageAlt: 'Wireless mouse',
    badge: {
      text: 'Sale',
      variant: 'solid',
      color: 'error',
    },
    status: 'in-stock',
    rating: 4.2,
    reviews: 45,
  },
  {
    id: 'product-5',
    name: 'USB-C Hub',
    description: 'Multi-port USB-C hub with fast charging',
    price: 89.99,
    image: '/images/products/usb-hub.jpg',
    imageAlt: 'USB-C hub',
    status: 'out-of-stock',
    rating: 4.4,
    reviews: 67,
  },
];

// Mock data for TargetDisplay
export const mockTargetData: TargetData = {
  id: 'monthly-sales',
  title: 'Monthly Sales Target',
  current: 8426,
  target: 10000,
  unit: 'units',
  color: '#3b82f6',
};

export const mockTargetStats: TargetStat[] = [
  {
    id: 'this-week',
    label: 'This Week',
    value: 1847,
    iconName: 'CALENDAR',
    change: 12.5,
    changeType: 'increase',
    trend: 'up',
    description: 'Weekly sales performance',
  },
  {
    id: 'avg-daily',
    label: 'Daily Average',
    value: 264,
    iconName: 'CHART_LINE',
    change: -3.2,
    changeType: 'decrease',
    trend: 'down',
    description: 'Average daily sales',
  },
  {
    id: 'remaining',
    label: 'Remaining',
    value: 1574,
    iconName: 'TARGET',
    trend: 'neutral',
    description: 'Units left to reach target',
  },
];

// Mock chart data - these would typically come from chart components
export const mockChartData = {
  monthlySales: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  },
  statistics: {
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    datasets: [
      {
        label: 'Revenue',
        data: [300, 50, 100, 200],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  },
};
