/**
 * ProductCard component for product entity
 * Displays product information in a card format
 */

import React from "react";
import { Card, CardContent } from "@/shared/ui/atoms/Card";
import { Badge } from "@/shared/ui/atoms/Badge";
import { 
  Product, 
  getProductDisplayName, 
  getProductStock, 
  getProductStatusConfig,
  isProductLowStock,
  isProductOutOfStock,
  ProductStatusLabels
} from "../model";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onClick?: (product: Product) => void;
  showStock?: boolean;
  showPrice?: boolean;
  showActions?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onClick,
  showStock = true,
  showPrice = true,
  showActions = false,
  className
}) => {
  const displayName = getProductDisplayName(product);
  const stock = getProductStock(product);
  const statusConfig = getProductStatusConfig(product.status);
  const isLowStock = isProductLowStock(product);
  const isOutOfStock = isProductOutOfStock(product);

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    } else if (onSelect) {
      onSelect(product);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md hover:border-blue-400 transition-all duration-200 ${className}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Product: ${displayName}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h4 className="font-semibold text-gray-800 truncate" title={displayName}>
              {displayName}
            </h4>
            
            {product.category && (
              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
            )}
            
            {product.shelf_location && (
              <p className="text-sm text-gray-500 mt-1">
                Shelf: {product.shelf_location}
              </p>
            )}
            
            {product.sku && (
              <p className="text-xs text-gray-400 mt-1">
                SKU: {product.sku}
              </p>
            )}
            
            {showPrice && product.price && (
              <p className="text-sm font-medium text-gray-700 mt-2">
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {showStock && (
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Available</p>
                <p className={`font-bold text-lg ${
                  isOutOfStock ? 'text-red-600' : 
                  isLowStock ? 'text-yellow-600' : 
                  'text-gray-800'
                }`}>
                  {stock}
                </p>
              </div>
            )}
            
            <div className={`flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg px-3 py-1.5`}>
              <div className={statusConfig.iconColor}>
                {statusConfig.icon}
              </div>
              <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                {ProductStatusLabels[product.status] || statusConfig.text}
              </span>
            </div>
          </div>
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit action
              }}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete action
              }}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
