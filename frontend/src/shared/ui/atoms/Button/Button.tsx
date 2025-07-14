import React from "react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary:
      'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    ghost:
      'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    link: 'text-blue-600 hover:text-blue-700 focus:ring-blue-500 underline-offset-4 hover:underline p-0 h-auto font-normal',
  };

  const widthClasses = fullWidth ? 'w-full' : "";

  // Для link варианта не применяем размеры и некоторые базовые классы
  const isLinkVariant = variant === 'link';
  const appliedBaseClasses = isLinkVariant
    ? 'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    : baseClasses;
  const appliedSizeClasses = isLinkVariant ? '' : sizeClasses[size];

  return (
    <button
      className={`${appliedBaseClasses} ${appliedSizeClasses} ${variantClasses[variant]} ${widthClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {!loading && endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
