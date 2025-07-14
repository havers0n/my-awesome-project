import React, { useState, useEffect } from "react";
import { OrdersTable } from "@/shared/ui/organisms/OrdersTable";
import { Order } from "@/shared/types/order";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { Card } from "@/shared/ui/atoms/Card";
import { Typography } from "@/shared/ui/atoms/Typography";
import { Button } from "@/shared/ui/atoms/Button";

interface OrdersTableWidgetProps {
  /** Заголовок виджета */
  title?: string;
  /** Подзаголовок виджета */
  subtitle?: string;
  /** Показать действия */
  showActions?: boolean;
  /** Максимальное количество заказов для отображения */
  maxOrders?: number;
  /** Показать чекбоксы для выбора */
  showCheckboxes?: boolean;
  /** Обработчик клика на заказ */
  onOrderClick?: (order: Order) => void;
  /** Обработчик выбора заказов */
  onOrdersSelect?: (orders: Order[]) => void;
  /** Дополнительные CSS классы */
  className?: string;
  /** Размер виджета */
  size?: 'sm' | 'md' | 'lg';
  /** Вариант отображения */
  variant?: 'default' | 'elevated' | 'outlined';
}

export const OrdersTableWidget: React.FC<OrdersTableWidgetProps> = ({
  title = "Заказы",
  subtitle = "Управление заказами",
  showActions = true,
  maxOrders,
  showCheckboxes = false,
  onOrderClick,
  onOrdersSelect,
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const { orders, loading, error, fetchOrders, updateOrder, deleteOrder } = useOrders();
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderSelection = (selectedIds: number[]) => {
    setSelectedOrders(selectedIds);
    if (onOrdersSelect) {
      const selectedOrdersData = orders.filter(order => selectedIds.includes(order.id));
      onOrdersSelect(selectedOrdersData);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'archive') => {
    if (selectedOrders.length === 0) return;

    try {
      await Promise.all(
        selectedOrders.map(orderId => {
          if (action === 'delete') {
            return deleteOrder(orderId);
          }
          // Для archive нужно будет реализовать соответствующий метод
          return Promise.resolve();
        })
      );
      setSelectedOrders([]);
    } catch (error) {
      console.error('Ошибка при выполнении массового действия:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedOrders = maxOrders ? filteredOrders.slice(0, maxOrders) : filteredOrders;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Typography variant="h3" size="lg" weight="semibold" color="primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="p" size="sm" color="secondary" className="mt-1">
            {subtitle}
          </Typography>
        )}
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                Удалить ({selectedOrders.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('archive')}
              >
                Архивировать ({selectedOrders.length})
              </Button>
            </div>
          )}
          <Button variant="primary" size="sm">
            Создать заказ
          </Button>
        </div>
      )}
    </div>
  );

  const renderFilters = () => (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-1 max-w-sm">
        <input
          type="text"
          placeholder="Поиск по имени клиента или ID заказа..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      >
        <option value="all">Все статусы</option>
        <option value="pending">Ожидание</option>
        <option value="processing">Обработка</option>
        <option value="shipped">Отправлен</option>
        <option value="delivered">Доставлен</option>
        <option value="cancelled">Отменен</option>
      </select>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <Typography variant="p" size="sm" color="secondary">
          Всего заказов
        </Typography>
        <Typography variant="h4" size="lg" weight="bold" color="primary">
          {orders.length}
        </Typography>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <Typography variant="p" size="sm" color="secondary">
          В обработке
        </Typography>
        <Typography variant="h4" size="lg" weight="bold" color="primary">
          {orders.filter(o => o.status === 'processing').length}
        </Typography>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <Typography variant="p" size="sm" color="secondary">
          Доставлено
        </Typography>
        <Typography variant="h4" size="lg" weight="bold" color="primary">
          {orders.filter(o => o.status === 'delivered').length}
        </Typography>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <Typography variant="p" size="sm" color="secondary">
          Ожидание
        </Typography>
        <Typography variant="h4" size="lg" weight="bold" color="primary">
          {orders.filter(o => o.status === 'pending').length}
        </Typography>
      </div>
    </div>
  );

  if (error) {
    return (
      <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
        <div className="text-center py-8">
          <Typography variant="h4" color="error" className="mb-2">
            Ошибка загрузки заказов
          </Typography>
          <Typography variant="p" color="secondary" className="mb-4">
            {error}
          </Typography>
          <Button variant="primary" onClick={() => fetchOrders()}>
            Попробовать снова
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
      {renderHeader()}
      {showActions && renderFilters()}
      {showActions && renderStats()}
      
      <OrdersTable
        orders={displayedOrders}
        onRowClick={onOrderClick}
        showCheckboxes={showCheckboxes}
        selectedOrders={selectedOrders}
        onSelectionChange={handleOrderSelection}
        loading={loading}
        empty={displayedOrders.length === 0}
        emptyText={searchTerm || statusFilter !== 'all' ? 'Заказы не найдены' : 'Нет заказов'}
      />
      
      {maxOrders && orders.length > maxOrders && (
        <div className="mt-4 text-center">
          <Typography variant="p" size="sm" color="secondary">
            Показано {maxOrders} из {orders.length} заказов
          </Typography>
          <Button variant="ghost" size="sm" className="ml-2">
            Показать все
          </Button>
        </div>
      )}
    </Card>
  );
};
