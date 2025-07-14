import React from "react";
import { Button } from "@/shared/ui/atoms";

interface ActionButtonItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  count?: number; // For showing filter count
}

interface ActionButtonsProps {
  buttons: ActionButtonItem[];
  layout?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showCounts?: boolean;
  className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  buttons,
  layout = 'horizontal',
  spacing = 'normal',
  size = 'md',
  fullWidth = false,
  showCounts = false,
  className = '',
}) => {
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-4',
  };

  const containerClasses = {
    horizontal: `flex items-center ${spacingClasses[spacing]} ${fullWidth ? 'w-full' : ''}`,
    vertical: `flex flex-col ${spacingClasses[spacing]} ${fullWidth ? 'w-full' : ''}`,
  };

  const getButtonContent = (button: ActionButtonItem) => {
    if (showCounts && button.count !== undefined) {
      return (
        <span className="flex items-center gap-1">
          <span>{button.label}</span>
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-white/20 rounded-full">
            {button.count}
          </span>
        </span>
      );
    }
    return button.label;
  };

  return (
    <div className={`${containerClasses[layout]} ${className}`}>
      {buttons.map(button => (
        <Button
          key={button.id}
          variant={button.variant || 'outline'}
          size={size}
          startIcon={button.icon}
          disabled={button.disabled}
          loading={button.loading}
          onClick={button.onClick}
          fullWidth={fullWidth && layout === 'vertical'}
          className={fullWidth && layout === 'horizontal' ? 'flex-1' : ''}
        >
          {getButtonContent(button)}
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
