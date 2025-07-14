/**
 * Product entity types and models
 * Contains all business logic related to products
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  status: ProductStatus;
  category?: string;
  sku?: string;
  created_at: string;
  updated_at: string;
  // Additional fields from dashboard
  product_name?: string;
  shelf_location?: string;
  available_stock?: number;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  // Additional statuses from dashboard
  Available = 'available',
  LowStock = 'low_stock',
  Critical = 'critical'
}

export const ProductStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'Активный',
  [ProductStatus.INACTIVE]: 'Неактивный',
  [ProductStatus.PENDING]: 'В ожидании',
  [ProductStatus.OUT_OF_STOCK]: 'Нет в наличии',
  [ProductStatus.DISCONTINUED]: 'Снят с производства',
  [ProductStatus.Available]: 'Доступен',
  [ProductStatus.LowStock]: 'Мало на складе',
  [ProductStatus.Critical]: 'Критический уровень'
};

export const ProductStatusColors: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProductStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
  [ProductStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ProductStatus.OUT_OF_STOCK]: 'bg-red-100 text-red-800',
  [ProductStatus.DISCONTINUED]: 'bg-red-100 text-red-800',
  [ProductStatus.Available]: 'bg-green-100 text-green-800',
  [ProductStatus.LowStock]: 'bg-yellow-100 text-yellow-800',
  [ProductStatus.Critical]: 'bg-red-100 text-red-800'
};

// Product utility functions
export const getProductDisplayName = (product: Product): string => {
  return product.name || product.product_name || 'Unknown Product';
};

export const getProductStock = (product: Product): number => {
  return product.available_stock || product.quantity || 0;
};

export const isProductLowStock = (product: Product, threshold: number = 10): boolean => {
  return getProductStock(product) <= threshold;
};

export const isProductOutOfStock = (product: Product): boolean => {
  return getProductStock(product) === 0;
};

export const getProductStatusConfig = (status: ProductStatus) => {
  const baseConfig = {
    [ProductStatus.ACTIVE]: { icon: '✓', text: 'Active', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', borderColor: 'border-green-200' },
    [ProductStatus.INACTIVE]: { icon: '○', text: 'Inactive', bgColor: 'bg-gray-50', textColor: 'text-gray-700', iconColor: 'text-gray-500', borderColor: 'border-gray-200' },
    [ProductStatus.PENDING]: { icon: '⏳', text: 'Pending', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', iconColor: 'text-yellow-500', borderColor: 'border-yellow-200' },
    [ProductStatus.OUT_OF_STOCK]: { icon: '⚠', text: 'Out of Stock', bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-500', borderColor: 'border-red-200' },
    [ProductStatus.DISCONTINUED]: { icon: '❌', text: 'Discontinued', bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-500', borderColor: 'border-red-200' },
    [ProductStatus.Available]: { icon: '✓', text: 'Available', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', borderColor: 'border-green-200' },
    [ProductStatus.LowStock]: { icon: '⚠', text: 'Low Stock', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', iconColor: 'text-yellow-500', borderColor: 'border-yellow-200' },
    [ProductStatus.Critical]: { icon: '⚠', text: 'Critical', bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-500', borderColor: 'border-red-200' }
  };
  
  return baseConfig[status] || baseConfig[ProductStatus.INACTIVE];
};
