import React from 'react';

interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'label' | 'span';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'muted' | 'white';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  variant = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  className = '',
  children,
  ...props
}) => {
  const Component = variant as keyof JSX.IntrinsicElements;

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
    thin: 'font-thin',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  };

  const colorClasses = {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    danger: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    muted: 'text-gray-500 dark:text-gray-400',
    white: 'text-white',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const classes =
    `${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]} ${alignClasses[align]} ${className}`.trim();

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Text;
