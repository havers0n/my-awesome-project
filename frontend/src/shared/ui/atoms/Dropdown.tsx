import React, { useState, useRef, useEffect } from "react";
import { ReactNode } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  position?: 'bottom' | 'top';
  className?: string;
  menuClassName?: string;
  closeOnClick?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
  position = 'bottom',
  className = '',
  menuClassName = '',
  closeOnClick = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };
  
  const handleMenuClick = () => {
    if (closeOnClick) {
      setIsOpen(false);
    }
  };
  
  const getAlignmentClasses = () => {
    switch (align) {
      case 'left':
        return 'left-0';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      case 'right':
      default:
        return 'right-0';
    }
  };
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'bottom':
      default:
        return 'top-full mt-2';
    }
  };
  
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={`absolute z-50 ${getPositionClasses()} ${getAlignmentClasses()} min-w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 dark:bg-gray-800 dark:border-gray-700 ${menuClassName}`}
          onClick={handleMenuClick}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  href,
  children,
  className = '',
  disabled = false
}) => {
  const baseClasses = 'block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors';
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };
  
  if (href) {
    return (
      <a
        href={href}
        className={`${baseClasses} ${disabled ? disabledClasses : ''} ${className}`}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} text-left ${disabled ? disabledClasses : ''} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface DropdownDividerProps {
  className?: string;
}

export const DropdownDivider: React.FC<DropdownDividerProps> = ({ className = '' }) => {
  return <div className={`h-px bg-gray-200 dark:bg-gray-700 my-1 ${className}`} />;
};

export default Dropdown;
