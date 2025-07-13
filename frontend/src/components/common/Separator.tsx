import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  color?: 'light' | 'medium' | 'dark';
  className?: string;
  decorative?: boolean;
  children?: React.ReactNode;
}

const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  size = 'md',
  color = 'light',
  className = '',
  decorative = true,
  children,
}) => {
  const orientationClasses = {
    horizontal: 'w-full border-t',
    vertical: 'h-full border-l',
  };

  const sizeClasses = {
    sm: orientation === 'horizontal' ? 'border-t' : 'border-l',
    md: orientation === 'horizontal' ? 'border-t-2' : 'border-l-2',
    lg: orientation === 'horizontal' ? 'border-t-4' : 'border-l-4',
  };

  const colorClasses = {
    light: 'border-gray-200 dark:border-gray-700',
    medium: 'border-gray-300 dark:border-gray-600',
    dark: 'border-gray-400 dark:border-gray-500',
  };

  const baseClasses = `
    ${orientationClasses[orientation]}
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  // If there are children, render as a separator with text
  if (children) {
    return (
      <div className={`relative ${orientation === 'horizontal' ? 'my-4' : 'mx-4'}`}>
        <div className={baseClasses} />
        <div
          className={`absolute ${
            orientation === 'horizontal'
              ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90'
          } bg-white dark:bg-gray-900 px-2`}
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">{children}</span>
        </div>
      </div>
    );
  }

  // Simple separator without text
  return (
    <div
      className={baseClasses}
      role={decorative ? 'presentation' : 'separator'}
      aria-orientation={orientation}
    />
  );
};

// Predefined separator variants for common use cases
export const HorizontalSeparator: React.FC<Omit<SeparatorProps, 'orientation'>> = props => (
  <Separator {...props} orientation="horizontal" />
);

export const VerticalSeparator: React.FC<Omit<SeparatorProps, 'orientation'>> = props => (
  <Separator {...props} orientation="vertical" />
);

export const TextSeparator: React.FC<Omit<SeparatorProps, 'orientation'> & { text: string }> = ({
  text,
  ...props
}) => (
  <Separator {...props} orientation="horizontal">
    {text}
  </Separator>
);

export default Separator;
