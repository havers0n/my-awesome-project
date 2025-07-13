import React from 'react';
import { Card, Text } from '../atoms';
import { CountryItem } from '../molecules';

export interface CountryData {
  id: string;
  countryCode: string;
  countryName?: string;
  value: number;
  max?: number;
  percentage?: number;
  progressColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
}

interface CountryListProps {
  countries: CountryData[];
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  progressLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  maxItems?: number;
  emptyMessage?: string;
  className?: string;
}

export const CountryList: React.FC<CountryListProps> = ({
  countries,
  title,
  subtitle,
  showProgress = true,
  progressLabel = 'Progress',
  size = 'md',
  layout = 'horizontal',
  variant = 'default',
  maxItems,
  emptyMessage = 'No countries data available',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const gapClasses = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  const displayedCountries = maxItems ? countries.slice(0, maxItems) : countries;

  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <div className="mb-6">
        {title && (
          <Text variant="h3" size="lg" weight="semibold" color="primary">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text variant="p" size="sm" color="secondary" className="mt-1">
            {subtitle}
          </Text>
        )}
      </div>
    );
  };

  const renderCountryItems = () => {
    if (!displayedCountries || displayedCountries.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-4 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">{emptyMessage}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Country data will appear here when available
            </p>
          </div>
        </div>
      );
    }

    if (layout === 'vertical') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayedCountries.map(country => (
            <CountryItem
              key={country.id}
              countryCode={country.countryCode}
              countryName={country.countryName}
              value={country.value}
              max={country.max}
              percentage={country.percentage}
              showProgress={showProgress}
              progressLabel={progressLabel}
              progressColor={country.progressColor}
              size={size}
              layout="vertical"
            />
          ))}
        </div>
      );
    }

    return (
      <div className={gapClasses[size]}>
        {displayedCountries.map(country => (
          <CountryItem
            key={country.id}
            countryCode={country.countryCode}
            countryName={country.countryName}
            value={country.value}
            max={country.max}
            percentage={country.percentage}
            showProgress={showProgress}
            progressLabel={progressLabel}
            progressColor={country.progressColor}
            size={size}
            layout="horizontal"
          />
        ))}
      </div>
    );
  };

  const renderFooter = () => {
    if (!maxItems || countries.length <= maxItems) return null;

    const remainingCount = countries.length - maxItems;

    return (
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Text variant="p" size="sm" color="muted" className="text-center">
          Showing {maxItems} of {countries.length} countries
          {remainingCount > 0 && (
            <span className="ml-2 text-brand-600 dark:text-brand-400">
              (+{remainingCount} more)
            </span>
          )}
        </Text>
      </div>
    );
  };

  return (
    <Card variant={variant} padding="none" className={`overflow-hidden ${className}`}>
      <div className={sizeClasses[size]}>
        {renderHeader()}
        {renderCountryItems()}
        {renderFooter()}
      </div>
    </Card>
  );
};

export default CountryList;
