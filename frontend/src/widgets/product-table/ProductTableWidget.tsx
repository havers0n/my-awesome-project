import React, { useState, useEffect } from "react";
import { ProductTable, ProductData } from "@/shared/ui/organisms/ProductTable";
import { Card } from "@/shared/ui/atoms/Card";
import { Typography } from "@/shared/ui/atoms/Typography";
import { Button } from "@/shared/ui/atoms/Button";
import { useProducts } from "@/features/products/hooks/useProducts";

interface ProductTableWidgetProps {
  /** Заголовок виджета */
  title?: string;
  /** Подзаголовок виджета */
  subtitle?: string;
  /** Показать действия */
  showActions?: boolean;
  /** Максимальное количество товаров */
  maxProducts?: number;
  /** Макет отображения */
  layout?: 'horizontal' | 'vertical';
  /** Размер элементов */
  size?: 'sm' | 'md' | 'lg';
  /** Вариант отображения */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** Показать пагинацию */
  showPagination?: boolean;
  /** Категория товаров */
  categoryFilter?: string;
  /** Статус товаров */
  statusFilter?: 'all' | 'in-stock' | 'out-of-stock' | 'low-stock';
  /** Сортировка */
  sortBy?: 'name' | 'price' | 'rating' | 'status';
  /** Порядок сортировки */
  sortOrder?: 'asc' | 'desc';
  /** Обработчик клика на товар */
  onProductClick?: (product: ProductData) => void;
  /** Дополнительные CSS классы */
  className?: string;
  /** Показать фильтры */
  showFilters?: boolean;
  /** Показать статистику */
  showStats?: boolean;
}

export const ProductTableWidget: React.FC<ProductTableWidgetProps> = ({
  title = "Товары",
  subtitle = "Управление товарами",
  showActions = true,
  maxProducts,
  layout = 'horizontal',
  size = 'md',
  variant = 'default',
  showPagination = false,
  categoryFilter = '',
  statusFilter = 'all',
  sortBy = 'name',
  sortOrder = 'asc',
  onProductClick,
  className = '',
  showFilters = true,
  showStats = true,
}) => {
  const { products, loading, error, fetchProducts, categories } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedStatus, setSelectedStatus] = useState(statusFilter);
  const [selectedSortBy, setSelectedSortBy] = useState(sortBy);
  const [selectedSortOrder, setSelectedSortOrder] = useState(sortOrder);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchProducts({
      category: selectedCategory,
      status: selectedStatus,
      sortBy: selectedSortBy,
      sortOrder: selectedSortOrder,
      search: searchTerm,
    });
  }, [selectedCategory, selectedStatus, selectedSortBy, selectedSortOrder, searchTerm, fetchProducts]);

  const handleProductClick = (product: ProductData) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: typeof statusFilter) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSort = (sortBy: typeof selectedSortBy, sortOrder: typeof selectedSortOrder) => {
    setSelectedSortBy(sortBy);
    setSelectedSortOrder(sortOrder);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[selectedSortBy];
    let bValue: any = b[selectedSortBy];

    if (selectedSortBy === 'price') {
      aValue = typeof aValue === 'string' ? parseFloat(aValue.replace(/[^\d.]/g, '')) : aValue;
      bValue = typeof bValue === 'string' ? parseFloat(bValue.replace(/[^\d.]/g, '')) : bValue;
    }

    if (selectedSortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = showPagination ? sortedProducts.slice(startIndex, endIndex) : sortedProducts;
  const displayedProducts = maxProducts ? paginatedProducts.slice(0, maxProducts) : paginatedProducts;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Typography variant="h3" size="lg" weight="semibold" color="primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="p" size="sm" color="secondary" className="mt-1">
            {subtitle}
          </Typography>
        )}
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Экспорт
          </Button>
          <Button variant="primary" size="sm">
            Добавить товар
          </Button>
        </div>
      )}
    </div>
  );

  const renderFilters = () => (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryFilter(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      >
        <option value="">Все категории</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        value={selectedStatus}
        onChange={(e) => handleStatusFilter(e.target.value as typeof statusFilter)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      >
        <option value="all">Все статусы</option>
        <option value="in-stock">В наличии</option>
        <option value="out-of-stock">Нет в наличии</option>
        <option value="low-stock">Мало в наличии</option>
      </select>
      <select
        value={`${selectedSortBy}-${selectedSortOrder}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split('-');
          handleSort(sortBy as typeof selectedSortBy, sortOrder as typeof selectedSortOrder);
        }}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      >
        <option value="name-asc">По имени (А-Я)</option>
        <option value="name-desc">По имени (Я-А)</option>
        <option value="price-asc">По цене (↑)</option>
        <option value="price-desc">По цене (↓)</option>
        <option value="rating-desc">По рейтингу (↓)</option>
        <option value="rating-asc">По рейтингу (↑)</option>
      </select>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <Typography variant="p" size="sm" color="secondary">
          Всего товаров
        </Typography>
        <Typography variant="h4" size="lg" weight="bold" color="primary">
          {products.length}
        </Typography>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <Typography variant="p" size="sm" color="secondary">
          В наличии
        </Typography>
        <Typography variant="h4" size="lg" weight="bold" color="success">
          {products.filter(p => p.status === 'in-stock').length}
        </Typography>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <Typography variant="p" size="sm" color="secondary">
          Нет в наличии
        </Typography>
        <Typography variant="h4" size="lg" weight="bold" color="error">
          {products.filter(p => p.status === 'out-of-stock').length}
        </Typography>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <Typography variant="p" size="sm" color="secondary">
          Мало в наличии
        </Typography>
        <Typography variant="h4" size="lg" weight="bold" color="warning">
          {products.filter(p => p.status === 'low-stock').length}
        </Typography>
      </div>
    </div>
  );

  if (error) {
    return (
      <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
        <div className="text-center py-8">
          <Typography variant="h4" color="error" className="mb-2">
            Ошибка загрузки товаров
          </Typography>
          <Typography variant="p" color="secondary" className="mb-4">
            {error}
          </Typography>
          <Button variant="primary" onClick={() => fetchProducts()}>
            Попробовать снова
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant={variant} className={`${className} ${sizeClasses[size]}`}>
      {renderHeader()}
      {showFilters && renderFilters()}
      {showStats && renderStats()}
      
      <ProductTable
        products={displayedProducts}
        layout={layout}
        size={size}
        variant={variant}
        onProductClick={handleProductClick}
        showPagination={showPagination}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyMessage={searchTerm ? 'Товары не найдены' : 'Нет товаров'}
      />
      
      {maxProducts && filteredProducts.length > maxProducts && (
        <div className="mt-4 text-center">
          <Typography variant="p" size="sm" color="secondary">
            Показано {maxProducts} из {filteredProducts.length} товаров
          </Typography>
          <Button variant="ghost" size="sm" className="ml-2">
            Показать все
          </Button>
        </div>
      )}
    </Card>
  );
};
