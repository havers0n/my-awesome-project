/**
 * Order entity API methods
 * Contains all API calls related to orders
 */

import axios from "axios";
import { Order, OrderStatus } from "../model/types";

const API_BASE_URL = '/api';

export interface OrderFilters {
  search?: string;
  status?: OrderStatus | 'all';
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const orderApi = {
  // Get all orders with optional filters
  getOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await axios.get(`${API_BASE_URL}/orders?${params.toString()}`);
    return response.data;
  },

  // Get order by ID
  getOrder: async (id: string): Promise<Order> => {
    const response = await axios.get(`${API_BASE_URL}/orders/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> => {
    const response = await axios.post(`${API_BASE_URL}/orders`, order);
    return response.data;
  },

  // Update order
  updateOrder: async (id: string, order: Partial<Order>): Promise<Order> => {
    const response = await axios.put(`${API_BASE_URL}/orders/${id}`, order);
    return response.data;
  },

  // Delete order
  deleteOrder: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/orders/${id}`);
  },

  // Update order status
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await axios.patch(`${API_BASE_URL}/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<Order> => {
    const response = await axios.patch(`${API_BASE_URL}/orders/${id}/cancel`);
    return response.data;
  },

  // Get order by customer
  getOrdersByCustomer: async (customerId: string): Promise<Order[]> => {
    const response = await axios.get(`${API_BASE_URL}/orders/customer/${customerId}`);
    return response.data;
  },

  // Get recent orders
  getRecentOrders: async (limit: number = 10): Promise<Order[]> => {
    const response = await axios.get(`${API_BASE_URL}/orders/recent?limit=${limit}`);
    return response.data;
  },

  // Get order statistics
  getOrderStatistics: async (): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  }> => {
    const response = await axios.get(`${API_BASE_URL}/orders/statistics`);
    return response.data;
  }
};
