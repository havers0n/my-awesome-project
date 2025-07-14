import React, { useState } from "react";
import {
  MetricCard,
  ChartHeader,
  ProgressIndicator,
  CountryItem,
  TableRow,
  ProductItem,
  StatItem,
} from "./index";
import NewMoleculesStep5Demo from "./NewMoleculesStep5Demo";

export const MoleculesDemo: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const dropdownOptions = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
    { value: '1year', label: 'Last year' },
  ];

  const tableRows = [
    {
      cells: [
        { children: 'Name', width: '200px' },
        { children: 'Role', align: 'center' as const },
        { children: 'Salary', align: 'right' as const },
        { children: 'Actions', align: 'center' as const },
      ],
      isHeader: true,
    },
    {
      cells: [
        { children: 'John Doe' },
        { children: 'Manager', align: 'center' as const },
        { children: '$75,000', align: 'right' as const },
        {
          children: <button className="px-3 py-1 bg-blue-500 text-white rounded">Edit</button>,
          align: 'center' as const,
        },
      ],
      onClick: () => console.log('Row 1 clicked'),
    },
    {
      cells: [
        { children: 'Jane Smith' },
        { children: 'Developer', align: 'center' as const },
        { children: '$65,000', align: 'right' as const },
        {
          children: <button className="px-3 py-1 bg-blue-500 text-white rounded">Edit</button>,
          align: 'center' as const,
        },
      ],
      onClick: () => console.log('Row 2 clicked'),
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Molecules Demo</h1>

        {/* MetricCard Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">MetricCard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value="$125,340"
              change={12.5}
              changeType="increase"
              badge={{ text: 'Monthly', variant: 'light', color: 'primary' }}
            />
            <MetricCard
              title="New Users"
              value={1250}
              change={-2.3}
              changeType="decrease"
              badge={{ text: 'Weekly', variant: 'solid', color: 'success' }}
            />
            <MetricCard
              title="Conversion Rate"
              value="3.2%"
              change={0.8}
              changeType="increase"
              variant="elevated"
            />
            <MetricCard
              title="Bounce Rate"
              value="42.1%"
              change={-1.2}
              changeType="decrease"
              variant="outlined"
            />
          </div>
        </section>

        {/* ChartHeader Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">ChartHeader</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <ChartHeader
              title="Sales Overview"
              subtitle="Monthly revenue and growth trends"
              dropdownOptions={dropdownOptions}
              selectedOption={selectedPeriod}
              onOptionChange={setSelectedPeriod}
              actions={
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded">
                    Export
                  </button>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded">Refresh</button>
                </div>
              }
            />
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">Chart would go here</span>
            </div>
          </div>
        </section>

        {/* ProgressIndicator Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            ProgressIndicator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ProgressIndicator
                label="Project Alpha"
                value={75}
                description="Development phase 3 of 4 completed"
                animated={true}
              />
              <ProgressIndicator
                label="User Onboarding"
                value={45}
                max={100}
                showValue={true}
                color="green"
              />
              <ProgressIndicator
                label="Server Migration"
                value={90}
                description="Almost complete"
                color="blue"
                striped={true}
              />
            </div>
            <div className="space-y-4">
              <ProgressIndicator
                label="Bug Fixes"
                value={28}
                max={50}
                showValue={true}
                showPercentage={true}
                color="red"
                size="lg"
              />
              <ProgressIndicator
                label="Feature Testing"
                value={62}
                description="Quality assurance in progress"
                color="purple"
                animated={true}
              />
            </div>
          </div>
        </section>

        {/* CountryItem Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">CountryItem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Horizontal Layout</h3>
              <div className="space-y-4">
                <CountryItem countryCode="us" value={1250} max={2000} layout="horizontal" />
                <CountryItem countryCode="ca" value={850} max={2000} layout="horizontal" />
                <CountryItem countryCode="gb" value={620} max={2000} layout="horizontal" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Vertical Layout</h3>
              <div className="grid grid-cols-3 gap-4">
                <CountryItem countryCode="de" value={480} max={2000} layout="vertical" size="sm" />
                <CountryItem countryCode="fr" value={390} max={2000} layout="vertical" size="sm" />
                <CountryItem countryCode="jp" value={290} max={2000} layout="vertical" size="sm" />
              </div>
            </div>
          </div>
        </section>

        {/* TableRow Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">TableRow</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                {tableRows.map((row, index) => (
                  <TableRow
                    key={index}
                    cells={row.cells}
                    isHeader={row.isHeader}
                    onClick={row.onClick}
                    variant="striped"
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ProductItem Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">ProductItem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProductItem
              name="Wireless Headphones"
              description="Premium quality wireless headphones with noise cancellation"
              price={299.99}
              originalPrice={399.99}
              badge={{ text: 'Sale', variant: 'solid', color: 'error' }}
              status="in-stock"
              rating={4.5}
              reviews={128}
              layout="vertical"
            />
            <ProductItem
              name="Smart Watch"
              description="Advanced fitness tracking and health monitoring"
              price={199.99}
              badge={{ text: 'New', variant: 'light', color: 'success' }}
              status="low-stock"
              rating={4.2}
              reviews={89}
              layout="vertical"
            />
            <ProductItem
              name="Laptop Stand"
              description="Ergonomic adjustable laptop stand for better posture"
              price={49.99}
              status="out-of-stock"
              rating={4.8}
              reviews={245}
              layout="vertical"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Horizontal Layout</h3>
            <div className="space-y-4">
              <ProductItem
                name="Wireless Mouse"
                description="Ergonomic design with long battery life"
                price={29.99}
                status="in-stock"
                rating={4.3}
                reviews={156}
                layout="horizontal"
              />
              <ProductItem
                name="USB-C Cable"
                description="High-speed charging and data transfer"
                price={12.99}
                originalPrice={19.99}
                badge={{ text: 'Deal', variant: 'outline', color: 'warning' }}
                status="in-stock"
                rating={4.7}
                reviews={342}
                layout="horizontal"
              />
            </div>
          </div>
        </section>

        {/* StatItem Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">StatItem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatItem
              label="Total Sales"
              value={125340}
              prefix="$"
              change={12.5}
              changeType="increase"
              variant="bordered"
            />
            <StatItem
              label="Active Users"
              value={8420}
              change={-2.1}
              changeType="decrease"
              variant="bordered"
            />
            <StatItem
              label="Conversion Rate"
              value={3.2}
              suffix="%"
              change={0.8}
              changeType="increase"
              variant="bordered"
            />
            <StatItem
              label="Avg. Order Value"
              value={87.5}
              prefix="$"
              change={5.2}
              changeType="increase"
              variant="bordered"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatItem
              label="Monthly Revenue"
              value={45280}
              prefix="$"
              change={18.3}
              changeType="increase"
              description="Best month this year"
              layout="horizontal"
              variant="default"
            />
            <StatItem
              label="Customer Satisfaction"
              value={4.8}
              suffix="/5"
              change={0.2}
              changeType="increase"
              description="Based on 1,234 reviews"
              layout="horizontal"
              variant="default"
            />
            <StatItem
              label="Support Tickets"
              value={142}
              change={-12.5}
              changeType="decrease"
              description="30% reduction from last month"
              layout="horizontal"
              variant="default"
            />
          </div>
        </section>

        {/* New Molecules Step 5 Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            New Molecules - Step 5
          </h2>
          <NewMoleculesStep5Demo />
        </section>
      </div>
    </div>
  );
};

export default MoleculesDemo;
