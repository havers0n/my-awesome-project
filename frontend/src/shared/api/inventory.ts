import { supabase } from '@/shared/lib/supabaseClient';
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

export const inventoryApi = {
  async getProductAvailability(): Promise<ApiResponse<ProductAvailability[]>> {
    try {
      const { data, error } = await supabase
        .from('product_availability')
        .select('*')
        .order('product_name');
      
      if (error) throw error;
      
      return {
        data: data,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch product availability',
        success: false
      };
    }
  },

  async getInventorySummary(): Promise<ApiResponse<InventorySummary>> {
    try {
      const { data, error } = await supabase.rpc('get_inventory_summary');
      
      if (error) throw error;
      
      return {
        data: data,
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
  },

  async getProductsPaginated(
    pagination: PaginationParams,
    filters?: Partial<ProductFilters>
  ): Promise<ApiResponse<PaginatedResponse<ProductAvailability>>> {
    try {
      const { from, to } = {
        from: (pagination.page - 1) * pagination.limit,
        to: (pagination.page - 1) * pagination.limit + pagination.limit - 1
      };

      let query = supabase
        .from('product_availability')
        .select('*', { count: 'exact' })
        .range(from, to);

      if (filters?.search) {
        query = query.ilike('product_name', `%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: {
          items: data,
          total: count || 0,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil((count || 0) / pagination.limit)
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
  },

  async updateProductAvailability(
    id: string,
    updates: Partial<ProductAvailability>
  ): Promise<ApiResponse<ProductAvailability>> {
    try {
      const { data, error } = await supabase
        .from('product_availability')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        data: data,
        success: true
      };
    } catch (error) {
      return {
        data: {} as ProductAvailability,
        error: error instanceof Error ? error.message : 'Failed to update product availability',
        success: false
      };
    }
  },

  async getShelfLocations(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('product_availability')
        .select('shelf_location')
        .not('shelf_location', 'is', null);
      
      if (error) throw error;
      
      const uniqueShelves = [...new Set(data.map((item: any) => item.shelf_location))];
      return {
        data: uniqueShelves,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch shelf locations',
        success: false
      };
    }
  },
};
