/**
 * Inventory Module - Type Definitions
 * 
 * This file contains all type definitions for the inventory management module.
 * These types are used across components, services, and hooks within the inventory domain.
 */

// =====================================================
// CORE INVENTORY TYPES
// =====================================================

/**
 * Product availability status
 */
export type ProductStatus = 'available' | 'low_stock' | 'critical' | 'out_of_stock';

/**
 * Main product availability interface
 */
export interface ProductAvailability {
  id: string;
  product_name: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  last_restock_date: string;
  out_of_stock_hours: number;
  status: ProductStatus;
  shelf_location: string;
}

/**
 * Product summary for widgets and quick views
 */
export interface ProductSummary {
  name: string;
  available: number;
  total: number;
  status: ProductStatus;
}

/**
 * Inventory summary statistics
 */
export interface InventorySummary {
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  criticalCount: number;
  availableCount: number;
  urgentItems: ProductSummary[];
}

// =====================================================
// OUT OF STOCK TRACKING
// =====================================================

/**
 * Out of stock record interface (extending existing outOfStockService)
 */
export interface OutOfStockRecord {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  product_name: string;
  hours: number;
  minutes: number;
  created_at?: string;
}

// =====================================================
// FILTERING AND SEARCH
// =====================================================

/**
 * Product filter options
 */
export interface ProductFilters {
  search: string;
  status: ProductStatus | 'all';
  shelfLocation: string; // 'all' or specific shelf
  sortBy: 'name' | 'quantity' | 'status' | 'location';
  sortOrder: 'asc' | 'desc';
}

/**
 * Date range filter for historical data
 */
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

// =====================================================
// API INTERFACES
// =====================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =====================================================
// COMPONENT PROPS
// =====================================================

/**
 * Props for ShelfAvailabilityMenu component
 */
export interface ShelfAvailabilityMenuProps {
  onProductSelect?: (product: ProductAvailability) => void;
  showFilters?: boolean;
  compact?: boolean;
}

/**
 * Props for ShelfAvailabilityWidget component
 */
export interface ShelfAvailabilityWidgetProps {
  refreshInterval?: number; // in milliseconds
  maxUrgentItems?: number;
}

/**
 * Props for ProductDetailModal component
 */
export interface ProductDetailModalProps {
  product: ProductAvailability | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (product: ProductAvailability) => void;
}

// =====================================================
// HOOK RETURN TYPES
// =====================================================

/**
 * Return type for useInventoryData hook
 */
export interface UseInventoryDataReturn {
  products: ProductAvailability[];
  summary: InventorySummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProduct: (id: string, updates: Partial<ProductAvailability>) => Promise<void>;
}

/**
 * Return type for useInventoryFilters hook
 */
export interface UseInventoryFiltersReturn {
  filters: ProductFilters;
  updateFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  resetFilters: () => void;
  filteredProducts: ProductAvailability[];
}

/**
 * Return type for useOutOfStockTracking hook
 */
export interface UseOutOfStockTrackingReturn {
  records: OutOfStockRecord[];
  loading: boolean;
  error: string | null;
  addRecord: (record: Omit<OutOfStockRecord, 'id' | 'created_at'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsByDate: (date: string) => OutOfStockRecord[];
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Status color mapping
 */
export const STATUS_COLORS: Record<ProductStatus, string> = {
  available: 'bg-green-100 text-green-800',
  low_stock: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-orange-100 text-orange-800',
  out_of_stock: 'bg-red-100 text-red-800',
} as const;

/**
 * Status icons mapping
 */
export const STATUS_ICONS: Record<ProductStatus, string> = {
  available: '✅',
  low_stock: '⚠️',
  critical: '🔶',
  out_of_stock: '❌',
} as const;

/**
 * Status labels for UI display
 */
export const STATUS_LABELS: Record<ProductStatus, string> = {
  available: 'В наличии',
  low_stock: 'Заканчивается',
  critical: 'Критически мало',
  out_of_stock: 'Отсутствует',
} as const;

// =====================================================
// LEGACY COMPATIBILITY
// =====================================================

/**
 * @deprecated Use ProductAvailability instead
 * Kept for backward compatibility with existing components
 */
export type LegacyProductData = ProductAvailability;

/**
 * @deprecated Use InventorySummary instead
 * Kept for backward compatibility with existing components
 */
export type LegacyInventorySummary = InventorySummary;

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Type guard to check if a status is valid
 */
export function isValidProductStatus(status: string): status is ProductStatus {
  return ['available', 'low_stock', 'critical', 'out_of_stock'].includes(status);
}

/**
 * Type guard to check if an object is a ProductAvailability
 */
export function isProductAvailability(obj: any): obj is ProductAvailability {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.product_name === 'string' &&
    typeof obj.total_stock === 'number' &&
    typeof obj.available_stock === 'number' &&
    isValidProductStatus(obj.status)
  );
}
