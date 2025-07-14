import { useState, useCallback } from "react";
import { Order, OrderFilters } from "@/shared/types/order";

// Мок данные для заказов
const mockOrders: Order[] = [
  {
    id: 1001,
    customer: {
      name: 'Иван Петров',
      email: 'ivan.petrov@example.com'
    },
    status: 'pending',
    total: 2500.00,
    date: '2024-01-15T10:30:00Z'
  },
  {
    id: 1002,
    customer: {
      name: 'Мария Сидорова',
      email: 'maria.sidorova@example.com'
    },
    status: 'processing',
    total: 1750.50,
    date: '2024-01-14T14:20:00Z'
  },
  {
    id: 1003,
    customer: {
      name: 'Алексей Козлов',
      email: 'alexey.kozlov@example.com'
    },
    status: 'shipped',
    total: 3200.00,
    date: '2024-01-13T09:15:00Z'
  },
  {
    id: 1004,
    customer: {
      name: 'Елена Васильева',
      email: 'elena.vasileva@example.com'
    },
    status: 'delivered',
    total: 899.99,
    date: '2024-01-12T16:45:00Z'
  },
  {
    id: 1005,
    customer: {
      name: 'Дмитрий Смирнов',
      email: 'dmitry.smirnov@example.com'
    },
    status: 'cancelled',
    total: 1200.00,
    date: '2024-01-11T11:30:00Z'
  }
];

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  createOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrder: (id: number, updates: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: number) => Promise<void>;
  getOrderById: (id: number) => Order | undefined;
}

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (filters?: OrderFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredOrders = [...mockOrders];
      
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.status === filters.status);
        }
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredOrders = filteredOrders.filter(order => 
            order.customer.name.toLowerCase().includes(searchTerm) ||
            order.customer.email.toLowerCase().includes(searchTerm) ||
            order.id.toString().includes(searchTerm)
          );
        }
      }
      
      setOrders(filteredOrders);
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error('Ошибка при загрузке заказов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData: Partial<Order>): Promise<Order> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newOrder: Order = {
        id: Math.max(...mockOrders.map(o => o.id)) + 1,
        customer: orderData.customer || { name: '', email: '' },
        status: orderData.status || 'pending',
        total: orderData.total || 0,
        date: new Date().toISOString(),
        ...orderData
      };
      
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError('Ошибка при создании заказа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = useCallback(async (id: number, updates: Partial<Order>): Promise<Order> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, ...updates } : order
      ));
      
      const updatedOrder = orders.find(order => order.id === id);
      if (!updatedOrder) {
        throw new Error('Заказ не найден');
      }
      
      return { ...updatedOrder, ...updates };
    } catch (err) {
      setError('Ошибка при обновлении заказа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orders]);

  const deleteOrder = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      setError('Ошибка при удалении заказа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderById = useCallback((id: number): Order | undefined => {
    return orders.find(order => order.id === id);
  }, [orders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderById
  };
};
