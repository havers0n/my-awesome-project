import React, { useState, useMemo, useEffect } from 'react';
import { Warehouse, Zap, Search, Plus, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types/warehouse';
import { fetchAllProducts, addProduct, deleteProduct } from '@/services/warehouseApi';

// Импорт новой функции для операций
import { getProductOperations, getSuppliers, getSupplierDeliveryInfo, getMLForecast, createOutOfStockReport } from '@/services/warehouseApi';

// Компоненты
const StatCard: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color = "text-gray-800" }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const Header: React.FC<{ 
  stats: { total: number; inStock: number; lowStock: number; outOfStock: number }; 
  error?: string | null;
  onOpenReports: () => void;
}> = ({ stats, error, onOpenReports }) => {
  const { t } = useTranslation();
  return (
    <header className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="bg-amber-600 p-3 rounded-xl text-white">
          <Warehouse className="w-8 h-8"/>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{t('inventory.management.title')}</h1>
          <p className="text-gray-400">{t('inventory.management.subtitle')}</p>
          {error && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>{t('inventory.management.warning.title')}:</strong> {error}. {t('inventory.management.warning.demoData')}.
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenReports}
            className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300"
          >
            <span>📋</span>
            {t('inventory.management.reports.title')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('inventory.management.stats.totalSKU')} value={stats.total} />
        <StatCard label={t('inventory.management.stats.inStock')} value={stats.inStock} color="text-green-600" />
        <StatCard label={t('inventory.management.stats.lowStock')} value={stats.lowStock} color="text-yellow-600" />
        <StatCard label={t('inventory.management.stats.outOfStock')} value={stats.outOfStock} color="text-red-600" />
      </div>
    </header>
  );
};

const DonutChart: React.FC<{ 
  data: { name: string; value: number; color: string }[];
  total: number;
  onSliceClick?: (payload: any) => void;
}> = ({ data, total, onSliceClick }) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Простая реализация круговой диаграммы без recharts
  const createPieSlice = (startAngle: number, endAngle: number, color: string, index: number) => {
    const centerX = 100;
    const centerY = 100;
    const innerRadius = 65;
    const outerRadius = 85;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    const pathData = [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
      'Z'
    ].join(' ');
    
    return (
      <path
        key={index}
        d={pathData}
        fill={color}
        stroke={color}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:opacity-80"
        onClick={() => onSliceClick && onSliceClick({ name: data[index].name })}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        style={{
          filter: hoveredIndex === index ? 'brightness(1.1)' : 'brightness(1)',
        }}
      />
    );
  };

  let currentAngle = 0;
  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const slice = createPieSlice(currentAngle, currentAngle + angle, item.color, index);
    currentAngle += angle;
    return slice;
  });

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {slices}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-bold text-gray-800">{total}</span>
        <span className="text-sm text-gray-400">{t('inventory.management.donutChart.totalProducts')}</span>
      </div>
    </div>
  );
};

const QuickActions: React.FC<{
  products: Product[];
  onFilterChange: (status: string | null) => void;
  activeFilter: string | null;
}> = ({ products, onFilterChange, activeFilter }) => {
  const { t } = useTranslation();
  
  const data = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    const counts = {
      'inStock': 0,
      'lowStock': 0,
      'outOfStock': 0,
    };

    products.forEach(product => {
      const totalStock = product.stock_by_location 
        ? product.stock_by_location.reduce((sum, loc) => sum + Number(loc.stock), 0)
        : 0;
        
      if (totalStock === 0) counts['outOfStock']++;
      else if (totalStock <= 10) counts['lowStock']++;
      else counts['inStock']++;
    });

    return [
      { name: 'inStock', value: counts['inStock'], color: '#22c55e', label: t('inventory.management.status.inStock') },
      { name: 'lowStock', value: counts['lowStock'], color: '#d97706', label: t('inventory.management.status.lowStock') },
      { name: 'outOfStock', value: counts['outOfStock'], color: '#991b1b', label: t('inventory.management.status.outOfStock') },
    ].filter(item => item.value > 0);
  }, [products]);

  const totalProducts = useMemo(() => products?.length || 0, [products]);

  const handleFilter = (status: string) => {
    if (activeFilter === status) {
      onFilterChange(null);
    } else {
      onFilterChange(status);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
          <Zap className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{t('inventory.management.quickActions.title')}</h2>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-48 md:h-full min-h-[160px]">
          <DonutChart 
            data={data} 
            total={totalProducts} 
            onSliceClick={(payload) => handleFilter(payload.name)} 
          />
        </div>
        
        <ul className="space-y-3 self-center">
          {data.map(item => {
            const isActive = activeFilter === item.name;
            return (
              <li
                key={item.name}
                onClick={() => handleFilter(item.name)}
                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className={`font-semibold text-gray-700 ${isActive ? 'font-bold' : ''}`}>
                  {item.value} {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const ReportForm: React.FC<{
  products: Product[];
  onReportSubmit: (productId: number) => Promise<void>;
}> = ({ products, onReportSubmit }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0,5));
  const [productSearchQuery, setProductSearchQuery] = useState('');

  useEffect(() => {
    if (selectedProductId && !products.find(p => p.product_id === parseInt(selectedProductId))) {
      setSelectedProductId('');
    }
  }, [products, selectedProductId]);

  // Фильтрация товаров по поисковому запросу
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery) return products;
    
    const lowerCaseQuery = productSearchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.product_name.toLowerCase().includes(lowerCaseQuery) ||
      product.sku.toLowerCase().includes(lowerCaseQuery)
    );
  }, [products, productSearchQuery]);

  const handleSetNow = () => {
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0,5));
  };

  const resetForm = () => {
    setSelectedProductId('');
    setProductSearchQuery('');
    handleSetNow();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setIsLoading(true);
    try {
      await onReportSubmit(parseInt(selectedProductId));
      alert(t('inventory.management.reportForm.successMessage'));
      resetForm();
    } catch (error) {
      alert(t('inventory.management.reportForm.errorMessage'));
      console.error("Failed to submit report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{t('inventory.management.reportForm.title')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productSelect">{t('inventory.management.reportForm.selectProduct')}</label>
          
          {/* Поле поиска товаров */}
          <div className="mb-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('inventory.management.reportForm.searchPlaceholder')}
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600 text-sm"
            />
            {productSearchQuery && (
              <button
                type="button"
                onClick={() => setProductSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Выпадающий список товаров */}
          <select 
            id="productSelect"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            <option value="" disabled>{t('inventory.management.reportForm.selectProduct')}</option>
            {filteredProducts.map(product => (
              <option key={product.product_id} value={product.product_id}>
                {product.product_name}
              </option>
            ))}
          </select>
          
          {/* Показ количества найденных товаров */}
          {productSearchQuery && (
            <p className="text-xs text-gray-500 mt-1">
              {t('inventory.management.reportForm.foundProducts', { count: filteredProducts.length, total: products.length })}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.management.reportForm.detectionDate')}</label>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600" 
            />
            <input 
              type="time" 
              value={time} 
              onChange={e => setTime(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600" 
            />
            <button 
              type="button" 
              onClick={handleSetNow} 
              className="text-sm text-amber-700 font-semibold hover:underline whitespace-nowrap"
            >
              {t('inventory.management.reportForm.setNow')}
            </button>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expectedDelivery">{t('inventory.management.reportForm.expectedDelivery')}</label>
          <input 
            type="date" 
            id="expectedDelivery" 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600" 
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !selectedProductId}
          className="w-full font-bold py-3 px-4 rounded-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl bg-amber-700 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? t('inventory.management.reportForm.sending') : t('inventory.management.reportForm.submitReport')}
        </button>
      </form>
    </div>
  );
};

const AdvancedFilters: React.FC<{
  products: Product[];
  activeFilters: {
    category: string | null;
    manufacturer: string | null;
    status: string | null;
  };
  onFilterChange: (filterType: string, value: string | null) => void;
}> = ({ products, activeFilters, onFilterChange }) => {
  const { t } = useTranslation();

  // Получаем уникальные категории и производителей
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category.name);
      }
    });
    return Array.from(categorySet).sort();
  }, [products]);

  const manufacturers = useMemo(() => {
    const manufacturerSet = new Set<string>();
    products.forEach(product => {
      if (product.manufacturer) {
        manufacturerSet.add(product.manufacturer.name);
      }
    });
    return Array.from(manufacturerSet).sort();
  }, [products]);

  const statusOptions = [
    { value: 'inStock', label: t('inventory.management.status.inStock') },
    { value: 'lowStock', label: t('inventory.management.status.lowStock') },
    { value: 'outOfStock', label: t('inventory.management.status.outOfStock') }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('inventory.management.filters.title')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Фильтр по категориям */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.management.filters.category')}</label>
          <select
            value={activeFilters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value || null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">{t('inventory.management.filters.allCategories')}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Фильтр по производителям */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.management.filters.manufacturer')}</label>
          <select
            value={activeFilters.manufacturer || ''}
            onChange={(e) => onFilterChange('manufacturer', e.target.value || null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">{t('inventory.management.filters.allManufacturers')}</option>
            {manufacturers.map(manufacturer => (
              <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
            ))}
          </select>
        </div>

        {/* Фильтр по статусу */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.management.filters.stockStatus')}</label>
          <select
            value={activeFilters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value || null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">{t('inventory.management.filters.allStatuses')}</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Активные фильтры */}
      {(activeFilters.category || activeFilters.manufacturer || activeFilters.status) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">{t('inventory.management.filters.activeFilters')}:</span>
            {activeFilters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                {t('inventory.management.filters.category')}: {activeFilters.category}
                <button
                  onClick={() => onFilterChange('category', null)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeFilters.manufacturer && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                {t('inventory.management.filters.manufacturer')}: {activeFilters.manufacturer}
                <button
                  onClick={() => onFilterChange('manufacturer', null)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeFilters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                {t('inventory.management.filters.stockStatus')}: {statusOptions.find(opt => opt.value === activeFilters.status)?.label}
                <button
                  onClick={() => onFilterChange('status', null)}
                  className="ml-1 text-amber-600 hover:text-amber-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                onFilterChange('category', null);
                onFilterChange('manufacturer', null);
                onFilterChange('status', null);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {t('inventory.management.filters.clearAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductItem: React.FC<{
  product: Product;
  onSelect: (product: Product) => void;
}> = ({ product, onSelect }) => {
  const { t } = useTranslation();
  const totalStock = product.stock_by_location 
    ? product.stock_by_location.reduce((sum, loc) => sum + Number(loc.stock), 0)
    : 0;

  return (
    <tr onClick={() => onSelect(product)} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
        {product.category && (
          <div className="text-xs text-gray-500">{t('inventory.management.productItem.category')}: {product.category.name}</div>
        )}
        {product.manufacturer && (
          <div className="text-xs text-gray-500">{t('inventory.management.productItem.manufacturer')}: {product.manufacturer.name}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{product.sku}</div>
        {product.code && (
          <div className="text-xs text-gray-400">{t('inventory.management.productItem.code')}: {product.code}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{product.price} ₽</div>
        {product.weight && (
          <div className="text-xs text-gray-400">{t('inventory.management.productItem.weight')}: {product.weight} кг</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-sm font-bold text-gray-900">{totalStock}</div>
        {product.shelf_life_hours && (
          <div className="text-xs text-gray-400">{t('inventory.management.productItem.shelfLife')}: {product.shelf_life_hours}ч</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <span className="text-amber-600 hover:text-amber-800">{t('inventory.management.productItem.details')}</span>
      </td>
    </tr>
  );
};

const SortableHeader: React.FC<{
  title: string;
  sortKey: string;
  sortConfig: any;
  onSort: (key: string) => void;
  className?: string;
}> = ({ title, sortKey, sortConfig, onSort, className }) => {
  const isSorted = sortConfig?.key === sortKey;
  const direction = sortConfig?.direction;

  return (
    <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 group">
        {title}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {isSorted ? (
            direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-300" />
          )}
        </span>
      </button>
    </th>
  );
};

const ProductList: React.FC<{
  products: Product[];
  onSelectProduct: (product: Product) => void;
  filter: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddProductClick: () => void;
  sortConfig: any;
  onSort: (key: string) => void;
}> = ({ products, onSelectProduct, filter, searchQuery, onSearchChange, onAddProductClick, sortConfig, onSort }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t('inventory.management.productList.title')}</h2>
            {filter && (
              <p className="mt-1 text-sm text-amber-700 font-semibold">
                {t('inventory.management.productList.filteredBy', { 
                  status: filter === 'inStock' ? t('inventory.management.status.inStock') : 
                           filter === 'lowStock' ? t('inventory.management.status.lowStock') : 
                           t('inventory.management.status.outOfStock')
                })}
              </p>
            )}
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder={t('inventory.management.productList.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition"
              />
            </div>
            <button 
              onClick={onAddProductClick}
              className="flex items-center gap-2 bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-amber-600 transition-colors duration-300"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('inventory.management.productList.addProduct')}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader title={t('inventory.management.productList.name')} sortKey="product_name" sortConfig={sortConfig} onSort={onSort} className="text-left" />
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">{t('inventory.management.productList.sku')}</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">{t('inventory.management.productList.price')}</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">{t('inventory.management.productList.totalStock')}</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">{t('inventory.management.productList.details')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <ProductItem key={product.product_id} product={product} onSelect={onSelectProduct} />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  <h4 className="font-semibold text-lg text-gray-600">{t('inventory.management.productList.noProductsFound')}</h4>
                  <p className="text-sm">{t('inventory.management.productList.tryFilters')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Модальное окно для добавления продукта
const AddProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Omit<Product, 'product_id' | 'stock_by_location'>) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    price: 0
  });

  const resetForm = () => {
    setFormData({
      product_name: '',
      sku: '',
      price: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Ошибка добавления продукта:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{t('inventory.management.addProductModal.title')}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inventory.management.addProductModal.nameLabel')} <span className="text-red-500">{t('inventory.management.addProductModal.required')}</span>
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('inventory.management.addProductModal.namePlaceholder')}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inventory.management.addProductModal.skuLabel')} <span className="text-red-500">{t('inventory.management.addProductModal.required')}</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('inventory.management.addProductModal.skuPlaceholder')}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inventory.management.addProductModal.priceLabel')} <span className="text-red-500">{t('inventory.management.addProductModal.required')}</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('inventory.management.addProductModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.product_name.trim()}
              className="flex-1 py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('inventory.management.addProductModal.adding') : t('inventory.management.addProductModal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Модальное окно с деталями продукта
const ProductDetailsModal: React.FC<{
  product: Product | null;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'operations' | 'suppliers' | 'forecast'>('details');
  const [operations, setOperations] = useState<any[]>([]);
  const [isLoadingOperations, setIsLoadingOperations] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<{id: number; name: string} | null>(null);
  const [supplierAnalytics, setSupplierAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [mlForecast, setMlForecast] = useState<any>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);

  // Загружаем операции при открытии модального окна ИЛИ при переключении таба
  useEffect(() => {
    if (product && (activeTab === 'operations' || activeTab === 'details') && operations.length === 0) {
      setIsLoadingOperations(true);
      getProductOperations(product.product_id)
        .then(data => {
          setOperations(data.operations);
        })
        .catch(error => {
          console.error('Failed to load operations:', error);
          setOperations([]);
        })
        .finally(() => {
          setIsLoadingOperations(false);
        });
    }
  }, [product, activeTab, operations.length]);

  // Загружаем поставщиков при открытии модального окна ИЛИ при переключении таба
  useEffect(() => {
    if (product && (activeTab === 'suppliers' || activeTab === 'details') && suppliers.length === 0) {
      setIsLoadingSuppliers(true);
      getSuppliers()
        .then(data => {
          setSuppliers(data);
        })
        .catch(error => {
          console.error('Failed to load suppliers:', error);
          setSuppliers([]);
        })
        .finally(() => {
          setIsLoadingSuppliers(false);
        });
    }
  }, [product, activeTab, suppliers.length]);

  // Загружаем аналитику поставщика при выборе
  useEffect(() => {
    if (selectedSupplier) {
      setIsLoadingAnalytics(true);
      setSupplierAnalytics(null);
      getSupplierDeliveryInfo(selectedSupplier.id)
        .then(data => {
          setSupplierAnalytics(data.analytics);
        })
        .catch(error => {
          console.error('Failed to load supplier analytics:', error);
          setSupplierAnalytics(null);
        })
        .finally(() => {
          setIsLoadingAnalytics(false);
        });
    }
  }, [selectedSupplier]);

  // Загружаем ML прогноз при открытии модального окна ИЛИ при переключении таба
  useEffect(() => {
    if (product && (activeTab === 'forecast' || activeTab === 'details') && !mlForecast) {
      setIsLoadingForecast(true);
      getMLForecast(product.product_id)
        .then(data => {
          setMlForecast(data);
        })
        .catch(error => {
          console.error('Failed to load ML forecast:', error);
          // Создаем фиктивный прогноз для демонстрации
          const mockForecast = {
            productId: product.product_id,
            forecastDays: 7,
            predictions: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
              predictedQuantity: Math.floor(Math.random() * 20) + 5,
              confidence: 0.7 + Math.random() * 0.25
            })),
            recommendations: {
              recommendedOrder: Math.floor(Math.random() * 50) + 20,
              stockoutRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
              optimalOrderDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              reason: 'На основе исторических данных продаж и текущих остатков рекомендуется пополнить запас для поддержания оптимального уровня.'
            }
          };
          setMlForecast(mockForecast);
        })
        .finally(() => {
          setIsLoadingForecast(false);
        });
    }
  }, [product, activeTab, mlForecast]);

  // Сброс состояния при смене товара
  useEffect(() => {
    setOperations([]);
    setSuppliers([]);
    setSelectedSupplier(null);
    setSupplierAnalytics(null);
    setMlForecast(null);
    setActiveTab('details');
  }, [product?.product_id]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Детали товара</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Табы */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Информация
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'operations'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              История операций
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'suppliers'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Поставщики
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'forecast'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ML прогноз
            </button>
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'details' && (
            <div>
              <div className="mb-6">
                <div className="text-lg font-semibold text-gray-900">{product.product_name}</div>
                <div className="text-gray-500">SKU: {product.sku}</div>
                {product.code && <div className="text-gray-500">Код: {product.code}</div>}
                {product.article && <div className="text-gray-500">Артикул: {product.article}</div>}
                <div className="text-gray-500">Цена: {product.price} ₽</div>
                {product.weight && <div className="text-gray-500">Вес: {product.weight} кг</div>}
                {product.shelf_life_hours && (
                  <div className="text-gray-500">Срок годности: {product.shelf_life_hours} часов</div>
                )}
              </div>

              {/* Дополнительная информация */}
              {(product.category || product.manufacturer || product.group || product.kind) && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-gray-800">Дополнительная информация:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.category && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Категория:</span>
                        <span className="font-medium text-gray-900">{product.category.name}</span>
                      </div>
                    )}
                    {product.manufacturer && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Производитель:</span>
                        <span className="font-medium text-gray-900">{product.manufacturer.name}</span>
                      </div>
                    )}
                    {product.group && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Группа:</span>
                        <span className="font-medium text-gray-900">{product.group.name}</span>
                      </div>
                    )}
                    {product.kind && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Тип:</span>
                        <span className="font-medium text-gray-900">{product.kind.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Остатки по локациям:</h3>
                {product.stock_by_location && product.stock_by_location.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Локация</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Остаток</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.stock_by_location.map(loc => (
                        <tr key={loc.location_id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{loc.location_name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center">{loc.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-sm">Нет данных об остатках</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div>
              <h3 className="font-semibold mb-4 text-gray-800">История операций:</h3>
              <OperationsHistory
                productId={product.product_id}
                isLoading={isLoadingOperations}
                operations={operations}
              />
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div>
              <h3 className="font-semibold mb-4 text-gray-800">Информация о поставщиках:</h3>
                             <SuppliersInfo
                 suppliers={suppliers}
                 onSupplierSelect={(supplierId) => {
                   const supplier = suppliers.find(s => s.id === supplierId);
                   if (supplier) {
                     setSelectedSupplier({ id: supplier.id, name: supplier.name });
                   }
                 }}
               />
              {selectedSupplier && (
                <SupplierAnalytics
                  supplierId={selectedSupplier.id}
                  supplierName={selectedSupplier.name}
                  isLoading={isLoadingAnalytics}
                  analytics={supplierAnalytics}
                  onBack={() => setSelectedSupplier(null)}
                />
              )}
            </div>
          )}

          {activeTab === 'forecast' && (
            <div>
              <h3 className="font-semibold mb-4 text-gray-800">ML прогноз:</h3>
              <MLForecastPanel
                productId={product.product_id}
                productName={product.product_name}
                isLoading={isLoadingForecast}
                forecast={mlForecast}
                onRefresh={() => {
                  setIsLoadingForecast(true);
                  getMLForecast(product.product_id)
                    .then(data => {
                      setMlForecast(data);
                    })
                    .catch(error => {
                      console.error('Failed to load ML forecast:', error);
                      setMlForecast(null);
                    })
                    .finally(() => {
                      setIsLoadingForecast(false);
                    });
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения истории операций
const OperationsHistory: React.FC<{
  productId: number;
  isLoading: boolean;
  operations: Array<{
    id: number;
    type: string;
    date: string;
    quantity: number;
    totalAmount?: number;
    costPrice?: number;
    shelfPrice?: number;
    stockOnHand?: number;
    deliveryDelayDays?: number;
    wasOutOfStock?: boolean;
    location?: {
      id: number;
      name: string;
    };
    supplier?: {
      id: number;
      name: string;
    };
    createdAt: string;
  }>;
}> = ({ productId, isLoading, operations }) => {
  const { t } = useTranslation();

  const getOperationTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase':
      case 'receipt':
        return 'text-green-600 bg-green-50';
      case 'sale':
        return 'text-red-600 bg-red-50';
      case 'correction':
        return 'text-blue-600 bg-blue-50';
      case 'writeoff':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getOperationTypeName = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase':
        return 'Закупка';
      case 'receipt':
        return 'Поступление';
      case 'sale':
        return 'Продажа';
      case 'correction':
        return 'Коррекция';
      case 'writeoff':
        return 'Списание';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Загрузка операций...</p>
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>Операции не найдены</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="space-y-3">
        {operations.map((operation) => (
          <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOperationTypeColor(operation.type)}`}>
                {getOperationTypeName(operation.type)}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(operation.date).toLocaleDateString('ru-RU')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Количество:</span>
                <span className="ml-2 font-medium">
                  {operation.type.toLowerCase() === 'sale' ? '-' : '+'}
                  {operation.quantity}
                </span>
              </div>
              
              {operation.totalAmount && (
                <div>
                  <span className="text-gray-600">Сумма:</span>
                  <span className="ml-2 font-medium">{operation.totalAmount} ₽</span>
                </div>
              )}
              
              {operation.costPrice && (
                <div>
                  <span className="text-gray-600">Цена закупки:</span>
                  <span className="ml-2 font-medium">{operation.costPrice} ₽</span>
                </div>
              )}
              
              {operation.shelfPrice && (
                <div>
                  <span className="text-gray-600">Цена продажи:</span>
                  <span className="ml-2 font-medium">{operation.shelfPrice} ₽</span>
                </div>
              )}
              
              {operation.stockOnHand !== undefined && (
                <div>
                  <span className="text-gray-600">Остаток после:</span>
                  <span className="ml-2 font-medium">{operation.stockOnHand}</span>
                </div>
              )}
              
              {operation.location && (
                <div>
                  <span className="text-gray-600">Локация:</span>
                  <span className="ml-2 font-medium">{operation.location.name}</span>
                </div>
              )}
              
              {operation.supplier && (
                <div>
                  <span className="text-gray-600">Поставщик:</span>
                  <span className="ml-2 font-medium">{operation.supplier.name}</span>
                </div>
              )}
              
              {operation.deliveryDelayDays && operation.deliveryDelayDays > 0 && (
                <div className="col-span-2">
                  <span className="text-yellow-600">Задержка поставки:</span>
                  <span className="ml-2 font-medium">{operation.deliveryDelayDays} дней</span>
                </div>
              )}
              
              {operation.wasOutOfStock && (
                <div className="col-span-2">
                  <span className="text-red-600">⚠️ Товар отсутствовал на складе</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент для отображения информации о поставщиках
const SuppliersInfo: React.FC<{
  suppliers: Array<{ id: number; name: string; }>;
  onSupplierSelect: (supplierId: number) => void;
}> = ({ suppliers, onSupplierSelect }) => {
  const { t } = useTranslation();

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>Информация о поставщиках недоступна</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-800 mb-3">Поставщики</h4>
      {suppliers.map((supplier) => (
        <div 
          key={supplier.id}
          onClick={() => onSupplierSelect(supplier.id)}
          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="font-medium text-gray-900">{supplier.name}</div>
          <div className="text-sm text-amber-600">Нажмите для просмотра аналитики</div>
        </div>
      ))}
    </div>
  );
};

// Компонент для отображения детальной аналитики поставщика
const SupplierAnalytics: React.FC<{
  supplierId: number;
  supplierName: string;
  isLoading: boolean;
  analytics: {
    totalDeliveries: number;
    averageDelay: number;
    totalAmount: number;
    onTimeDeliveries: number;
    delayedDeliveries: number;
    recentDeliveries: Array<{
      date: string;
      delay: number;
      amount: number;
      product: {
        id: number;
        name: string;
      } | null;
    }>;
  } | null;
  onBack: () => void;
}> = ({ supplierId, supplierName, isLoading, analytics, onBack }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Загрузка аналитики...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Данные недоступны</p>
        <button
          onClick={onBack}
          className="mt-2 text-amber-600 hover:text-amber-700 underline"
        >
          Назад к списку
        </button>
      </div>
    );
  }

  const onTimePercentage = analytics.totalDeliveries > 0 
    ? (analytics.onTimeDeliveries / analytics.totalDeliveries * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">Аналитика: {supplierName}</h4>
        <button
          onClick={onBack}
          className="text-amber-600 hover:text-amber-700 underline text-sm"
        >
          ← Назад
        </button>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalDeliveries}</div>
          <div className="text-sm text-blue-800">Всего поставок</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{onTimePercentage}%</div>
          <div className="text-sm text-green-800">Вовремя</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{analytics.averageDelay.toFixed(1)}</div>
          <div className="text-sm text-yellow-800">Ср. задержка (дни)</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{analytics.totalAmount.toLocaleString('ru-RU')} ₽</div>
          <div className="text-sm text-purple-800">Общая сумма</div>
        </div>
      </div>

      {/* Последние поставки */}
      {analytics.recentDeliveries.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Последние поставки</h5>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {analytics.recentDeliveries.map((delivery, index) => (
              <div key={index} className="p-2 border border-gray-200 rounded text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {delivery.product?.name || 'Товар не указан'}
                    </div>
                    <div className="text-gray-500">
                      {new Date(delivery.date).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{delivery.amount.toLocaleString('ru-RU')} ₽</div>
                    {delivery.delay > 0 && (
                      <div className="text-red-600">+{delivery.delay} дн.</div>
                    )}
                    {delivery.delay === 0 && (
                      <div className="text-green-600">Вовремя</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент для отображения ML прогнозов
const MLForecastPanel: React.FC<{
  productId: number;
  productName: string;
  isLoading: boolean;
  forecast: {
    predictions: Array<{
      date: string;
      predictedQuantity: number;
      confidence: number;
    }>;
    recommendations: {
      recommendedOrder: number;
      stockoutRisk: 'low' | 'medium' | 'high';
      optimalOrderDate: string;
      reason: string;
    };
  } | null;
  onRefresh: () => void;
}> = ({ productId, productName, isLoading, forecast, onRefresh }) => {
  const { t } = useTranslation();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return 'Низкий риск нехватки';
      case 'medium': return 'Средний риск нехватки';
      case 'high': return 'Высокий риск нехватки';
      default: return 'Риск не определен';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Создание прогноза с помощью ML...</p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-4">Прогноз недоступен</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Получить прогноз
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка обновления */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">Прогноз продаж (ML): {productName}</h4>
        <button
          onClick={onRefresh}
          className="text-amber-600 hover:text-amber-700 underline text-sm"
        >
          Обновить прогноз
        </button>
      </div>

      {/* Рекомендации */}
      {forecast.recommendations && (
        <div className={`p-4 border rounded-lg ${getRiskColor(forecast.recommendations.stockoutRisk)}`}>
          <div className="flex items-start justify-between mb-2">
            <h5 className="font-semibold">Рекомендации по заказу</h5>
            <span className="text-sm font-medium">
              {getRiskText(forecast.recommendations.stockoutRisk)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-sm opacity-75">Рекомендуемый заказ:</span>
              <div className="text-lg font-bold">{forecast.recommendations.recommendedOrder} ед.</div>
            </div>
            <div>
              <span className="text-sm opacity-75">Оптимальная дата заказа:</span>
              <div className="text-lg font-bold">
                {new Date(forecast.recommendations.optimalOrderDate).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
          
          <div className="text-sm">
            <strong>Обоснование:</strong> {forecast.recommendations.reason}
          </div>
        </div>
      )}

      {/* График прогноза */}
      <div>
        <h5 className="font-medium text-gray-700 mb-3">Прогноз на ближайшие дни</h5>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {forecast.predictions.map((prediction, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium">
                  {new Date(prediction.date).toLocaleDateString('ru-RU', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-gray-500">
                  Достоверность: {(prediction.confidence * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {prediction.predictedQuantity} ед.
                </div>
                <div className="text-sm text-gray-500">прогноз продаж</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Визуальный график (простая реализация) */}
      <div>
        <h5 className="font-medium text-gray-700 mb-3">Визуализация прогноза</h5>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-end justify-between h-32 space-x-1">
            {forecast.predictions.slice(0, 7).map((prediction, index) => {
              const maxValue = Math.max(...forecast.predictions.map(p => p.predictedQuantity));
              const height = (prediction.predictedQuantity / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-amber-500 rounded-t transition-all duration-300 hover:bg-amber-600 w-full min-h-1"
                    style={{ height: `${height}%` }}
                    title={`${prediction.predictedQuantity} ед. (${(prediction.confidence * 100).toFixed(1)}%)`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                    {new Date(prediction.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения ABC/XYZ анализа и аналитики оборачиваемости
const InventoryAnalytics: React.FC<{
  products: Product[];
}> = ({ products }) => {
  const { t } = useTranslation();

  // Вычисляем ABC анализ (по объему продаж)
  const abcAnalysis = useMemo(() => {
    if (!products || products.length === 0) return { A: [], B: [], C: [] };

    // Имитируем данные продаж для демонстрации
    const productsWithSales = products.map(product => {
      const totalStock = product.stock_by_location?.reduce((sum, loc) => sum + loc.stock, 0) || 0;
      const estimatedMonthlySales = Math.max(1, Math.floor(Math.random() * 100) + totalStock * 0.5);
      const revenue = estimatedMonthlySales * product.price;
      
      return {
        ...product,
        monthlySales: estimatedMonthlySales,
        revenue,
        turnoverRate: totalStock > 0 ? estimatedMonthlySales / totalStock : 0
      };
    });

    // Сортируем по доходу
    const sortedByRevenue = [...productsWithSales].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = sortedByRevenue.reduce((sum, p) => sum + p.revenue, 0);

    let cumulativeRevenue = 0;
    const result = { A: [] as any[], B: [] as any[], C: [] as any[] };

    sortedByRevenue.forEach(product => {
      cumulativeRevenue += product.revenue;
      const percentage = (cumulativeRevenue / totalRevenue) * 100;

      if (percentage <= 80) {
        result.A.push(product);
      } else if (percentage <= 95) {
        result.B.push(product);
      } else {
        result.C.push(product);
      }
    });

    return result;
  }, [products]);

  // XYZ анализ (по стабильности спроса)
  const xyzAnalysis = useMemo(() => {
    const result = { X: [] as any[], Y: [] as any[], Z: [] as any[] };

    Object.values(abcAnalysis).flat().forEach(product => {
      // Имитируем коэффициент вариации спроса
      const demandVariation = Math.random();
      
      if (demandVariation < 0.3) {
        result.X.push({ ...product, demandStability: 'Стабильный', variation: demandVariation });
      } else if (demandVariation < 0.6) {
        result.Y.push({ ...product, demandStability: 'Умеренный', variation: demandVariation });
      } else {
        result.Z.push({ ...product, demandStability: 'Нестабильный', variation: demandVariation });
      }
    });

    return result;
  }, [abcAnalysis]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'A': return 'bg-red-100 text-red-800 border-red-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-green-100 text-green-800 border-green-200';
      case 'X': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Y': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Z': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Аналитика товарооборота</h2>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{products.length}</div>
          <div className="text-sm text-blue-800">Всего позиций</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{abcAnalysis.A.length}</div>
          <div className="text-sm text-red-800">Категория A (80% дохода)</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{abcAnalysis.B.length}</div>
          <div className="text-sm text-yellow-800">Категория B (15% дохода)</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{abcAnalysis.C.length}</div>
          <div className="text-sm text-green-800">Категория C (5% дохода)</div>
        </div>
      </div>

      {/* ABC/XYZ матрица */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ABC/XYZ Матрица</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">X (Стабильный)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Y (Умеренный)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Z (Нестабильный)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {['A', 'B', 'C'].map(abcCat => (
                <tr key={abcCat}>
                  <td className={`px-4 py-2 font-medium border ${getCategoryColor(abcCat)}`}>
                    {abcCat}
                  </td>
                  {['X', 'Y', 'Z'].map(xyzCat => {
                    const count = Object.values(abcAnalysis).flat().filter(product => {
                      const isAbcMatch = (abcCat === 'A' && abcAnalysis.A.includes(product)) ||
                                       (abcCat === 'B' && abcAnalysis.B.includes(product)) ||
                                       (abcCat === 'C' && abcAnalysis.C.includes(product));
                      const isXyzMatch = xyzAnalysis[xyzCat as keyof typeof xyzAnalysis].some(p => p.product_id === product.product_id);
                      return isAbcMatch && isXyzMatch;
                    }).length;

                    return (
                      <td key={xyzCat} className="px-4 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${count > 0 ? 'bg-amber-100 text-amber-800' : 'text-gray-400'}`}>
                          {count}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Топ товары по категориям */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(abcAnalysis).map(([category, productsList]) => (
          <div key={category} className="border border-gray-200 rounded-lg p-4">
            <h4 className={`font-semibold mb-3 px-2 py-1 rounded text-center ${getCategoryColor(category)}`}>
              Категория {category} ({productsList.length} товаров)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {productsList.slice(0, 5).map((product: any) => (
                <div key={product.product_id} className="text-sm border-b border-gray-100 pb-2">
                  <div className="font-medium text-gray-900">{product.product_name}</div>
                  <div className="text-gray-500">
                    Оборот: {product.turnoverRate.toFixed(1)} | 
                    Доход: {product.revenue.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ))}
              {productsList.length > 5 && (
                <div className="text-xs text-gray-500 text-center">
                  +{productsList.length - 5} товаров
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Рекомендации */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-semibold text-amber-800 mb-2">💡 Рекомендации по управлению запасами</h4>
        <div className="text-sm text-amber-700 space-y-1">
          <div>• <strong>Категория A:</strong> Приоритетный контроль, частые поставки, минимальные запасы</div>
          <div>• <strong>Категория B:</strong> Умеренный контроль, регулярный мониторинг</div>
          <div>• <strong>Категория C:</strong> Простое управление, возможны большие партии</div>
          <div>• <strong>XYZ анализ:</strong> X - точные прогнозы, Y - средние запасы, Z - страховые запасы</div>
        </div>
      </div>
    </div>
  );
};

// Главный компонент
const InventoryManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<any>(null);
  const [advancedFilters, setAdvancedFilters] = useState<{
    category: string | null;
    manufacturer: string | null;
    status: string | null;
  }>({
    category: null,
    manufacturer: null,
    status: null
  });
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  // Загрузка данных
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const apiProducts = await fetchAllProducts();
        
        // Проверяем что получили массив
        if (Array.isArray(apiProducts)) {
          setProducts(apiProducts);
        } else {
          console.warn('API returned non-array data:', apiProducts);
          throw new Error('API вернул некорректные данные');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Ошибка загрузки данных');
        console.error('Failed to load products:', error);
        
        // Моковые данные для fallback
        setProducts([
          {
            product_id: 1,
            product_name: 'Колбаса докторская',
            price: 450,
            sku: 'KOL001',
            stock_by_location: [
              { location_id: 1, location_name: 'Центральный склад', stock: 36 },
              { location_id: 2, location_name: 'Магазин на Ленина', stock: 12 }
            ]
          },
          {
            product_id: 2,
            product_name: 'Сыр российский',
            price: 380,
            sku: 'SYR001',
            stock_by_location: [
              { location_id: 1, location_name: 'Центральный склад', stock: 7 }
            ]
          },
          {
            product_id: 3,
            product_name: 'Молоко 3.2%',
            price: 65,
            sku: 'MOL001',
            stock_by_location: [
              { location_id: 1, location_name: 'Центральный склад', stock: 0 }
            ]
          }
        ]);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Статистика
  const stats = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };
    }
    
    return products.reduce((acc, product) => {
      const totalStock = product.stock_by_location 
        ? product.stock_by_location.reduce((sum, loc) => sum + Number(loc.stock), 0)
        : 0;
        
      acc.total++;
      if (totalStock === 0) acc.outOfStock++;
      else if (totalStock <= 10) acc.lowStock++;
      else acc.inStock++;
      
      return acc;
    }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  }, [products]);

  // Обработчики
  const handleReportSubmit = async (productId: number) => {
    try {
      const product = products.find(p => p.product_id === productId);
      if (!product) {
        throw new Error('Продукт не найден');
      }

      // Отправляем отчет через API
      const result = await createOutOfStockReport({
        productId: productId,
        quantityNeeded: 1,
        priority: 'medium',
        notes: `Отчет о нехватке товара "${product.product_name}" создан через интерфейс управления запасами`
      });
      
      console.log('Отчет успешно создан:', result);
      
    } catch (error) {
      console.error('Ошибка отправки отчета:', error);
      throw error;
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddProduct = async (productData: Omit<Product, 'product_id' | 'stock_by_location'>) => {
    try {
      // Попытка добавить через API
      const newProduct = await addProduct(productData);
      
      // Если API недоступно, добавляем локально для демонстрации
      const localProduct: Product = {
        ...productData,
        product_id: Date.now(),
        stock_by_location: []
      };
      
      setProducts(prev => [...prev, localProduct]);
      console.log('Продукт добавлен:', localProduct.product_name);
    } catch (error) {
      console.error('Ошибка добавления продукта:', error);
      
      // Добавляем локально в случае ошибки API
      const localProduct: Product = {
        ...productData,
        product_id: Date.now(),
        stock_by_location: []
      };
      
      setProducts(prev => [...prev, localProduct]);
      console.log('Продукт добавлен локально (API недоступно):', localProduct.product_name);
    }
  };

  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleAdvancedFilterChange = (filterType: string, value: string | null) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Фильтрация и сортировка
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    let result = [...products];
    
    // Фильтрация по поиску
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.product_name.toLowerCase().includes(lowerCaseQuery) ||
        p.sku.toLowerCase().includes(lowerCaseQuery) ||
        (p.code && p.code.toLowerCase().includes(lowerCaseQuery)) ||
        (p.category && p.category.name.toLowerCase().includes(lowerCaseQuery)) ||
        (p.manufacturer && p.manufacturer.name.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    // Фильтрация по категории
    if (advancedFilters.category) {
      result = result.filter(product => 
        product.category && product.category.name === advancedFilters.category
      );
    }

    // Фильтрация по производителю
    if (advancedFilters.manufacturer) {
      result = result.filter(product => 
        product.manufacturer && product.manufacturer.name === advancedFilters.manufacturer
      );
    }

    // Фильтрация по статусу (новая логика)
    const statusFilter = advancedFilters.status || activeFilter;
    if (statusFilter) {
      result = result.filter(product => {
        const totalStock = product.stock_by_location 
          ? product.stock_by_location.reduce((sum, loc) => sum + Number(loc.stock), 0)
          : 0;
          
        if (statusFilter === 'outOfStock') return totalStock === 0;
        if (statusFilter === 'lowStock') return totalStock > 0 && totalStock <= 10;
        if (statusFilter === 'inStock') return totalStock > 10;
        return true;
      });
    }
    
    // Сортировка
    if (sortConfig && sortConfig.key === 'product_name') {
      result.sort((a, b) => {
        if (a.product_name < b.product_name) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a.product_name > b.product_name) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [products, searchQuery, activeFilter, advancedFilters, sortConfig]);

  if (isInitialLoading) {
    return (
      <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
        <div className="container mx-auto p-4 md:p-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <Header stats={stats} error={error} onOpenReports={() => setIsReportsModalOpen(true)} />
        
        <div className="animate-fadeIn">
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <QuickActions 
                products={products} 
                onFilterChange={setActiveFilter} 
                activeFilter={activeFilter} 
              />
            </div>
            <div className="lg:col-span-2">
              <ReportForm 
                products={products} 
                onReportSubmit={handleReportSubmit} 
              />
            </div>
          </main>
          
          <AdvancedFilters 
            products={products}
            activeFilters={advancedFilters}
            onFilterChange={handleAdvancedFilterChange}
          />
          
          <ProductList 
            products={filteredProducts} 
            onSelectProduct={handleSelectProduct} 
            filter={activeFilter} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddProductClick={() => setIsAddModalOpen(true)}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          <div className="mt-8">
            <InventoryAnalytics products={products} />
          </div>
        </div>
        
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddProduct}
        />
        
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />

        {isReportsModalOpen && (
          <OutOfStockReportsPanel
            onClose={() => setIsReportsModalOpen(false)}
          />
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// Компонент для отображения системы отчетов о нехватке товаров
const OutOfStockReportsPanel: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Загружаем отчеты при открытии
  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);
        const { getOutOfStockReports } = await import('@/services/warehouseApi');
        const data = await getOutOfStockReports();
        setReports(data);
      } catch (error) {
        console.error('Failed to load reports:', error);
        // Создаем демонстрационные данные
        setReports([
          {
            id: 1,
            quantityNeeded: 10,
            priority: 'high',
            notes: 'Срочно требуется пополнение',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            product: { id: 1, name: 'Молоко 3.2%', sku: 'MOL001' },
            location: { id: 1, name: 'Основной склад' },
            reporter: { id: 'user1', name: 'Иван Петров' }
          },
          {
            id: 2,
            quantityNeeded: 5,
            priority: 'medium',
            notes: 'Требуется пополнение в ближайшее время',
            status: 'processing',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            product: { id: 2, name: 'Хлеб белый', sku: 'HLB001' },
            location: { id: 1, name: 'Основной склад' },
            reporter: { id: 'user2', name: 'Мария Сидорова' }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  // Фильтрация отчетов по статусу
  const filteredReports = useMemo(() => {
    if (selectedStatus === 'all') return reports;
    return reports.filter(report => report.status === selectedStatus);
  }, [reports, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'processing': return 'Обрабатывается';
      case 'completed': return 'Выполнено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Отчеты о нехватке товаров</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Фильтры */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Фильтр по статусу:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Все' },
                { value: 'pending', label: 'Ожидают' },
                { value: 'processing', label: 'В работе' },
                { value: 'completed', label: 'Выполнено' },
                { value: 'cancelled', label: 'Отменено' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedStatus === option.value
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Загрузка отчетов...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Отчеты не найдены</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {report.product?.name || 'Товар не указан'}
                      </h3>
                      <p className="text-sm text-gray-500">SKU: {report.product?.sku}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(report.priority)}`}>
                        {getPriorityText(report.priority)}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Количество:</span>
                      <span className="ml-2 font-medium">{report.quantityNeeded}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Локация:</span>
                      <span className="ml-2 font-medium">{report.location?.name || 'Не указана'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Автор:</span>
                      <span className="ml-2 font-medium">{report.reporter?.name || 'Неизвестен'}</span>
                    </div>
                  </div>

                  {report.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Примечания:</strong> {report.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Создано: {new Date(report.createdAt).toLocaleDateString('ru-RU')} в {new Date(report.createdAt).toLocaleTimeString('ru-RU')}
                    </div>
                    {report.status === 'pending' && (
                      <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                        Взять в работу
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagementPage; 