import React from "react";
import { cn } from "@/lib/utils";

interface CaptionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'small' | 'span' | 'div' | 'figcaption';
  size?: 'xs' | 'sm';
  weight?: 'light' | 'normal' | 'medium' | 'semibold';
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
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  uppercase?: boolean;
  children: React.ReactNode;
}

export const Caption: React.FC<CaptionProps> = ({
  as = 'small',
  size = 'sm',
  weight = 'normal',
  color = 'muted',
  align = 'left',
  truncate = false,
  uppercase = false,
  className,
  children,
  ...props
}) => {
  const Component = as;

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
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
  };

  const classes = cn(
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    alignClasses[align],
    truncate && 'truncate',
    uppercase && 'uppercase',
    'leading-tight',
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Caption;
