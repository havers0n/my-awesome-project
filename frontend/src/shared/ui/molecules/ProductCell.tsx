import React from "react";
import { Text } from "../atoms/Typography";
import { Image } from "../atoms/Image";
import { Button } from "../atoms/Button";
import { Badge } from "../atoms/Badge";
import { Icon } from "../atoms/Icon";

export interface ProductCellProps {
  /** URL изображения товара */
  imageUrl: string;
  /** Альтернативный текст для изображения */
  imageAlt?: string;
  /** Название товара */
  title: string;
  /** Описание товара */
  description?: string;
  /** Цена товара */
  price?: string;
  /** Дополнительная информация */
  metadata?: string;
  /** Размер изображения */
  imageSize?: 'sm' | 'md' | 'lg';
  /** Направление компоновки */
  layout?: 'horizontal' | 'vertical';
  /** Дополнительные CSS классы */
  className?: string;
  /** Обработчик клика */
  onClick?: () => void;
  /** Статус товара */
  status?: 'available' | 'low-stock' | 'out-of-stock';
  /** Количество на складе */
  stockCount?: number;
  /** Рейтинг товара */
  rating?: number;
  /** Скидка */
  discount?: number;
  /** Избранное */
  isFavorite?: boolean;
  /** Обработчик избранного */
  onToggleFavorite?: () => void;
  /** Показывать действия */
  showActions?: boolean;
  /** Размер компонента */
  size?: 'sm' | 'md' | 'lg';
  /** Вариант отображения */
  variant?: 'default' | 'card' | 'compact';
  /** Обработчик быстрого просмотра */
  onQuickView?: () => void;
  /** Обработчик добавления в корзину */
  onAddToCart?: () => void;
  /** Состояние загрузки */
  loading?: boolean;
  /** Aria-label для accessibility */
  ariaLabel?: string;
}

export const ProductCell: React.FC<ProductCellProps> = ({
  imageUrl,
  imageAlt,
  title,
  description,
  price,
  metadata,
  imageSize = 'md',
  layout = 'horizontal',
  className = '',
  onClick,
  status = 'available',
  stockCount,
  rating,
  discount,
  isFavorite = false,
  onToggleFavorite,
  showActions = false,
  size = 'md',
  variant = 'default',
  onQuickView,
  onAddToCart,
  loading = false,
  ariaLabel,
}) => {
  const imageSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const containerClasses = {
    horizontal: 'flex items-center gap-3',
    vertical: 'flex flex-col items-center text-center gap-2',
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const variantClasses = {
    default: '',
    card: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
    compact: 'bg-gray-50 dark:bg-gray-900 rounded-md',
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'success';
      case 'low-stock':
        return 'warning';
      case 'out-of-stock':
        return 'error';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
        default:
          return "";
    }
  };

  const renderRating = () => {
    if (!rating) return null;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star-filled' : 'star'}
          size={3}
          className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}
        />
      );
    }

    return (
      <div className="flex items-center gap-1 mt-1">
        {stars}
        <Text variant="span" size="xs" color="secondary" className="ml-1">
          ({rating})
        </Text>
      </div>
    );
  };

  const baseClasses = `${containerClasses[layout]} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg'
    : "";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} relative group`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel || `${title} product`}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Product Image */}
      <div className={`${imageSizeClasses[imageSize]} flex-shrink-0 relative`}>
        <Image
          src={imageUrl}
          alt={imageAlt || title}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discount && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="solid" color="error" size="sm">
              -{discount}%
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Icon
              name={isFavorite ? 'heart-filled' : 'heart'}
              size={4}
              className={isFavorite ? 'text-red-500' : 'text-gray-400'}
            />
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className={`flex-1 ${layout === 'vertical' ? 'text-center' : ''} min-w-0`}>
        <div className="flex items-start justify-between gap-2">
          <Text
            variant="span"
            size={size === 'sm' ? 'xs' : 'sm'}
            weight="medium"
            className="block text-gray-900 dark:text-gray-100 truncate"
          >
            {title}
          </Text>

          {/* Status Badge */}
          {status !== 'available' && (
            <Badge variant="light" color={getStatusColor()} size="sm" className="flex-shrink-0">
              {getStatusText()}
            </Badge>
          )}
        </div>

        {description && (
          <Text variant="span" size="xs" color="secondary" className="block mt-1 truncate">
            {description}
          </Text>
        )}

        {/* Rating */}
        {renderRating()}

        {/* Stock Count */}
        {stockCount !== undefined && (
          <Text variant="span" size="xs" color="secondary" className="block mt-1">
            {stockCount} in stock
          </Text>
        )}

        {/* Price and Metadata */}
        {(price || metadata) && (
          <div
            className={`mt-2 flex ${layout === 'vertical' ? 'justify-center' : 'justify-between'} items-center gap-2`}
          >
            {price && (
              <Text
                variant="span"
                size={size === 'sm' ? 'xs' : 'sm'}
                weight="semibold"
                className="text-brand-600 dark:text-brand-400"
              >
                {price}
              </Text>
            )}

            {metadata && (
              <Text variant="span" size="xs" color="muted" className="truncate">
                {metadata}
              </Text>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (onQuickView || onAddToCart) && (
          <div className="mt-3 flex gap-2">
            {onQuickView && (
              <Button
                variant="outline"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  onQuickView();
                }}
                className="flex-1"
              >
                <Icon name="eye" size={3} />
                Quick View
              </Button>
            )}

            {onAddToCart && (
              <Button
                variant="primary"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                disabled={status === 'out-of-stock' || loading}
                loading={loading}
                className="flex-1"
              >
                <Icon name="shopping-cart" size={3} />
                Add to Cart
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCell;
