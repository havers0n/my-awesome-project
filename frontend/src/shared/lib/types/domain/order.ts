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
