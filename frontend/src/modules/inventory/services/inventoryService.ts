/**
 * Inventory Service
 * 
 * This service handles all API interactions for inventory management.
 * It provides methods for fetching, creating, updating, and deleting inventory data.
 */

import { supabase } from '@/services/supabaseClient';
import type {
  ProductAvailability,
  InventorySummary,
  ProductSummary,
  ProductFilters,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  ProductStatus
} from '../types';

// =====================================================
// MOCK DATA GENERATORS (for development)
// =====================================================

/**
 * Generates mock product availability data for development/testing
 */
function generateMockProductData(): ProductAvailability[] {
  const products = [
    'Колбаса докторская', 'Сыр российский', 'Молоко 3.2%', 'Хлеб белый',
    'Масло сливочное', 'Яйца куриные', 'Рис круглозерный', 'Гречка ядрица',
    'Чай черный', 'Кофе растворимый', 'Сахар белый', 'Соль поваренная',
    'Макароны спагетти', 'Мука пшеничная', 'Картофель', 'Лук репчатый',
    'Морковь', 'Капуста белокочанная', 'Помидоры', 'Огурцы'
  ];

  const shelves = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2'];
  
  return products.map((name, index) => {
    const totalStock = Math.floor(Math.random() * 50) + 10;
    const reservedStock = Math.floor(Math.random() * 5);
    const availableStock = Math.floor(Math.random() * totalStock);
    
    let status: ProductStatus;
    const stockPercentage = availableStock / totalStock;
    
    if (availableStock === 0) {
      status = 'out_of_stock';
    } else if (stockPercentage < 0.1) {
      status = 'critical';
    } else if (stockPercentage < 0.3) {
      status = 'low_stock';
    } else {
      status = 'available';
    }

    return {
      id: `product-${index + 1}`,
      product_name: name,
      total_stock: totalStock,
      available_stock: availableStock,
      reserved_stock: reservedStock,
      last_restock_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      out_of_stock_hours: status === 'out_of_stock' ? Math.floor(Math.random() * 72) : 0,
      status,
      shelf_location: shelves[Math.floor(Math.random() * shelves.length)]
    };
  });
}

/**
 * Generates mock inventory summary data
 */
function generateMockSummaryData(products: ProductAvailability[]): InventorySummary {
  const statusCounts = products.reduce((acc, product) => {
    acc[product.status] = (acc[product.status] || 0) + 1;
    return acc;
  }, {} as Record<ProductStatus, number>);

  const urgentItems: ProductSummary[] = products
    .filter(p => p.status === 'out_of_stock' || p.status === 'critical' || p.status === 'low_stock')
    .slice(0, 5)
    .map(p => ({
      name: p.product_name,
      available: p.available_stock,
      total: p.total_stock,
      status: p.status
    }));

  return {
    totalProducts: products.length,
    outOfStockCount: statusCounts.out_of_stock || 0,
    lowStockCount: statusCounts.low_stock || 0,
    criticalCount: statusCounts.critical || 0,
    availableCount: statusCounts.available || 0,
    urgentItems
  };
}

// =====================================================
// API METHODS
// =====================================================

/**
 * Fetches all product availability data
 */
export async function getProductAvailability(): Promise<ApiResponse<ProductAvailability[]>> {
  try {
    // TODO: Replace with actual API call to Supabase
    // const { data, error } = await supabase
    //   .from('product_availability')
    //   .select('*')
    //   .order('product_name');
    
    // if (error) throw error;
    
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const mockData = generateMockProductData();
    
    return {
      data: mockData,
      success: true
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch product availability',
      success: false
    };
  }
}

/**
 * Fetches inventory summary statistics
 */
export async function getInventorySummary(): Promise<ApiResponse<InventorySummary>> {
  try {
    // TODO: Replace with actual API call to get aggregated data
    // For now, generate from mock product data
    const productResponse = await getProductAvailability();
    
    if (!productResponse.success) {
      throw new Error(productResponse.error);
    }
    
    const summary = generateMockSummaryData(productResponse.data);
    
    return {
      data: summary,
      success: true
    };
  } catch (error) {
    return {
      data: {
        totalProducts: 0,
        outOfStockCount: 0,
        lowStockCount: 0,
        criticalCount: 0,
        availableCount: 0,
        urgentItems: []
      },
      error: error instanceof Error ? error.message : 'Failed to fetch inventory summary',
      success: false
    };
  }
}

/**
 * Fetches paginated product availability data with filters
 */
export async function getProductsPaginated(
  pagination: PaginationParams,
  filters?: Partial<ProductFilters>
): Promise<ApiResponse<PaginatedResponse<ProductAvailability>>> {
  try {
    // TODO: Implement actual pagination and filtering with Supabase
    const allProductsResponse = await getProductAvailability();
    
    if (!allProductsResponse.success) {
      throw new Error(allProductsResponse.error);
    }
    
    let filteredProducts = allProductsResponse.data;
    
    // Apply filters
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.product_name.toLowerCase().includes(searchLower) ||
          p.shelf_location.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.status && filters.status !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.status === filters.status);
      }
      
      if (filters.shelfLocation && filters.shelfLocation !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.shelf_location === filters.shelfLocation);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
          let compareValue = 0;
          
          switch (filters.sortBy) {
            case 'name':
              compareValue = a.product_name.localeCompare(b.product_name);
              break;
            case 'quantity':
              compareValue = a.available_stock - b.available_stock;
              break;
            case 'location':
              compareValue = a.shelf_location.localeCompare(b.shelf_location);
              break;
            case 'status':
              const statusOrder = { out_of_stock: 0, critical: 1, low_stock: 2, available: 3 };
              compareValue = statusOrder[a.status] - statusOrder[b.status];
              break;
          }
          
          return filters.sortOrder === 'desc' ? -compareValue : compareValue;
        });
      }
    }
    
    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedItems = filteredProducts.slice(startIndex, endIndex);
    
    return {
      data: {
        items: paginatedItems,
        total: filteredProducts.length,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(filteredProducts.length / pagination.limit)
      },
      success: true
    };
  } catch (error) {
    return {
      data: {
        items: [],
        total: 0,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: 0
      },
      error: error instanceof Error ? error.message : 'Failed to fetch paginated products',
      success: false
    };
  }
}

/**
 * Updates a product's availability data
 */
export async function updateProductAvailability(
  id: string,
  updates: Partial<ProductAvailability>
): Promise<ApiResponse<ProductAvailability>> {
  try {
    // TODO: Implement actual update with Supabase
    // const { data, error } = await supabase
    //   .from('product_availability')
    //   .update(updates)
    //   .eq('id', id)
    //   .select()
    //   .single();
    
    // if (error) throw error;
    
    // For now, simulate update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock response - in real implementation, return the updated record from DB
    const mockUpdatedProduct: ProductAvailability = {
      id,
      product_name: 'Updated Product',
      total_stock: 50,
      available_stock: 25,
      reserved_stock: 5,
      last_restock_date: new Date().toISOString(),
      out_of_stock_hours: 0,
      status: 'available',
      shelf_location: 'A1',
      ...updates
    };
    
    return {
      data: mockUpdatedProduct,
      success: true
    };
  } catch (error) {
    return {
      data: {} as ProductAvailability,
      error: error instanceof Error ? error.message : 'Failed to update product availability',
      success: false
    };
  }
}

/**
 * Gets unique shelf locations for filtering
 */
export async function getShelfLocations(): Promise<ApiResponse<string[]>> {
  try {
    // TODO: Replace with actual API call
    // const { data, error } = await supabase
    //   .from('product_availability')
    //   .select('shelf_location')
    //   .not('shelf_location', 'is', null);
    
    // if (error) throw error;
    
    // For now, return mock shelf locations
    const mockShelves = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2'];
    
    return {
      data: mockShelves,
      success: true
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch shelf locations',
      success: false
    };
  }
}

// =====================================================
// EXPORTED SERVICE OBJECT
// =====================================================

export const inventoryService = {
  getProductAvailability,
  getInventorySummary,
  getProductsPaginated,
  updateProductAvailability,
  getShelfLocations,
  
  // Utility functions
  generateMockProductData,
  generateMockSummaryData
};
