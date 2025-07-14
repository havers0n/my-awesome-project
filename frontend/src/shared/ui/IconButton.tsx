import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  tooltip?: string;
  className?: string;
  ariaLabel?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  loading?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  size = 'md',
  variant = 'primary',
  disabled = false,
  tooltip,
  className = '',
  ariaLabel,
  rounded = 'md',
  loading = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm',
    ghost:
      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    outline:
      'border-2 border-gray-300 hover:border-gray-400 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

  const baseClasses = `
    inline-flex items-center justify-center
    transition-all duration-200 ease-in-out
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${roundedClasses[rounded]}
    ${disabledClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      );
    }
    return icon;
  };

  return (
    <button
      type="button"
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      title={tooltip}
    >
      {renderContent()}
    </button>
  );
};

export default IconButton;
