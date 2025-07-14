import React from "react";
import { Text } from "../../atoms";

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
}) => {
  const imageSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const containerClasses = {
    horizontal: 'flex items-center gap-3',
    vertical: 'flex flex-col items-center text-center gap-2',
  };

  const baseClasses = `${containerClasses[layout]} ${className}`;
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg p-2'
    : "";

  return (
    <div className={`${baseClasses} ${interactiveClasses}`} onClick={onClick}>
      {/* Product Image */}
      <div className={`${imageSizeClasses[imageSize]} flex-shrink-0`}>
        <img
          src={imageUrl}
          alt={imageAlt || title}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className={`flex-1 ${layout === 'vertical' ? 'text-center' : ''}`}>
        <Text
          variant="span"
          size="sm"
          weight="medium"
          className="block text-gray-900 dark:text-gray-100 truncate"
        >
          {title}
        </Text>

        {description && (
          <Text variant="span" size="xs" color="secondary" className="block mt-1 truncate">
            {description}
          </Text>
        )}

        {(price || metadata) && (
          <div
            className={`mt-1 flex ${layout === 'vertical' ? 'justify-center' : 'justify-between'} items-center gap-2`}
          >
            {price && (
              <Text
                variant="span"
                size="sm"
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
      </div>
    </div>
  );
};

export default ProductCell;
