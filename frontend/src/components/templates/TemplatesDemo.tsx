import React, { useState } from 'react';
import {
  DashboardTemplate,
  StandardDashboardTemplate,
  CompactDashboardTemplate,
  WideDashboardTemplate,
  SidebarLeftDashboardTemplate,
  SidebarRightDashboardTemplate,
  LayoutArea,
} from './DashboardTemplate';
import { MetricsGrid, ChartContainer, CountryList, ProductTable } from '../organisms';
import { Card, Text } from '../atoms';

// Sample data for demonstration
const sampleMetrics = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$45,231.89',
    change: 12.5,
    changeType: 'increase' as const,
    iconName: 'DollarSign' as const,
  },
  {
    id: '2',
    title: 'Active Users',
    value: '2,350',
    change: -2.1,
    changeType: 'decrease' as const,
    iconName: 'Users' as const,
  },
  {
    id: '3',
    title: 'Orders',
    value: '1,234',
    change: 8.3,
    changeType: 'increase' as const,
    iconName: 'Package' as const,
  },
  {
    id: '4',
    title: 'Conversion Rate',
    value: '3.45%',
    change: 0.5,
    changeType: 'increase' as const,
    iconName: 'Target' as const,
  },
];

// Demo Header Component
const DemoHeader: React.FC = () => (
  <Card className="bg-blue-500 text-white">
    <div className="flex items-center justify-between">
      <Text variant="h3" className="text-white">
        Dashboard Header
      </Text>
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-blue-600 rounded text-sm">Settings</button>
        <button className="px-3 py-1 bg-blue-600 rounded text-sm">Profile</button>
      </div>
    </div>
  </Card>
);

// Demo Sidebar Component
const DemoSidebar: React.FC = () => (
  <Card className="bg-gray-100 dark:bg-gray-700 h-full">
    <div className="space-y-2">
      <Text variant="h4" className="mb-4">
        Navigation
      </Text>
      <div className="space-y-2">
        <div className="p-2 bg-blue-500 text-white rounded">Dashboard</div>
        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded">Analytics</div>
        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded">Reports</div>
        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded">Settings</div>
      </div>
    </div>
  </Card>
);

// Demo Chart Component
const DemoChart: React.FC = () => (
  <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="text-4xl mb-2">📊</div>
      <Text variant="body1" className="text-gray-600 dark:text-gray-400">
        Sample Chart Placeholder
      </Text>
    </div>
  </div>
);

// Demo Actions Component
const DemoActions: React.FC = () => (
  <Card>
    <Text variant="h4" className="mb-4">
      Quick Actions
    </Text>
    <div className="space-y-2">
      <button className="w-full p-2 bg-green-500 text-white rounded">Add Product</button>
      <button className="w-full p-2 bg-blue-500 text-white rounded">Generate Report</button>
      <button className="w-full p-2 bg-purple-500 text-white rounded">Export Data</button>
    </div>
  </Card>
);

// Demo Footer Component
const DemoFooter: React.FC = () => (
  <Card className="bg-gray-100 dark:bg-gray-700">
    <div className="flex items-center justify-between">
      <Text variant="small" className="text-gray-600 dark:text-gray-400">
        © 2024 Dashboard Application
      </Text>
      <div className="flex gap-4">
        <Text variant="small" className="text-gray-600 dark:text-gray-400">
          Privacy
        </Text>
        <Text variant="small" className="text-gray-600 dark:text-gray-400">
          Terms
        </Text>
        <Text variant="small" className="text-gray-600 dark:text-gray-400">
          Support
        </Text>
      </div>
    </div>
  </Card>
);

export const TemplatesDemo: React.FC = () => {
  const [selectedLayout, setSelectedLayout] = useState<
    'standard' | 'compact' | 'wide' | 'sidebar-left' | 'sidebar-right'
  >('standard');
  const [gap, setGap] = useState<'sm' | 'md' | 'lg'>('md');
  const [padding, setPadding] = useState<'sm' | 'md' | 'lg'>('md');

  // Generate areas based on layout
  const generateAreas = (): LayoutArea[] => {
    const commonAreas: LayoutArea[] = [
      {
        area: 'header',
        component: <DemoHeader />,
        className: 'z-10',
      },
      {
        area: 'main',
        component: <ChartContainer title="Sales Performance" chart={<DemoChart />} />,
      },
      {
        area: 'metrics',
        component: <MetricsGrid metrics={sampleMetrics} columns={4} />,
      },
      {
        area: 'charts',
        component: <ChartContainer title="Analytics Overview" chart={<DemoChart />} />,
      },
      {
        area: 'actions',
        component: <DemoActions />,
      },
    ];

    // Add sidebar for sidebar layouts
    if (selectedLayout.includes('sidebar')) {
      commonAreas.push({
        area: 'sidebar',
        component: <DemoSidebar />,
        className: 'min-h-full',
      });
    }

    // Add footer for standard and wide layouts
    if (selectedLayout === 'standard' || selectedLayout === 'wide') {
      commonAreas.push({
        area: 'footer',
        component: <DemoFooter />,
      });
    }

    return commonAreas;
  };

  const areas = generateAreas();

  const renderTemplate = () => {
    const templateProps = {
      areas,
      gap,
      padding,
      background: 'gray' as const,
      className: 'min-h-screen',
    };

    switch (selectedLayout) {
      case 'standard':
        return <StandardDashboardTemplate {...templateProps} />;
      case 'compact':
        return <CompactDashboardTemplate {...templateProps} />;
      case 'wide':
        return <WideDashboardTemplate {...templateProps} />;
      case 'sidebar-left':
        return <SidebarLeftDashboardTemplate {...templateProps} />;
      case 'sidebar-right':
        return <SidebarRightDashboardTemplate {...templateProps} />;
      default:
        return <StandardDashboardTemplate {...templateProps} />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <Text variant="h2" className="mb-4">
          Dashboard Templates Demo
        </Text>
        <Text variant="body1" className="mb-6 text-gray-600 dark:text-gray-400">
          Explore different dashboard layout configurations using our flexible template system.
        </Text>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Layout</label>
            <select
              value={selectedLayout}
              onChange={e => setSelectedLayout(e.target.value as any)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <option value="standard">Standard</option>
              <option value="compact">Compact</option>
              <option value="wide">Wide</option>
              <option value="sidebar-left">Sidebar Left</option>
              <option value="sidebar-right">Sidebar Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gap</label>
            <select
              value={gap}
              onChange={e => setGap(e.target.value as any)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Padding</label>
            <select
              value={padding}
              onChange={e => setPadding(e.target.value as any)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
        </div>

        {/* Layout Description */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg mb-6">
          <Text variant="h4" className="mb-2">
            Current Layout: {selectedLayout}
          </Text>
          <Text variant="body2" className="text-blue-700 dark:text-blue-300">
            {selectedLayout === 'standard' &&
              'A traditional 3-column layout with header, sidebar, main content, and footer.'}
            {selectedLayout === 'compact' &&
              'A minimal 2-column layout perfect for focused content.'}
            {selectedLayout === 'wide' &&
              'A spacious 4-column layout ideal for data-heavy dashboards.'}
            {selectedLayout === 'sidebar-left' &&
              'A layout with navigation sidebar on the left side.'}
            {selectedLayout === 'sidebar-right' &&
              'A layout with navigation sidebar on the right side.'}
          </Text>
        </div>
      </Card>

      {/* Template Preview */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <Text variant="h3" className="mb-4">
          Template Preview
        </Text>
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
          {renderTemplate()}
        </div>
      </div>

      {/* Code Example */}
      <Card>
        <Text variant="h3" className="mb-4">
          Code Example
        </Text>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`import { ${
            selectedLayout === 'standard'
              ? 'StandardDashboardTemplate'
              : selectedLayout === 'compact'
                ? 'CompactDashboardTemplate'
                : selectedLayout === 'wide'
                  ? 'WideDashboardTemplate'
                  : selectedLayout === 'sidebar-left'
                    ? 'SidebarLeftDashboardTemplate'
                    : 'SidebarRightDashboardTemplate'
          } } from '@/components/templates';

const areas = [
  { area: 'header', component: <DashboardHeader /> },
  { area: 'metrics', component: <MetricsGrid metrics={data} /> },
  { area: 'charts', component: <ChartContainer chart={<Chart />} /> },
  { area: 'actions', component: <QuickActions /> },
  ${selectedLayout.includes('sidebar') ? `{ area: 'sidebar', component: <Sidebar /> },` : ''}
  ${selectedLayout === 'standard' || selectedLayout === 'wide' ? `{ area: 'footer', component: <Footer /> },` : ''}
];

function DashboardPage() {
  return (
    <${
      selectedLayout === 'standard'
        ? 'StandardDashboardTemplate'
        : selectedLayout === 'compact'
          ? 'CompactDashboardTemplate'
          : selectedLayout === 'wide'
            ? 'WideDashboardTemplate'
            : selectedLayout === 'sidebar-left'
              ? 'SidebarLeftDashboardTemplate'
              : 'SidebarRightDashboardTemplate'
    }
      areas={areas}
      gap="${gap}"
      padding="${padding}"
      background="gray"
    />
  );
}`}</code>
        </pre>
      </Card>
    </div>
  );
};

export default TemplatesDemo;
