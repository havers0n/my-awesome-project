import React, { useState } from "react";
import { ProductCell } from "./ProductCell";
import { FilterButton, FilterGroup } from "./FilterButton";
import { SearchBar } from "./SearchBar";
import { MetricCard } from "./MetricCard";
import { Card } from "../atoms";
import { Text } from "../atoms/Typography";

export const MigratedMoleculesDemo: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  };

  const searchSuggestions = [
    { id: '1', text: 'iPhone 15 Pro', category: 'Electronics', count: 23 },
    { id: '2', text: 'MacBook Air', category: 'Electronics', count: 45 },
    { id: '3', text: 'iPad Pro', category: 'Electronics', count: 12 },
    { id: '4', text: 'AirPods Pro', category: 'Electronics', count: 67 },
    { id: '5', text: 'Apple Watch', category: 'Electronics', count: 34 },
  ];

  const recentSearches = ['iPhone 15', 'MacBook Pro', 'iPad Air', 'AirPods Max'];

  const filters = [
    {
      id: 'electronics',
      label: 'Electronics',
      iconName: 'laptop' as const,
      active: selectedFilters.includes('electronics'),
      count: 145,
    },
    {
      id: 'clothing',
      label: 'Clothing',
      iconName: 'shirt' as const,
      active: selectedFilters.includes('clothing'),
      count: 89,
    },
    {
      id: 'books',
      label: 'Books',
      iconName: 'book' as const,
      active: selectedFilters.includes('books'),
      count: 234,
    },
    {
      id: 'home',
      label: 'Home & Garden',
      iconName: 'home' as const,
      active: selectedFilters.includes('home'),
      count: 67,
    },
    {
      id: 'sale',
      label: 'On Sale',
      iconName: 'tag' as const,
      active: selectedFilters.includes('sale'),
      count: 45,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <Text variant="h1" size="2xl" weight="bold" className="mb-4">
          Migrated Molecules Demo (Phase 2)
        </Text>
        <Text variant="p" color="secondary" className="mb-6">
          Демонстрация обновленных molecules компонентов с использованием атомарных компонентов
        </Text>
      </div>

      {/* SearchBar Demo */}
      <Card className="p-6">
        <Text variant="h2" size="lg" weight="semibold" className="mb-4">
          SearchBar Component
        </Text>
        <div className="space-y-4">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={value => console.log('Search:', value)}
            placeholder="Search products..."
            suggestions={searchSuggestions}
            recentSearches={recentSearches}
            onSuggestionSelect={suggestion => {
              console.log('Selected:', suggestion);
              setSearchValue(suggestion.text);
            }}
            showSearchButton
            showClearButton
            size="md"
          />

          <div className="mt-4">
            <Text variant="label" size="sm" color="secondary" className="mb-2">
              Compact version:
            </Text>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Quick search..."
              size="sm"
              showSearchButton={false}
              showSuggestions={false}
            />
          </div>
        </div>
      </Card>

      {/* FilterButton Demo */}
      <Card className="p-6">
        <Text variant="h2" size="lg" weight="semibold" className="mb-4">
          FilterButton & FilterGroup Components
        </Text>
        <div className="space-y-4">
          <div>
            <Text variant="label" size="sm" color="secondary" className="mb-2">
              Individual Filter Buttons:
            </Text>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="Electronics"
                iconName="laptop"
                onClick={() => console.log('Electronics filter')}
                active={selectedFilters.includes('electronics')}
                count={145}
              />
              <FilterButton
                label="On Sale"
                iconName="tag"
                onClick={() => console.log('Sale filter')}
                active={selectedFilters.includes('sale')}
                count={45}
                variant="filled"
              />
              <FilterButton
                label="New Arrivals"
                iconName="star"
                onClick={() => console.log('New arrivals')}
                loading={false}
                count={23}
                variant="outlined"
              />
            </div>
          </div>

          <div>
            <Text variant="label" size="sm" color="secondary" className="mb-2">
              Filter Group:
            </Text>
            <FilterGroup
              filters={filters}
              onFilterChange={handleFilterChange}
              title="Product Categories"
              size="md"
              variant="default"
              multiple
            />
          </div>
        </div>
      </Card>

      {/* MetricCard Demo */}
      <Card className="p-6">
        <Text variant="h2" size="lg" weight="semibold" className="mb-4">
          MetricCard Component
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Total Revenue"
            value={245680}
            format="currency"
            change={12.5}
            changeType="increase"
            iconName="dollar-sign"
            badge={{ text: 'This Month', color: 'success' }}
            size="md"
          />

          <MetricCard
            title="Active Users"
            value={1342}
            change={-5.2}
            changeType="decrease"
            iconName="users"
            progress={{ value: 85, max: 100, color: 'bg-blue-500' }}
            status="warning"
            size="md"
          />

          <MetricCard
            title="Conversion Rate"
            value={3.2}
            format="percentage"
            change={0.8}
            changeType="increase"
            iconName="trending-up"
            description="Visitors who made a purchase"
            accentColor="success"
            actions={[
              { label: 'View Details', icon: 'eye', onClick: () => console.log('View details') },
              { label: 'Export', icon: 'download', onClick: () => console.log('Export') },
            ]}
            size="md"
          />

          <MetricCard
            title="Page Views"
            value={98752}
            change={18.2}
            changeType="increase"
            iconName="eye"
            subtitle="Last 7 days"
            period="previous week"
            size="md"
            onClick={() => console.log('Clicked metric card')}
          />

          <MetricCard
            title="Server Load"
            value={67}
            format="percentage"
            iconName="cpu"
            status="success"
            progress={{ value: 67, max: 100, color: 'bg-green-500' }}
            size="md"
          />

          <MetricCard title="Loading State" value={0} iconName="loader" loading={true} size="md" />
        </div>
      </Card>

      {/* ProductCell Demo */}
      <Card className="p-6">
        <Text variant="h2" size="lg" weight="semibold" className="mb-4">
          ProductCell Component
        </Text>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProductCell
              imageUrl="https://via.placeholder.com/64x64"
              title="iPhone 15 Pro"
              description="Latest Apple smartphone with titanium design"
              price="$999.00"
              metadata="SKU: IPH15PRO"
              status="available"
              stockCount={25}
              rating={4.8}
              discount={10}
              isFavorite={false}
              onToggleFavorite={() => console.log('Toggle favorite')}
              showActions={true}
              onQuickView={() => console.log('Quick view')}
              onAddToCart={() => console.log('Add to cart')}
              variant="card"
              size="md"
            />

            <ProductCell
              imageUrl="https://via.placeholder.com/64x64"
              title="MacBook Air M3"
              description="Powerful laptop with M3 chip"
              price="$1,299.00"
              metadata="SKU: MBA13M3"
              status="low-stock"
              stockCount={3}
              rating={4.9}
              isFavorite={true}
              onToggleFavorite={() => console.log('Toggle favorite')}
              showActions={true}
              onQuickView={() => console.log('Quick view')}
              onAddToCart={() => console.log('Add to cart')}
              variant="card"
              size="md"
            />
          </div>

          <div>
            <Text variant="label" size="sm" color="secondary" className="mb-2">
              Compact horizontal layout:
            </Text>
            <div className="space-y-2">
              <ProductCell
                imageUrl="https://via.placeholder.com/40x40"
                title="AirPods Pro"
                price="$249.00"
                status="available"
                layout="horizontal"
                size="sm"
                variant="compact"
              />
              <ProductCell
                imageUrl="https://via.placeholder.com/40x40"
                title="iPad Pro 12.9"
                price="$1,099.00"
                status="out-of-stock"
                layout="horizontal"
                size="sm"
                variant="compact"
              />
            </div>
          </div>

          <div>
            <Text variant="label" size="sm" color="secondary" className="mb-2">
              Vertical layout:
            </Text>
            <div className="grid grid-cols-3 gap-4">
              <ProductCell
                imageUrl="https://via.placeholder.com/80x80"
                title="Apple Watch Series 9"
                price="$399.00"
                rating={4.7}
                layout="vertical"
                size="md"
                variant="card"
              />
              <ProductCell
                imageUrl="https://via.placeholder.com/80x80"
                title="Magic Mouse"
                price="$79.00"
                rating={4.2}
                layout="vertical"
                size="md"
                variant="card"
              />
              <ProductCell
                imageUrl="https://via.placeholder.com/80x80"
                title="Magic Keyboard"
                price="$179.00"
                rating={4.5}
                layout="vertical"
                size="md"
                variant="card"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <Text variant="h2" size="lg" weight="semibold" className="mb-4">
          Migration Summary - Week 1-2 ✅
        </Text>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Text variant="span" size="sm">
              <strong>ProductCell</strong>: Enhanced with actions, ratings, status indicators, and
              better accessibility
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Text variant="span" size="sm">
              <strong>FilterButton</strong>: Updated to use atomic Icon, improved interaction
              patterns
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Text variant="span" size="sm">
              <strong>MetricCard</strong>: Completely rewritten with new features: progress bars,
              actions, loading states
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Text variant="span" size="sm">
              <strong>SearchBar</strong>: Brand new component with suggestions, recent searches, and
              keyboard navigation
            </Text>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <Text variant="h3" size="md" weight="medium" className="mb-2">
            Key Improvements:
          </Text>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>✅ Using only atomic components</li>
            <li>✅ Simplified props through composition</li>
            <li>✅ Improved accessibility with ARIA labels, keyboard navigation</li>
            <li>✅ Better responsive design</li>
            <li>✅ Loading states and error handling</li>
            <li>✅ Consistent theming and dark mode support</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default MigratedMoleculesDemo;
