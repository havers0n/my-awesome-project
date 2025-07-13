import React, { useState } from 'react';
import { ProductInfo, ActionButtons, TableHeader, StatusBadge } from './index';

export const NewMoleculesDemo: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  const handleFilterAction = (actionId: string) => {
    console.log('Filter action:', actionId);
  };

  // Sample data for ProductInfo
  const productVariants = [
    { id: '1', name: 'Size', value: 'M', available: true },
    { id: '2', name: 'Color', value: 'Red', available: true },
    { id: '3', name: 'Material', value: 'Cotton', available: false },
  ];

  // Sample data for ActionButtons
  const filterButtons = [
    { id: 'all', label: 'All', count: 125, onClick: () => handleFilterAction('all') },
    { id: 'active', label: 'Active', count: 89, onClick: () => handleFilterAction('active') },
    { id: 'pending', label: 'Pending', count: 23, onClick: () => handleFilterAction('pending') },
    { id: 'archived', label: 'Archived', count: 13, onClick: () => handleFilterAction('archived') },
  ];

  // Sample data for TableHeader
  const tableColumns = [
    {
      id: 'name',
      label: 'Product Name',
      sortable: true,
      sortDirection: sortColumn === 'name' ? sortDirection : null,
      onSort: handleSort,
    },
    {
      id: 'price',
      label: 'Price',
      sortable: true,
      sortDirection: sortColumn === 'price' ? sortDirection : null,
      onSort: handleSort,
      align: 'right' as const,
    },
    { id: 'status', label: 'Status', sortable: false, align: 'center' as const },
    { id: 'actions', label: 'Actions', sortable: false, align: 'center' as const },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Molecules Demo</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Демонстрация новых компонентов среднего уровня (Molecules) созданных в Step 2
        </p>
      </div>

      {/* ProductInfo Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ProductInfo Component
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Horizontal Layout
            </h4>
            <ProductInfo
              name="Premium Cotton T-Shirt"
              description="Comfortable and stylish cotton t-shirt perfect for everyday wear"
              image="https://via.placeholder.com/64x64?text=Product"
              sku="SKU-001"
              category="Clothing"
              variants={productVariants}
              layout="horizontal"
              size="md"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vertical Layout
            </h4>
            <ProductInfo
              name="Wireless Bluetooth Headphones"
              description="High-quality wireless headphones with noise cancellation"
              image="https://via.placeholder.com/200x160?text=Product"
              sku="SKU-002"
              category="Electronics"
              variants={[
                { id: '1', name: 'Color', value: 'Black', available: true },
                { id: '2', name: 'Model', value: 'Pro', available: true },
              ]}
              layout="vertical"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* ActionButtons Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ActionButtons Component
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Filter Buttons with Counts
            </h4>
            <ActionButtons
              buttons={filterButtons}
              layout="horizontal"
              spacing="normal"
              showCounts={true}
              size="sm"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vertical Layout
            </h4>
            <ActionButtons
              buttons={filterButtons.slice(0, 3)}
              layout="vertical"
              spacing="tight"
              showCounts={false}
              size="md"
              fullWidth={true}
            />
          </div>
        </div>
      </div>

      {/* TableHeader Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          TableHeader Component
        </h3>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <TableHeader columns={tableColumns} variant="default" size="md" sticky={false} />
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    Sample Product
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                    $29.99
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status="active" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    Another Product
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                    $49.99
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status="pending" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* StatusBadge Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          StatusBadge Component
        </h3>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Status Variants
          </h4>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="active" variant="light" />
            <StatusBadge status="pending" variant="light" />
            <StatusBadge status="approved" variant="light" />
            <StatusBadge status="rejected" variant="light" />
            <StatusBadge status="in-progress" variant="light" />
            <StatusBadge status="completed" variant="light" />
            <StatusBadge status="cancelled" variant="light" />
            <StatusBadge status="archived" variant="light" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Different Badge Styles
          </h4>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="active" variant="light" />
            <StatusBadge status="active" variant="solid" />
            <StatusBadge status="active" variant="outline" />
            <StatusBadge status="active" variant="light" showIcon={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMoleculesDemo;
