import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Размер изображения */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Форма изображения */
  shape?: 'square' | 'circle' | 'rounded';
  /** Объект заполнения */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  /** Показывать fallback при ошибке */
  fallback?: React.ReactNode;
  /** Показывать loader */
  loading?: boolean;
  /** Lazy loading */
  lazy?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  size = 'md',
  shape = 'square',
  objectFit = 'cover',
  fallback,
  loading = false,
  lazy = true,
  className = '',
  alt = '',
  onError,
  ...props
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(loading);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    full: 'w-full h-full',
  };

  const shapeClasses = {
    square: '',
    circle: 'rounded-full',
    rounded: 'rounded-lg',
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    'scale-down': 'object-scale-down',
    none: 'object-none',
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const baseClasses = `${sizeClasses[size]} ${shapeClasses[shape]} ${objectFitClasses[objectFit]} ${className}`;

  // Render fallback if error occurred
  if (hasError && fallback) {
    return (
      <div
        className={`${sizeClasses[size]} ${shapeClasses[shape]} bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
      >
        {fallback}
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div
        className={`${sizeClasses[size]} ${shapeClasses[shape]} bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`}
      />
    );
  }

  return (
    <img
      {...props}
      alt={alt}
      className={baseClasses}
      onError={handleError}
      onLoad={handleLoad}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
};

// Компонент для аватара
export interface AvatarProps extends Omit<ImageProps, 'shape'> {
  /** Имя пользователя для fallback */
  name?: string;
  /** Показывать онлайн индикатор */
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  online,
  size = 'md',
  className = '',
  ...props
}) => {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fallback = (
    <span
      className={`text-gray-600 dark:text-gray-400 font-medium ${
        size === 'xs'
          ? 'text-xs'
          : size === 'sm'
            ? 'text-sm'
            : size === 'md'
              ? 'text-base'
              : size === 'lg'
                ? 'text-lg'
                : size === 'xl'
                  ? 'text-xl'
                  : 'text-base'
      }`}
    >
      {getInitials(name)}
    </span>
  );

  return (
    <div className="relative inline-block">
      <Image {...props} size={size} shape="circle" fallback={fallback} className={className} />
      {online && (
        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800" />
      )}
    </div>
  );
};

export default Image;
