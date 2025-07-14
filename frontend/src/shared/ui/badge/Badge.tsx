import React from "react";
import { cn } from "@/shared/lib/utils";

type BadgeColor = 'success' | 'warning' | 'error' | 'info' | 'default';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = 'default', 
  size = 'md', 
  className 
}) => {
  const colorVariants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300',
  };

  const sizeVariants = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colorVariants[color],
        sizeVariants[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
