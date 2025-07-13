import React from 'react';
import { Typography } from '../../atoms/Typography';
import { Table, TableBody } from '../../ui/table';
import { OrdersTableRow } from '../../molecules/OrdersTableRow';
import { OrdersTableHeaderRow } from '../../molecules/OrdersTableHeaderRow';
import { Order } from '../../../types/order';

// Legacy interface for backward compatibility
// TODO: Replace with proper Order type from types/order.ts
interface LegacyOrder {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  status: 'Delivered' | 'Pending' | 'Canceled';
  image: string;
}

export interface OrdersTableProps {
  /** Данные заказов */
  orders: Order[];
  /** Обработчик клика на строку */
  onRowClick?: (order: Order) => void;
  /** Показывать чекбоксы */
  showCheckboxes?: boolean;
  /** Выбранные заказы */
  selectedOrders?: number[];
  /** Обработчик изменения выбора */
  onSelectionChange?: (selectedIds: number[]) => void;
  /** Состояние загрузки */
  loading?: boolean;
  /** Пустое состояние */
  empty?: boolean;
  /** Текст для пустого состояния */
  emptyText?: string;
  /** Дополнительные CSS классы */
  className?: string;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onRowClick,
  showCheckboxes = false,
  selectedOrders = [],
  onSelectionChange,
  loading = false,
  empty = false,
  emptyText = 'Нет доступных заказов',
  className = '',
}) => {
  const handleOrderSelection = (orderId: number, checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = checked
      ? [...selectedOrders, orderId]
      : selectedOrders.filter(id => id !== orderId);

    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? orders.map(o => o.id) : []);
  };

  if (loading) {
    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <Typography variant="span" size="sm" color="muted" className="ml-3">
            Загрузка...
          </Typography>
        </div>
      </div>
    );
  }

  if (empty || orders.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <Typography variant="h4" size="lg" weight="medium" color="muted">
            {emptyText}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <OrdersTableHeaderRow
            showCheckboxes={showCheckboxes}
            allSelected={selectedOrders.length === orders.length && orders.length > 0}
            onSelectAll={handleSelectAll}
          />

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map(order => (
              <OrdersTableRow
                key={order.id}
                order={order}
                onRowClick={onRowClick}
                showCheckbox={showCheckboxes}
                checked={selectedOrders.includes(order.id)}
                onCheckedChange={checked => handleOrderSelection(order.id, checked)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersTable;
