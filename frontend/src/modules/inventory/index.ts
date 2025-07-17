/**
 * Inventory Module - Public Exports
 * 
 * This file serves as the main entry point for the inventory module.
 * All public APIs, components, hooks, services, and types should be exported from here
 * to guarantee backward compatibility and provide a clean interface for consumers.
 */

// =====================================================
// TYPES AND INTERFACES
// =====================================================

export type {
  ProductStatus,
  ProductAvailability,
  ProductSummary,
  InventorySummary,
  OutOfStockRecord,
  ProductFilters,
  DateRangeFilter,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ShelfAvailabilityMenuProps,
  ShelfAvailabilityWidgetProps,
  ProductDetailModalProps,
  UseInventoryDataReturn,
  UseInventoryFiltersReturn,
  UseOutOfStockTrackingReturn,
  
  // Legacy compatibility exports
  LegacyProductData,
  LegacyInventorySummary
} from './types';

// Export constants and utility functions
export {
  STATUS_COLORS,
  STATUS_ICONS,
  STATUS_LABELS,
  isValidProductStatus,
  isProductAvailability
} from './types';

// =====================================================
// SERVICES
// =====================================================

export {
  inventoryService,
  getProductAvailability,
  getInventorySummary,
  getProductsPaginated,
  updateProductAvailability,
  getShelfLocations
} from './services/inventoryService';

// Re-export existing outOfStockService for backward compatibility
export {
  outOfStockService,
  getRecords,
  addRecord,
  deleteRecord
} from '@/services/outOfStockService';

// =====================================================
// PAGES
// =====================================================

export { default as ShelfAvailabilityPage } from './pages/ShelfAvailabilityPage';

// =====================================================
// COMPONENTS
// =====================================================

// Note: Components will be added here as they are created
// Example:
// export { default as ProductCard } from './components/ProductCard';
// export { default as InventoryWidget } from './components/InventoryWidget';
// export { default as ProductDetailModal } from './components/ProductDetailModal';

// =====================================================
// HOOKS
// =====================================================

// Note: Hooks will be added here as they are created
// Example:
// export { useInventoryData } from './hooks/useInventoryData';
// export { useInventoryFilters } from './hooks/useInventoryFilters';
// export { useOutOfStockTracking } from './hooks/useOutOfStockTracking';

// =====================================================
// LEGACY COMPATIBILITY
// =====================================================

/**
 * Legacy component re-exports for backward compatibility
 * These will be deprecated in future versions
 */

// Re-export legacy components with deprecation warnings
export { default as LegacyShelfAvailabilityWidget } from '@/components/inventory/ShelfAvailabilityWidget';
export { default as LegacyShelfAvailabilityMenu } from '@/components/inventory/ShelfAvailabilityMenu';
export { default as LegacyShelfAvailabilityPage } from '@/pages/Inventory/ShelfAvailabilityPage';

// =====================================================
// MODULE METADATA
// =====================================================

/**
 * Module information for tooling and documentation
 */
export const INVENTORY_MODULE_INFO = {
  name: 'inventory',
  version: '1.0.0',
  description: 'Inventory management module with shelf availability tracking',
  features: [
    'Product availability tracking',
    'Shelf location management',
    'Out-of-stock time tracking',
    'Real-time status updates',
    'Advanced filtering and search',
    'Analytics and reporting'
  ],
  dependencies: [
    'react',
    'lucide-react',
    '@/services/supabaseClient'
  ],
  legacyCompatibility: true
} as const;

/**
 * Default export containing commonly used utilities
 */
export default {
  service: inventoryService,
  types: {
    STATUS_COLORS,
    STATUS_ICONS,
    STATUS_LABELS
  },
  utils: {
    isValidProductStatus,
    isProductAvailability
  },
  moduleInfo: INVENTORY_MODULE_INFO
};
