/**
 * Product entity API methods
 * Contains all API calls related to products
 */

import axios from "axios";
import { Product, ProductStatus } from "../model/types";

const API_BASE_URL = '/api';

export interface ProductFilters {
  search?: string;
  status?: ProductStatus | 'all';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
}

export const productApi = {
  // Get all products with optional filters
  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.lowStock) params.append('lowStock', 'true');
    
    const response = await axios.get(`${API_BASE_URL}/products?${params.toString()}`);
    return response.data;
  },

  // Get product by ID
  getProduct: async (id: string): Promise<Product> => {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const response = await axios.post(`${API_BASE_URL}/products`, product);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await axios.put(`${API_BASE_URL}/products/${id}`, product);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/products/${id}`);
  },

  // Update product status
  updateProductStatus: async (id: string, status: ProductStatus): Promise<Product> => {
    const response = await axios.patch(`${API_BASE_URL}/products/${id}/status`, { status });
    return response.data;
  },

  // Update product stock
  updateProductStock: async (id: string, quantity: number): Promise<Product> => {
    const response = await axios.patch(`${API_BASE_URL}/products/${id}/stock`, { quantity });
    return response.data;
  },

  // Get product categories
  getProductCategories: async (): Promise<string[]> => {
    const response = await axios.get(`${API_BASE_URL}/products/categories`);
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`);
    return response.data;
  },

  // Get out of stock products
  getOutOfStockProducts: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/products/out-of-stock`);
    return response.data;
  },

  // Bulk update products
  bulkUpdateProducts: async (updates: Array<{ id: string; data: Partial<Product> }>): Promise<Product[]> => {
    const response = await axios.patch(`${API_BASE_URL}/products/bulk-update`, { updates });
    return response.data;
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
