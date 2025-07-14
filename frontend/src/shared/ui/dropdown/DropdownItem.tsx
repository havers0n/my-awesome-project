import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

interface DropdownItemProps {
  children: React.ReactNode;
  onItemClick?: () => void;
  className?: string;
  tag?: 'a' | 'button' | 'div';
  to?: string;
  href?: string;
  onClick?: () => void;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onItemClick,
  className = '',
  tag = 'div',
  to,
  href,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };

  const baseClasses = cn(
    'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
    className
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={handleClick}>
        {children}
      </a>
    );
  }

  if (tag === 'button') {
    return (
      <button type="button" className={baseClasses} onClick={handleClick}>
        {children}
      </button>
    );
  }

  if (tag === 'a') {
    return (
      <a className={baseClasses} onClick={handleClick}>
        {children}
      </a>
    );
  }

  return (
    <div className={baseClasses} onClick={handleClick}>
      {children}
    </div>
  );
};
