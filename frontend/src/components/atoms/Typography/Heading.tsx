import React from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'inherit';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  size,
  weight = 'semibold',
  color = 'primary',
  align = 'left',
  truncate = false,
  className,
  children,
  ...props
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  // Автоматическое определение размера на основе уровня заголовка
  const getDefaultSize = () => {
    const sizeMap = {
      1: '3xl',
      2: '2xl',
      3: 'xl',
      4: 'lg',
      5: 'base',
      6: 'sm',
    } as const;
    return sizeMap[level] || 'base';
  };

  const actualSize = size || getDefaultSize();

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  const colorClasses = {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    white: 'text-white',
    inherit: 'text-inherit',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const classes = cn(
    sizeClasses[actualSize],
    weightClasses[weight],
    colorClasses[color],
    alignClasses[align],
    truncate && 'truncate',
    'leading-tight',
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Heading;
