export interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  date: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderFilters {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderSortOptions {
  field: keyof Order;
  direction: 'asc' | 'desc';
}
