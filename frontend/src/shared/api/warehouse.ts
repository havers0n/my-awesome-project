import api from './index';

export enum ProductStatus {
  InStock = 'в наличии',
  LowStock = 'заканчивается',
  OutOfStock = 'нет в наличии',
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: 'Поступление' | 'Списание' | 'Корректировка' | 'Отчет о нехватке';
  change: number;
  newQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  shelf: string;
  category: string;
  quantity: number;
  status: ProductStatus;
  price: number;
  history: HistoryEntry[];
}

export interface ProductSnapshot {
  avgSales7d: number;
  avgSales30d: number;
  salesLag1d: number;
}

export interface Forecast {
  id: string;
  date: string;
  productName: string;
  category: string;
  forecastedQuantity: number;
  mape: number;
  mae: number;
}

export interface ForecastData {
  totalForecastedQuantity: number;
  historyEntry: Forecast;
}

export interface ComparativeForecastItem {
  productName: string;
  totalForecast: number;
  mape: number;
  mae: number;
  color: string;
}

export type ComparativeForecastData = ComparativeForecastItem[];

export interface ItemMetrics {
  productId: string;
  mape: number;
  mae: number;
}

export interface OverallMetrics {
  avgMape: number;
  avgMae: number;
}

const WAREHOUSE_API_URL = '/warehouse';

export const warehouseApi = {
  async fetchProducts(): Promise<Product[]> {
    const response = await api.get(`${WAREHOUSE_API_URL}/products`);
    return response.data;
  },

  async addProduct(productData: Omit<Product, 'id' | 'status' | 'history'>): Promise<Product> {
    const response = await api.post(`${WAREHOUSE_API_URL}/products`, productData);
    return response.data;
  },

  async updateProductQuantity(productId: string, newQuantity: number, type: HistoryEntry['type']): Promise<Product> {
    const response = await api.put(`${WAREHOUSE_API_URL}/products/${productId}/quantity`, { newQuantity, type });
    return response.data;
  },

  async deleteProduct(productId: string): Promise<{ id: string }> {
    await api.delete(`${WAREHOUSE_API_URL}/products/${productId}`);
    return { id: productId };
  },

  async fetchProductSnapshot(productId: string): Promise<ProductSnapshot> {
    const response = await api.get(`${WAREHOUSE_API_URL}/products/${productId}/snapshot`);
    return response.data;
  },

  async requestSalesForecast(days: number, product: Product, priceOverride?: number): Promise<ForecastData> {
    const response = await api.post(`${WAREHOUSE_API_URL}/forecast`, { days, product, priceOverride });
    return response.data;
  },

  async requestComparativeForecast(products: Product[], days: number): Promise<ComparativeForecastData> {
    const response = await api.post(`${WAREHOUSE_API_URL}/forecast/comparative`, { products, days });
    return response.data;
  },

  async fetchOverallMetrics(): Promise<OverallMetrics> {
    const response = await api.get(`${WAREHOUSE_API_URL}/metrics/overall`);
    return response.data;
  },

  async fetchItemMetrics(): Promise<ItemMetrics[]> {
    const response = await api.get(`${WAREHOUSE_API_URL}/metrics/items`);
    return response.data;
  },
};

