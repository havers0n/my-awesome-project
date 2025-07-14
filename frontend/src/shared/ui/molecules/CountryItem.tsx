import React from "react";
import { CountryFlag, Text, COUNTRY_NAMES } from "@/shared/ui/atoms";
import { ProgressIndicator } from "./ProgressIndicator";

interface CountryItemProps {
  countryCode: string;
  countryName?: string;
  value: number;
  max?: number;
  percentage?: number;
  showProgress?: boolean;
  progressLabel?: string;
  progressColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export const CountryItem: React.FC<CountryItemProps> = ({
  countryCode,
  countryName,
  value,
  max = 100,
  percentage,
  showProgress = true,
  progressLabel,
  progressColor = 'blue',
  size = 'md',
  layout = 'horizontal',
  className = '',
}) => {
  const displayName =
    countryName ||
    COUNTRY_NAMES[countryCode as keyof typeof COUNTRY_NAMES] ||
    countryCode.toUpperCase();
  const displayPercentage = percentage !== undefined ? percentage : Math.round((value / max) * 100);

  const flagSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  };

  const textSizeMap = {
    sm: 'sm' as const,
    md: 'base' as const,
    lg: 'lg' as const,
  };

  const valueSizeMap = {
    sm: 'sm' as const,
    md: 'base' as const,
    lg: 'lg' as const,
  };

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center space-y-3 ${className}`}>
        <CountryFlag
          countryCode={countryCode}
          countryName={displayName}
          size={flagSizeMap[size]}
          showName={false}
        />

        <div className="space-y-1">
          <Text variant="label" size={textSizeMap[size]} weight="medium" color="primary">
            {displayName}
          </Text>
          <Text variant="span" size={valueSizeMap[size]} weight="semibold" color="secondary">
            {value.toLocaleString()}
          </Text>
        </div>

        {showProgress && (
          <div className="w-full">
            <ProgressIndicator
              label={progressLabel || 'Progress'}
              value={value}
              max={max}
              size={size === 'lg' ? 'md' : 'sm'}
              color={progressColor}
              showPercentage={true}
              showValue={false}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <CountryFlag
        countryCode={countryCode}
        countryName={displayName}
        size={flagSizeMap[size]}
        showName={false}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <Text
            variant="label"
            size={textSizeMap[size]}
            weight="medium"
            color="primary"
            className="truncate"
          >
            {displayName}
          </Text>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Text variant="span" size={valueSizeMap[size]} weight="semibold" color="secondary">
              {value.toLocaleString()}
            </Text>
            <Text variant="span" size="sm" color="muted">
              ({displayPercentage}%)
            </Text>
          </div>
        </div>

        {showProgress && (
          <ProgressIndicator
            label=""
            value={value}
            max={max}
            size={size === 'lg' ? 'md' : 'sm'}
            color={progressColor}
            showPercentage={false}
            showValue={false}
          />
        )}
      </div>
    </div>
  );
};

export default CountryItem;
