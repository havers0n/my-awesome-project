import React, { useState, memo, useMemo } from 'react';
import { OrdersTableHeader } from '../../organisms/OrdersTableHeader';
import { OrdersTable } from '../../organisms/OrdersTable';

// Memoized for performance optimization
const MemoizedOrdersTable = memo(OrdersTable);
const MemoizedOrdersTableHeader = memo(OrdersTableHeader);

// Define the TypeScript interface for the order data
interface Order {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  status: 'Delivered' | 'Pending' | 'Canceled';
  image: string;
}

// Default table data
const defaultOrdersData: Order[] = [
  {
    id: 1,
    name: 'MacBook Pro 13”',
    variants: '2 Variants',
    category: 'Laptop',
    price: '$2399.00',
    status: 'Delivered',
    image: '/images/product/product-01.jpg',
  },
  {
    id: 2,
    name: 'Apple Watch Ultra',
    variants: '1 Variant',
    category: 'Watch',
    price: '$879.00',
    status: 'Pending',
    image: '/images/product/product-02.jpg',
  },
  {
    id: 3,
    name: 'iPhone 15 Pro Max',
    variants: '2 Variants',
    category: 'SmartPhone',
    price: '$1869.00',
    status: 'Delivered',
    image: '/images/product/product-03.jpg',
  },
  {
    id: 4,
    name: 'iPad Pro 3rd Gen',
    variants: '2 Variants',
    category: 'Electronics',
    price: '$1699.00',
    status: 'Canceled',
    image: '/images/product/product-04.jpg',
  },
  {
    id: 5,
    name: 'AirPods Pro 2nd Gen',
    variants: '1 Variant',
    category: 'Accessories',
    price: '$240.00',
    status: 'Delivered',
    image: '/images/product/product-05.jpg',
  },
];

export interface RecentOrdersWidgetProps {
  /** Данные заказов */
  orders?: Order[];
  /** Заголовок виджета */
  title?: string;
  /** Подзаголовок виджета */
  subtitle?: string;
  /** Показывать чекбоксы */
  showCheckboxes?: boolean;
  /** Показывать фильтр */
  showFilter?: boolean;
  /** Показывать кнопку экспорта */
  showExport?: boolean;
  /** Показывать кнопку "Смотреть все" */
  showViewAll?: boolean;
  /** Обработчик клика на строку заказа */
  onOrderClick?: (order: Order) => void;
  /** Обработчик клика на кнопку фильтра */
  onFilterClick?: () => void;
  /** Обработчик клика на кнопку "Смотреть все" */
  onViewAllClick?: () => void;
  /** Обработчик клика на кнопку экспорта */
  onExportClick?: () => void;
  /** Обработчик обновления данных */
  onRefresh?: () => void;
  /** Максимальное количество отображаемых заказов */
  maxItems?: number;
  /** Состояние загрузки */
  loading?: boolean;
  /** Пустое состояние */
  empty?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
}

export const RecentOrdersWidget: React.FC<RecentOrdersWidgetProps> = ({
  orders = defaultOrdersData,
  title = 'Последние заказы',
  subtitle,
  showCheckboxes = false,
  showFilter = true,
  showExport = false,
  showViewAll = true,
  onOrderClick,
  onFilterClick,
  onViewAllClick,
  onExportClick,
  onRefresh,
  maxItems = 10,
  loading = false,
  empty = false,
  className = '',
}) => {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState(0);

  // Memoized to prevent unnecessary re-renders
  const displayedOrders = useMemo(() => {
    return orders.slice(0, maxItems);
  }, [orders, maxItems]);

  // Memoized header props
  const headerProps = useMemo(
    () => ({
      title,
      subtitle,
      totalCount: orders.length,
      activeFiltersCount: activeFilters,
      showExport,
      showRefresh: true,
      showFilter,
      showViewAll,
      loading,
    }),
    [title, subtitle, orders.length, activeFilters, showExport, showFilter, showViewAll, loading]
  );

  // Memoized table props
  const tableProps = useMemo(
    () => ({
      orders: displayedOrders,
      onRowClick,
      showCheckboxes,
      selectedOrders,
      onSelectionChange: setSelectedOrders,
      loading,
      empty,
      emptyText: 'Нет доступных заказов',
      className: 'border-0 rounded-none bg-transparent',
    }),
    [displayedOrders, onRowClick, showCheckboxes, selectedOrders, loading, empty]
  );

  const handleFilterClick = () => {
    // Simulate filter toggle
    setActiveFilters(prev => (prev > 0 ? 0 : 1));
    onFilterClick?.();
  };

  const handleRefresh = () => {
    // Reset selections on refresh
    setSelectedOrders([]);
    onRefresh?.();
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 ${className}`}
    >
      {/* Header */}
      <MemoizedOrdersTableHeader
        {...headerProps}
        onFilterClick={handleFilterClick}
        onViewAllClick={onViewAllClick}
        onExportClick={onExportClick}
        onRefreshClick={handleRefresh}
      />

      {/* Table */}
      <MemoizedOrdersTable {...tableProps} onRowClick={onOrderClick} />
    </div>
  );
};

export default RecentOrdersWidget;
