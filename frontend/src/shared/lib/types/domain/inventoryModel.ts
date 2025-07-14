// Types and interfaces for inventory management
export interface ProductSummary {
  name: string;
  available: number;
  total: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'critical';
}

export interface InventorySummary {
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  criticalCount: number;
  availableCount: number;
  urgentItems: ProductSummary[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  targetStock: number;
  minimumStock: number;
  unit: string;
  price: number;
  lastUpdated: Date;
  status: ProductSummary['status'];
}

// Utility functions
export const calculateStockStatus = (current: number, minimum: number, target: number): ProductSummary['status'] => {
  if (current === 0) return 'out_of_stock';
  if (current <= minimum) return 'critical';
  if (current < target * 0.3) return 'low_stock';
  return 'available';
};

export const getStatusColor = (status: ProductSummary['status']): string => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'low_stock':
      return 'bg-yellow-100 text-yellow-800';
    case 'critical':
      return 'bg-orange-100 text-orange-800';
    case 'out_of_stock':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: ProductSummary['status']): string => {
  switch (status) {
    case 'available':
      return '✅';
    case 'low_stock':
      return '⚠️';
    case 'critical':
      return '🔶';
    case 'out_of_stock':
      return '❌';
    default:
      return '❓';
  }
};
