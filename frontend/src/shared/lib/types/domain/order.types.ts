/**
 * Order entity types and models
 * Contains all business logic related to orders
 */

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'В ожидании',
  [OrderStatus.CONFIRMED]: 'Подтверждено',
  [OrderStatus.PROCESSING]: 'Обрабатывается',
  [OrderStatus.SHIPPED]: 'Отправлено',
  [OrderStatus.DELIVERED]: 'Доставлено',
  [OrderStatus.CANCELLED]: 'Отменено',
  [OrderStatus.REFUNDED]: 'Возвращено',
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
};

// Order utility functions
export const getOrderTotal = (order: Order): number => {
  return order.items.reduce((total, item) => total + item.subtotal, 0);
};

export const getOrderItemsCount = (order: Order): number => {
  return order.items.reduce((total, item) => total + item.quantity, 0);
};

export const isOrderActive = (order: Order): boolean => {
  return ![OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(order.status);
};

export const canCancelOrder = (order: Order): boolean => {
  return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status);
};

export const getOrderStatusConfig = (status: OrderStatus) => {
  const baseConfig = {
    [OrderStatus.PENDING]: { icon: '⏳', text: 'Pending', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', iconColor: 'text-yellow-500', borderColor: 'border-yellow-200' },
    [OrderStatus.CONFIRMED]: { icon: '✓', text: 'Confirmed', bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-500', borderColor: 'border-blue-200' },
    [OrderStatus.PROCESSING]: { icon: '⚙️', text: 'Processing', bgColor: 'bg-purple-50', textColor: 'text-purple-700', iconColor: 'text-purple-500', borderColor: 'border-purple-200' },
    [OrderStatus.SHIPPED]: { icon: '📦', text: 'Shipped', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', iconColor: 'text-indigo-500', borderColor: 'border-indigo-200' },
    [OrderStatus.DELIVERED]: { icon: '✅', text: 'Delivered', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', borderColor: 'border-green-200' },
    [OrderStatus.CANCELLED]: { icon: '❌', text: 'Cancelled', bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-500', borderColor: 'border-red-200' },
    [OrderStatus.REFUNDED]: { icon: '💰', text: 'Refunded', bgColor: 'bg-gray-50', textColor: 'text-gray-700', iconColor: 'text-gray-500', borderColor: 'border-gray-200' }
  };
  
  return baseConfig[status] || baseConfig[OrderStatus.PENDING];
};
