import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showLabel = true,
  label,
  animated = false,
  striped = false,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-3';
      case 'lg':
        return 'h-4';
      default:
        return 'h-3';
    }
  };
  
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'purple':
        return 'bg-purple-500';
      case 'gray':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getAnimationClasses = () => {
    let classes = 'transition-all duration-500 ease-out';
    
    if (animated) {
      classes += ' animate-pulse';
    }
    
    if (striped) {
      classes += ' bg-gradient-to-r from-transparent via-white to-transparent bg-[length:1rem_1rem]';
    }
    
    return classes;
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Прогресс'}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${getSizeClasses()}`}>
        <div
          className={`${getSizeClasses()} ${getColorClasses()} ${getAnimationClasses()} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Дополнительная информация под прогресс-баром */}
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {value} из {max}
          </span>
          <span className="text-xs text-gray-500">
            {percentage === 100 ? 'Завершено' : 'В процессе'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
