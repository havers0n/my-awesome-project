import React, { useState } from 'react';
import {
  MetricsGrid,
  ChartContainer,
  CountryList,
  ProductTable,
  TargetDisplay,
  MetricData,
  CountryData,
  ProductData,
  TargetData,
  TargetStat,
} from './index';

// Sample data for demonstrations
const sampleMetrics: MetricData[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$45,231.89',
    change: 20.1,
    changeType: 'increase',
    iconName: 'dollar',
    badge: { text: 'This month', color: 'success' },
  },
  {
    id: '2',
    title: 'Active Users',
    value: '2,350',
    change: -4.3,
    changeType: 'decrease',
    iconName: 'users',
    badge: { text: 'Online', color: 'primary' },
  },
  {
    id: '3',
    title: 'Orders',
    value: '12,234',
    change: 15.2,
    changeType: 'increase',
    iconName: 'package',
    badge: { text: 'Completed', color: 'success' },
  },
  {
    id: '4',
    title: 'Conversion Rate',
    value: '3.24%',
    change: 2.1,
    changeType: 'increase',
    iconName: 'trending-up',
    badge: { text: 'Improved', color: 'warning' },
  },
];

const sampleCountries: CountryData[] = [
  {
    id: '1',
    countryCode: 'US',
    countryName: 'United States',
    value: 12500,
    max: 15000,
    progressColor: 'blue',
  },
  {
    id: '2',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    value: 9800,
    max: 15000,
    progressColor: 'green',
  },
  {
    id: '3',
    countryCode: 'DE',
    countryName: 'Germany',
    value: 8200,
    max: 15000,
    progressColor: 'purple',
  },
  {
    id: '4',
    countryCode: 'FR',
    countryName: 'France',
    value: 7100,
    max: 15000,
    progressColor: 'yellow',
  },
  {
    id: '5',
    countryCode: 'JP',
    countryName: 'Japan',
    value: 5900,
    max: 15000,
    progressColor: 'red',
  },
];

const sampleProducts: ProductData[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    originalPrice: 399.99,
    status: 'in-stock',
    rating: 4.8,
    reviews: 1234,
    badge: { text: 'Best Seller', color: 'success' },
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Advanced fitness tracking and health monitoring',
    price: 249.99,
    status: 'low-stock',
    rating: 4.5,
    reviews: 856,
    badge: { text: 'Limited', color: 'warning' },
  },
  {
    id: '3',
    name: 'Laptop Stand',
    description: 'Ergonomic adjustable laptop stand for better posture',
    price: 79.99,
    status: 'in-stock',
    rating: 4.3,
    reviews: 432,
    badge: { text: 'New', color: 'info' },
  },
  {
    id: '4',
    name: 'Gaming Mouse',
    description: 'High-precision gaming mouse with customizable buttons',
    price: 89.99,
    status: 'out-of-stock',
    rating: 4.7,
    reviews: 678,
    badge: { text: 'Popular', color: 'primary' },
  },
];

const sampleTarget: TargetData = {
  id: '1',
  title: 'Monthly Sales Target',
  current: 85000,
  target: 100000,
  unit: 'USD',
  color: '#10b981',
};

const sampleTargetStats: TargetStat[] = [
  {
    id: '1',
    label: 'This Week',
    value: '$18,500',
    change: 12.5,
    changeType: 'increase',
    iconName: 'calendar',
  },
  {
    id: '2',
    label: 'This Month',
    value: '$85,000',
    change: -2.3,
    changeType: 'decrease',
    iconName: 'trending-up',
  },
  {
    id: '3',
    label: 'Remaining',
    value: '$15,000',
    description: 'To reach target',
    iconName: 'target',
  },
];

export const OrganismsDemo: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);

  const chartDropdownOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ];

  const sampleChart = (
    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-2">📊</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Sample Chart Component</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">Period: {selectedPeriod}</p>
      </div>
    </div>
  );

  const handleProductClick = (product: ProductData) => {
    console.log('Product clicked:', product);
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Organisms Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complex components combining molecules and atoms
        </p>
      </div>

      {/* MetricsGrid Demo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          1. MetricsGrid Organism
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Displays multiple metric cards in a responsive grid layout
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              4 Columns (Default)
            </h3>
            <MetricsGrid metrics={sampleMetrics} columns={4} size="md" variant="elevated" />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              2 Columns (Compact)
            </h3>
            <MetricsGrid
              metrics={sampleMetrics.slice(0, 2)}
              columns={2}
              size="sm"
              variant="outlined"
            />
          </div>
        </div>
      </section>

      {/* ChartContainer Demo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          2. ChartContainer Organism
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Combines chart header with chart content and optional actions
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="Sales Performance"
            subtitle="Revenue trends over time"
            chart={sampleChart}
            dropdownOptions={chartDropdownOptions}
            selectedOption={selectedPeriod}
            onOptionChange={setSelectedPeriod}
            variant="default"
          />

          <ChartContainer
            title="User Activity"
            subtitle="Daily active users"
            chart={sampleChart}
            actions={
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Export
              </button>
            }
            variant="elevated"
          />
        </div>
      </section>

      {/* CountryList Demo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          3. CountryList Organism
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Displays countries with flags, values, and progress indicators
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CountryList
            countries={sampleCountries}
            title="Top Countries"
            subtitle="Sales by country"
            layout="horizontal"
            variant="default"
          />

          <CountryList
            countries={sampleCountries.slice(0, 3)}
            title="Regional Performance"
            subtitle="Compact view"
            layout="vertical"
            variant="outlined"
            size="sm"
          />
        </div>
      </section>

      {/* ProductTable Demo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          4. ProductTable Organism
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Displays products with detailed information and actions
        </p>

        <div className="grid grid-cols-1 gap-6">
          <ProductTable
            products={sampleProducts}
            title="Product Catalog"
            subtitle="Manage your product inventory"
            layout="horizontal"
            onProductClick={handleProductClick}
            actions={
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                  Add Product
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  Export
                </button>
              </div>
            }
            variant="default"
          />

          <ProductTable
            products={sampleProducts}
            title="Featured Products"
            subtitle="Vertical card layout"
            layout="vertical"
            maxItems={3}
            variant="elevated"
          />
        </div>
      </section>

      {/* TargetDisplay Demo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          5. TargetDisplay Organism
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Combines radial chart with statistics to show target progress
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TargetDisplay
            target={sampleTarget}
            stats={sampleTargetStats}
            title="Sales Target"
            subtitle="Monthly progress tracking"
            chartSize="lg"
            variant="default"
          />

          <TargetDisplay
            target={{
              ...sampleTarget,
              title: 'Team Goals',
              current: 42,
              target: 50,
              unit: 'tasks',
              color: '#8b5cf6',
            }}
            stats={sampleTargetStats.slice(0, 2)}
            title="Team Performance"
            subtitle="Sprint completion rate"
            chartSize="md"
            statsLayout="vertical"
            variant="outlined"
          />
        </div>
      </section>
    </div>
  );
};

export default OrganismsDemo;
