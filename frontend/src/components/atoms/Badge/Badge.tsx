import React from 'react';
import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  color = 'gray',
  dot = false,
  children,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-1 rounded-full font-medium';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variantClasses = {
    default: {
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      red: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
      yellow: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
      green: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/20 dark:text-indigo-300',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-300',
    },
    primary: {
      gray: 'bg-brand-100 text-brand-800 dark:bg-brand-800/20 dark:text-brand-300',
      red: 'bg-error-500 text-white',
      yellow: 'bg-warning-500 text-white',
      green: 'bg-success-500 text-white',
      blue: 'bg-blue-500 text-white',
      indigo: 'bg-indigo-500 text-white',
      purple: 'bg-purple-500 text-white',
      pink: 'bg-pink-500 text-white',
    },
    secondary: {
      gray: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-600',
      red: 'bg-error-50 text-error-600 ring-1 ring-error-200 dark:bg-error-800/20 dark:text-error-400 dark:ring-error-600',
      yellow:
        'bg-warning-50 text-warning-600 ring-1 ring-warning-200 dark:bg-warning-800/20 dark:text-warning-400 dark:ring-warning-600',
      green:
        'bg-success-50 text-success-600 ring-1 ring-success-200 dark:bg-success-800/20 dark:text-success-400 dark:ring-success-600',
      blue: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-800/20 dark:text-blue-400 dark:ring-blue-600',
      indigo:
        'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-800/20 dark:text-indigo-400 dark:ring-indigo-600',
      purple:
        'bg-purple-50 text-purple-600 ring-1 ring-purple-200 dark:bg-purple-800/20 dark:text-purple-400 dark:ring-purple-600',
      pink: 'bg-pink-50 text-pink-600 ring-1 ring-pink-200 dark:bg-pink-800/20 dark:text-pink-400 dark:ring-pink-600',
    },
    success: {
      gray: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
      red: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
      yellow: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
      green: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
      blue: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
      indigo: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
      purple: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
      pink: 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-300',
    },
    warning: {
      gray: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
      red: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
      yellow: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
      green: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
      blue: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
      indigo: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
      purple: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
      pink: 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-300',
    },
    danger: {
      gray: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
      red: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
      yellow: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
      green: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
      blue: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
      indigo: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
      purple: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
      pink: 'bg-error-100 text-error-800 dark:bg-error-800/20 dark:text-error-300',
    },
    outline: {
      gray: 'bg-transparent text-gray-700 ring-1 ring-gray-300 dark:text-gray-400 dark:ring-gray-600',
      red: 'bg-transparent text-error-600 ring-1 ring-error-300 dark:text-error-400 dark:ring-error-600',
      yellow:
        'bg-transparent text-warning-600 ring-1 ring-warning-300 dark:text-warning-400 dark:ring-warning-600',
      green:
        'bg-transparent text-success-600 ring-1 ring-success-300 dark:text-success-400 dark:ring-success-600',
      blue: 'bg-transparent text-blue-600 ring-1 ring-blue-300 dark:text-blue-400 dark:ring-blue-600',
      indigo:
        'bg-transparent text-indigo-600 ring-1 ring-indigo-300 dark:text-indigo-400 dark:ring-indigo-600',
      purple:
        'bg-transparent text-purple-600 ring-1 ring-purple-300 dark:text-purple-400 dark:ring-purple-600',
      pink: 'bg-transparent text-pink-600 ring-1 ring-pink-300 dark:text-pink-400 dark:ring-pink-600',
    },
  };

  const colorClasses = variantClasses[variant]?.[color] || variantClasses.default[color];

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${colorClasses} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

export default Badge;
