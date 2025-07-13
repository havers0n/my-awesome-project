import React from 'react';
import { cn } from '@/lib/utils';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'mark';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?:
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'white'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'inherit';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  as = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  truncate = false,
  italic = false,
  underline = false,
  strikethrough = false,
  className,
  children,
  ...props
}) => {
  const Component = as;

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    white: 'text-white',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    inherit: 'text-inherit',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const classes = cn(
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    alignClasses[align],
    truncate && 'truncate',
    italic && 'italic',
    underline && 'underline',
    strikethrough && 'line-through',
    'leading-relaxed',
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Text;
