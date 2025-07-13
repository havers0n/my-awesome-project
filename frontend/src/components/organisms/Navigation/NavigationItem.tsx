import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface NavigationSubItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  };
  new?: boolean;
  pro?: boolean;
  disabled?: boolean;
}

export interface NavigationItemProps {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  path?: string;
  subItems?: NavigationSubItem[];
  isActive?: boolean;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
  onClick?: (id: string) => void;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  };
  color?: string;
  isHighlighted?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  id,
  label,
  icon: Icon,
  path,
  subItems = [],
  isActive = false,
  isExpanded = false,
  onToggle,
  onClick,
  badge,
  color = 'text-gray-600',
  isHighlighted = false,
  disabled = false,
  className = '',
  variant = 'default',
}) => {
  const [isInternalExpanded, setIsInternalExpanded] = useState(isExpanded);

  const hasSubItems = subItems.length > 0;
  const actuallyExpanded = isExpanded !== undefined ? isExpanded : isInternalExpanded;

  const handleClick = () => {
    if (disabled) return;

    if (hasSubItems) {
      const newExpanded = !actuallyExpanded;
      setIsInternalExpanded(newExpanded);
      onToggle?.(id);
    } else {
      onClick?.(id);
    }
  };

  const getItemClasses = () => {
    const baseClasses =
      'flex items-center justify-between rounded-xl mx-2 cursor-pointer transition-all duration-200 group';

    const variantClasses = {
      default: 'px-4 py-3',
      compact: 'px-3 py-2',
      minimal: 'px-2 py-1.5',
    };

    const stateClasses = isHighlighted
      ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm'
      : isActive
        ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
        : disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-50 hover:shadow-sm';

    return `${baseClasses} ${variantClasses[variant]} ${stateClasses}`;
  };

  const getIconClasses = () => {
    const baseClasses = 'transition-transform duration-200 group-hover:scale-110';
    const sizeClasses = {
      default: 'w-5 h-5',
      compact: 'w-4 h-4',
      minimal: 'w-4 h-4',
    };

    const colorClasses =
      isActive || isHighlighted ? (isHighlighted ? 'text-blue-600' : 'text-brand-500') : color;

    return `${baseClasses} ${sizeClasses[variant]} ${colorClasses}`;
  };

  const getLabelClasses = () => {
    const baseClasses = 'font-medium group-hover:text-gray-900 transition-colors';
    const sizeClasses = {
      default: 'text-sm',
      compact: 'text-xs',
      minimal: 'text-xs',
    };

    const colorClasses = isHighlighted
      ? 'text-blue-700'
      : isActive
        ? 'text-brand-500'
        : 'text-gray-700';

    return `${baseClasses} ${sizeClasses[variant]} ${colorClasses}`;
  };

  const getBadgeClasses = (badgeVariant: string = 'default') => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full';
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };

    return `${baseClasses} ${variantClasses[badgeVariant as keyof typeof variantClasses]}`;
  };

  const MainContent = () => (
    <div className={getItemClasses()} onClick={handleClick}>
      <div className="flex items-center space-x-3">
        {Icon && <Icon className={getIconClasses()} />}
        <span className={getLabelClasses()}>{label}</span>
        {badge && <span className={getBadgeClasses(badge.variant)}>{badge.text}</span>}
      </div>
      {hasSubItems && (
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
          {actuallyExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      )}
    </div>
  );

  const SubItems = () => (
    <div className="ml-8 mt-2 space-y-1">
      {subItems.map(subItem => (
        <Link
          key={subItem.id}
          to={subItem.path}
          className={`
            block px-4 py-2 text-sm rounded-lg mx-2 transition-colors duration-200
            ${
              location.pathname === subItem.path
                ? 'bg-brand-50 text-brand-500 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
            ${subItem.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {subItem.icon && <subItem.icon className="w-4 h-4" />}
              <span>{subItem.label}</span>
            </div>
            <div className="flex items-center space-x-1">
              {subItem.new && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  NEW
                </span>
              )}
              {subItem.pro && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                  PRO
                </span>
              )}
              {subItem.badge && (
                <span className={getBadgeClasses(subItem.badge.variant)}>{subItem.badge.text}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className={`mb-1 ${className}`}>
      {path && !hasSubItems ? (
        <Link to={path} className="block">
          <MainContent />
        </Link>
      ) : (
        <MainContent />
      )}

      {hasSubItems && actuallyExpanded && <SubItems />}
    </div>
  );
};

export default NavigationItem;
