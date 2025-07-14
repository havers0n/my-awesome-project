import React, { useState } from "react";
import { Text } from "@/shared/ui/atoms";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";

interface ChartHeaderProps {
  title: string;
  subtitle?: string;
  dropdownOptions?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  selectedOption?: string;
  onOptionChange?: (value: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  title,
  subtitle,
  dropdownOptions,
  selectedOption,
  onOptionChange,
  actions,
  className = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOptionSelect = (value: string) => {
    onOptionChange?.(value);
    setIsDropdownOpen(false);
  };

  const selectedOptionLabel =
    dropdownOptions?.find(option => option.value === selectedOption)?.label || selectedOption;

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex-1">
        <Text variant="h3" size="lg" weight="semibold" color="primary">
          {title}
        </Text>
        {subtitle && (
          <Text variant="p" size="sm" color="secondary" className="mt-1">
            {subtitle}
          </Text>
        )}
      </div>

      <div className="flex items-center gap-3">
        {dropdownOptions && dropdownOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="dropdown-toggle flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {selectedOptionLabel}
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <Dropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              className="min-w-[180px]"
            >
              <div className="py-1">
                {dropdownOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedOption === option.value
                        ? 'bg-gray-50 dark:bg-gray-700 text-brand-600 dark:text-brand-400'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default ChartHeader;
