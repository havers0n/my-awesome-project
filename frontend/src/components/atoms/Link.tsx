import React from 'react';
import { ReactNode } from 'react';

interface LinkProps {
  href?: string;
  to?: string; // For React Router compatibility
  variant?: 'primary' | 'secondary' | 'muted' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  underline?: 'none' | 'hover' | 'always';
  external?: boolean;
  disabled?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({
  href,
  to,
  variant = 'primary',
  size = 'md',
  underline = 'hover',
  external = false,
  disabled = false,
  startIcon,
  endIcon,
  children,
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    primary: 'text-brand-600 hover:text-brand-800 focus:text-brand-800',
    secondary: 'text-gray-600 hover:text-gray-800 focus:text-gray-800',
    muted: 'text-gray-500 hover:text-gray-700 focus:text-gray-700',
    danger: 'text-red-600 hover:text-red-800 focus:text-red-800',
  };

  const underlineClasses = {
    none: 'no-underline',
    hover: 'no-underline hover:underline',
    always: 'underline',
  };

  const baseClasses = `
    inline-flex items-center gap-1 font-medium transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
  `;

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${underlineClasses[underline]}
    ${className}
  `.trim();

  const linkProps = {
    className: combinedClasses,
    onClick: disabled ? undefined : onClick,
    ...(external && {
      target: '_blank',
      rel: 'noopener noreferrer',
    }),
  };

  // If it's a React Router link (has 'to' prop), render as span and let parent handle routing
  if (to && !href) {
    return (
      <span {...linkProps} role="link" tabIndex={disabled ? -1 : 0}>
        {startIcon}
        {children}
        {endIcon}
        {external && <span className="ml-1">↗</span>}
      </span>
    );
  }

  return (
    <a href={disabled ? undefined : href} {...linkProps}>
      {startIcon}
      {children}
      {endIcon}
      {external && <span className="ml-1">↗</span>}
    </a>
  );
}; 