import React from 'react';
import { Text } from '@/components/atoms';
import Badge from '@/components/atoms/Badge';

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  available?: boolean;
}

interface ProductInfoProps {
  name: string;
  image?: string;
  imageAlt?: string;
  variants?: ProductVariant[];
  description?: string;
  sku?: string;
  category?: string;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showVariants?: boolean;
  className?: string;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  image,
  imageAlt,
  variants = [],
  description,
  sku,
  category,
  layout = 'horizontal',
  size = 'md',
  showVariants = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      container: 'gap-3',
      image: 'w-12 h-12',
      imageVertical: 'w-full h-32',
      name: 'sm' as const,
      description: 'xs' as const,
    },
    md: {
      container: 'gap-4',
      image: 'w-16 h-16',
      imageVertical: 'w-full h-40',
      name: 'base' as const,
      description: 'sm' as const,
    },
    lg: {
      container: 'gap-6',
      image: 'w-20 h-20',
      imageVertical: 'w-full h-48',
      name: 'lg' as const,
      description: 'base' as const,
    },
  };

  const renderVariants = () => {
    if (!showVariants || !variants.length) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {variants.map(variant => (
          <Badge
            key={variant.id}
            variant="outline"
            color={variant.available ? 'primary' : 'light'}
            size="sm"
            className={`${!variant.available ? 'opacity-50' : ''}`}
          >
            {variant.name}: {variant.value}
          </Badge>
        ))}
      </div>
    );
  };

  const renderImage = () => {
    if (!image) return null;

    const imageClasses =
      layout === 'vertical' ? sizeClasses[size].imageVertical : sizeClasses[size].image;

    return (
      <div className={`flex-shrink-0 ${layout === 'vertical' ? 'w-full' : ''}`}>
        <img
          src={image}
          alt={imageAlt || name}
          className={`${imageClasses} object-cover rounded-lg bg-gray-100 dark:bg-gray-800`}
          onError={e => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5QzEwLjM0IDkgOSAxMC4zNCA5IDEyUzEwLjM0IDE1IDEyIDE1IDE1IDEzLjY2IDE1IDEyIDEzLjY2IDkgMTIgOVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDdDMTMuNjYgNyAxNSA1LjY2IDE1IDRTMTMuNjYgMSAxMiAxIDkgMi4zNCA5IDQgMTAuMzQgNyAxMiA3WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
          }}
        />
      </div>
    );
  };

  if (layout === 'vertical') {
    return (
      <div className={`${className}`}>
        {renderImage()}
        <div className={`${sizeClasses[size].container} flex flex-col`}>
          <div className="space-y-2">
            <Text
              variant="h4"
              size={sizeClasses[size].name}
              weight="semibold"
              color="primary"
              className="line-clamp-2"
            >
              {name}
            </Text>

            {description && (
              <Text
                variant="p"
                size={sizeClasses[size].description}
                color="muted"
                className="line-clamp-3"
              >
                {description}
              </Text>
            )}

            {(sku || category) && (
              <div className="flex gap-2 text-xs text-gray-500">
                {sku && <span>SKU: {sku}</span>}
                {category && <span>Category: {category}</span>}
              </div>
            )}

            {renderVariants()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start ${sizeClasses[size].container} ${className}`}>
      {renderImage()}

      <div className="flex-1 min-w-0">
        <Text
          variant="h4"
          size={sizeClasses[size].name}
          weight="semibold"
          color="primary"
          className="line-clamp-2 mb-1"
        >
          {name}
        </Text>

        {description && (
          <Text
            variant="p"
            size={sizeClasses[size].description}
            color="muted"
            className="line-clamp-2 mb-2"
          >
            {description}
          </Text>
        )}

        {(sku || category) && (
          <div className="flex gap-2 text-xs text-gray-500 mb-2">
            {sku && <span>SKU: {sku}</span>}
            {category && <span>Category: {category}</span>}
          </div>
        )}

        {renderVariants()}
      </div>
    </div>
  );
};

export default ProductInfo;
