import { InventorySummary, ProductSummary } from "../model/inventoryModel";

// API functions for inventory management
export const fetchInventorySummary = async (): Promise<InventorySummary> => {
  // This would typically make an HTTP request to your backend
  // For now, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const urgentItems: ProductSummary[] = [
        { name: 'Колбаса докторская', available: 0, total: 0, status: 'out_of_stock' },
        { name: 'Рис круглозерный', available: 2, total: 8, status: 'critical' },
        { name: 'Чай черный', available: 1, total: 3, status: 'critical' },
        { name: 'Сыр российский', available: 3, total: 12, status: 'low_stock' },
        { name: 'Масло сливочное', available: 15, total: 25, status: 'low_stock' },
      ];

      resolve({
        totalProducts: 10,
        outOfStockCount: 1,
        lowStockCount: 2,
        criticalCount: 2,
        availableCount: 5,
        urgentItems: urgentItems.slice(0, 3), // Показываем только топ-3 срочных
      });
    }, 500);
  });
};

export const updateInventoryItem = async (itemId: string, newStock: number): Promise<void> => {
  // This would typically make an HTTP request to your backend
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Updated item ${itemId} to ${newStock} units`);
      resolve();
    }, 500);
  });
};

export const fetchInventoryItems = async (): Promise<ProductSummary[]> => {
  // This would typically make an HTTP request to your backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Колбаса докторская', available: 0, total: 0, status: 'out_of_stock' },
        { name: 'Рис круглозерный', available: 2, total: 8, status: 'critical' },
        { name: 'Чай черный', available: 1, total: 3, status: 'critical' },
        { name: 'Сыр российский', available: 3, total: 12, status: 'low_stock' },
        { name: 'Масло сливочное', available: 15, total: 25, status: 'low_stock' },
      ]);
    }, 500);
  });
};
