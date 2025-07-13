import React from 'react';
import { DashboardTemplate, LayoutArea } from './DashboardTemplate';
import {
  MetricsGrid,
  ChartContainer,
  CountryList,
  ProductTable,
  TargetDisplay,
} from '../organisms';
import { Card, Text } from '../atoms';

// Sample data - in a real app, this would come from API calls or props
const sampleMetrics = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '$124,350',
    change: 12.5,
    changeType: 'increase' as const,
    iconName: 'DollarSign' as const,
    badge: {
      text: 'Monthly',
      variant: 'light' as const,
      color: 'success' as const,
    },
  },
  {
    id: 'orders',
    title: 'Total Orders',
    value: '2,847',
    change: 8.2,
    changeType: 'increase' as const,
    iconName: 'Package' as const,
    badge: {
      text: 'This Month',
      variant: 'light' as const,
      color: 'info' as const,
    },
  },
  {
    id: 'customers',
    title: 'New Customers',
    value: '1,234',
    change: -2.1,
    changeType: 'decrease' as const,
    iconName: 'Users' as const,
    badge: {
      text: 'This Week',
      variant: 'light' as const,
      color: 'warning' as const,
    },
  },
  {
    id: 'conversion',
    title: 'Conversion Rate',
    value: '4.2%',
    change: 0.8,
    changeType: 'increase' as const,
    iconName: 'Target' as const,
    badge: {
      text: 'Avg.',
      variant: 'light' as const,
      color: 'primary' as const,
    },
  },
];

const sampleCountries = [
  { code: 'US', name: 'United States', value: 45231, change: 12.5 },
  { code: 'GB', name: 'United Kingdom', value: 32180, change: 8.3 },
  { code: 'DE', name: 'Germany', value: 28940, change: -2.1 },
  { code: 'FR', name: 'France', value: 24750, change: 15.2 },
  { code: 'CA', name: 'Canada', value: 19380, change: 6.8 },
];

const sampleProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    category: 'Electronics',
    price: 299.99,
    stock: 85,
    sales: 1240,
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    category: 'Wearables',
    price: 199.99,
    stock: 42,
    sales: 890,
    status: 'low-stock' as const,
  },
  {
    id: '3',
    name: 'Bluetooth Speaker',
    category: 'Audio',
    price: 89.99,
    stock: 0,
    sales: 2156,
    status: 'out-of-stock' as const,
  },
  {
    id: '4',
    name: 'Wireless Mouse',
    category: 'Computer',
    price: 49.99,
    stock: 156,
    sales: 445,
    status: 'active' as const,
  },
];

const sampleTargetData = {
  title: 'Monthly Sales Target',
  current: 78432,
  target: 100000,
  period: 'March 2024',
  stats: [
    { label: 'This Month', value: '$78,432', change: 12.5, positive: true },
    { label: 'Last Month', value: '$69,850', change: -5.2, positive: false },
    { label: 'YTD', value: '$234,680', change: 18.7, positive: true },
  ],
};

// Header component for the dashboard
const DashboardHeader: React.FC = () => (
  <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <Text variant="h2" className="text-white font-bold">
          Dashboard Overview
        </Text>
        <Text variant="body1" className="text-blue-100 mt-1">
          Welcome back! Here's what's happening with your business today.
        </Text>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <Text variant="small" className="text-blue-100">
            Last updated
          </Text>
          <Text variant="body2" className="text-white font-medium">
            {new Date().toLocaleTimeString()}
          </Text>
        </div>
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <span className="text-lg">👋</span>
        </div>
      </div>
    </div>
  </Card>
);

// Chart placeholder component
const SalesChart: React.FC = () => (
  <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">📈</div>
      <Text variant="h4" className="text-gray-600 dark:text-gray-400 mb-2">
        Sales Performance Chart
      </Text>
      <Text variant="body2" className="text-gray-500 dark:text-gray-500">
        Interactive chart would be rendered here
      </Text>
    </div>
  </div>
);

// Quick actions component
const QuickActions: React.FC = () => (
  <Card>
    <Text variant="h4" className="mb-4">
      Quick Actions
    </Text>
    <div className="space-y-3">
      <button className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
        <span>📦</span>
        <span>Add Product</span>
      </button>
      <button className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
        <span>📊</span>
        <span>Generate Report</span>
      </button>
      <button className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
        <span>📤</span>
        <span>Export Data</span>
      </button>
      <button className="w-full p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
        <span>⚙️</span>
        <span>Settings</span>
      </button>
    </div>
  </Card>
);

// Main dashboard page component
export const ExampleDashboardPage: React.FC = () => {
  // Define the layout areas
  const areas: LayoutArea[] = [
    {
      area: 'header',
      component: <DashboardHeader />,
      className: 'col-span-full',
    },
    {
      area: 'metrics',
      component: (
        <MetricsGrid metrics={sampleMetrics} columns={4} gap="md" size="md" variant="elevated" />
      ),
      className: 'col-span-full',
    },
    {
      area: 'charts',
      component: (
        <ChartContainer
          title="Sales Performance"
          subtitle="Monthly revenue trends"
          chart={<SalesChart />}
          dropdownOptions={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'daily', label: 'Daily' },
          ]}
          selectedOption="monthly"
          size="lg"
        />
      ),
      className: 'lg:col-span-2',
    },
    {
      area: 'actions',
      component: <QuickActions />,
      className: 'lg:col-span-1',
    },
    {
      area: 'main',
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CountryList countries={sampleCountries} title="Top Countries" size="md" />
          <TargetDisplay {...sampleTargetData} variant="elevated" size="md" />
        </div>
      ),
      className: 'col-span-full',
    },
  ];

  return (
    <DashboardTemplate
      layout="wide"
      areas={areas}
      gap="lg"
      padding="lg"
      background="gray"
      maxWidth="7xl"
      className="mx-auto"
      responsive={{
        sm: { gap: 'sm', padding: 'sm' },
        md: { gap: 'md', padding: 'md' },
        lg: { gap: 'lg', padding: 'lg' },
      }}
    />
  );
};

export default ExampleDashboardPage;
