import React from 'react';
import { Card, Text } from '../atoms';
import { ProductItem } from '../molecules';

export interface ProductData {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  originalPrice?: string | number;
  image?: string;
  imageAlt?: string;
  badge?: {
    text: string;
    variant?: 'light' | 'solid' | 'outline';
    color?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';
  };
  status?: 'in-stock' | 'out-of-stock' | 'low-stock';
  rating?: number;
  reviews?: number;
}

interface ProductTableProps {
  products: ProductData[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  maxItems?: number;
  emptyMessage?: string;
  onProductClick?: (product: ProductData) => void;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  title,
  subtitle,
  actions,
  layout = 'horizontal',
  size = 'md',
  variant = 'default',
  maxItems,
  emptyMessage = 'No products available',
  onProductClick,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const displayedProducts = maxItems ? products.slice(0, maxItems) : products;

  const renderHeader = () => {
    if (!title && !subtitle && !actions) return null;

    return (
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {title && (
            <Text variant="h3" size="lg" weight="semibold" color="primary">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text variant="p" size="sm" color="secondary" className="mt-1">
              {subtitle}
            </Text>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
      </div>
    );
  };

  const renderProductItems = () => {
    if (!displayedProducts || displayedProducts.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-4 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-sm font-medium">{emptyMessage}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Product data will appear here when available
            </p>
          </div>
        </div>
      );
    }

    if (layout === 'vertical') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedProducts.map(product => (
            <ProductItem
              key={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              imageAlt={product.imageAlt}
              badge={product.badge}
              status={product.status}
              rating={product.rating}
              reviews={product.reviews}
              layout="vertical"
              size={size}
              onClick={() => onProductClick?.(product)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {displayedProducts.map(product => (
          <ProductItem
            key={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            originalPrice={product.originalPrice}
            image={product.image}
            imageAlt={product.imageAlt}
            badge={product.badge}
            status={product.status}
            rating={product.rating}
            reviews={product.reviews}
            layout="horizontal"
            size={size}
            onClick={() => onProductClick?.(product)}
          />
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    return (
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Text variant="p" size="sm" color="muted">
            Showing {displayedProducts.length} of {products.length} products
          </Text>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-brand-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (!maxItems || products.length <= maxItems) return null;

    const remainingCount = products.length - maxItems;

    return (
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Text variant="p" size="sm" color="muted" className="text-center">
          Showing {maxItems} of {products.length} products
          {remainingCount > 0 && (
            <span className="ml-2 text-brand-600 dark:text-brand-400">
              (+{remainingCount} more)
            </span>
          )}
        </Text>
      </div>
    );
  };

  return (
    <Card variant={variant} padding="none" className={`overflow-hidden ${className}`}>
      <div className={sizeClasses[size]}>
        {renderHeader()}
        {renderProductItems()}
        {showPagination ? renderPagination() : renderFooter()}
      </div>
    </Card>
  );
};

export default ProductTable;
