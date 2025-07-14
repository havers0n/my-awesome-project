import React from "react";
import { Text } from "@/shared/ui/atoms";
import Badge from "@/shared/ui/atoms/Badge";

interface ProductItemProps {
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
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const ProductItem: React.FC<ProductItemProps> = ({
  name,
  description,
  price,
  originalPrice,
  image,
  imageAlt,
  badge,
  status,
  rating,
  reviews,
  layout = 'horizontal',
  size = 'md',
  onClick,
  className = '',
}) => {
  const getStatusBadge = () => {
    if (!status) return null;

    const statusConfig = {
      'in-stock': { text: 'In Stock', color: 'success' as const },
      'out-of-stock': { text: 'Out of Stock', color: 'error' as const },
      'low-stock': { text: 'Low Stock', color: 'warning' as const },
    };

    return statusConfig[status];
  };

  const statusBadge = getStatusBadge();

  const formatPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price;
  };

  const renderRating = () => {
    if (!rating) return null;

    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        {reviews && (
          <Text variant="span" size="xs" color="muted">
            ({reviews})
          </Text>
        )}
      </div>
    );
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      image: 'w-12 h-12',
      imageVertical: 'w-full h-32',
    },
    md: {
      container: 'p-4',
      image: 'w-16 h-16',
      imageVertical: 'w-full h-40',
    },
    lg: {
      container: 'p-6',
      image: 'w-20 h-20',
      imageVertical: 'w-full h-48',
    },
  };

  const textSizes = {
    sm: { name: 'sm' as const, price: 'sm' as const },
    md: { name: 'base' as const, price: 'base' as const },
    lg: { name: 'lg' as const, price: 'lg' as const },
  };

  if (layout === 'vertical') {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        <div className="relative">
          {image && (
            <img
              src={image}
              alt={imageAlt || name}
              className={`${sizeClasses[size].imageVertical} object-cover`}
            />
          )}
          {badge && (
            <div className="absolute top-2 left-2">
              <Badge variant={badge.variant} color={badge.color}>
                {badge.text}
              </Badge>
            </div>
          )}
        </div>

        <div className={sizeClasses[size].container}>
          <div className="space-y-2">
            <Text
              variant="h4"
              size={textSizes[size].name}
              weight="semibold"
              color="primary"
              className="line-clamp-2"
            >
              {name}
            </Text>

            {description && (
              <Text variant="p" size="sm" color="muted" className="line-clamp-2">
                {description}
              </Text>
            )}

            {renderRating()}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text variant="span" size={textSizes[size].price} weight="bold" color="primary">
                  {formatPrice(price)}
                </Text>
                {originalPrice && (
                  <Text variant="span" size="sm" color="muted" className="line-through">
                    {formatPrice(originalPrice)}
                  </Text>
                )}
              </div>

              {statusBadge && (
                <Badge variant="light" color={statusBadge.color} size="sm">
                  {statusBadge.text}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className={`flex items-center ${sizeClasses[size].container}`}>
        {image && (
          <div className="flex-shrink-0 mr-4">
            <img
              src={image}
              alt={imageAlt || name}
              className={`${sizeClasses[size].image} object-cover rounded-lg`}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Text
                  variant="h4"
                  size={textSizes[size].name}
                  weight="semibold"
                  color="primary"
                  className="truncate"
                >
                  {name}
                </Text>
                {badge && (
                  <Badge variant={badge.variant} color={badge.color} size="sm">
                    {badge.text}
                  </Badge>
                )}
              </div>

              {description && (
                <Text variant="p" size="sm" color="muted" className="line-clamp-2 mb-2">
                  {description}
                </Text>
              )}

              {renderRating()}
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              <div className="flex items-center gap-2">
                <Text variant="span" size={textSizes[size].price} weight="bold" color="primary">
                  {formatPrice(price)}
                </Text>
                {originalPrice && (
                  <Text variant="span" size="sm" color="muted" className="line-through">
                    {formatPrice(originalPrice)}
                  </Text>
                )}
              </div>

              {statusBadge && (
                <Badge variant="light" color={statusBadge.color} size="sm">
                  {statusBadge.text}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
