import React, { useState, useMemo, useEffect } from 'react';
import { Warehouse, Zap, Search, Plus, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types/warehouse';
import { fetchAllProducts, addProduct, deleteProduct } from '@/services/warehouseApi';

// Компоненты
const StatCard: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color = "text-gray-800" }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const Header: React.FC<{ stats: { total: number; inStock: number; lowStock: number; outOfStock: number }; error?: string | null }> = ({ stats, error }) => {
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
                <strong>Предупреждение:</strong> {error}. Показаны демонстрационные данные.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('inventory.management.stats.totalSKU')} value={stats.total} />
        <StatCard label="В наличии" value={stats.inStock} color="text-green-600" />
        <StatCard label="Мало" value={stats.lowStock} color="text-yellow-600" />
        <StatCard label="Нет в наличии" value={stats.outOfStock} color="text-red-600" />
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
        <span className="text-sm text-gray-400">Всего товаров</span>
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
      { name: 'inStock', value: counts['inStock'], color: '#22c55e', label: 'В наличии' },
      { name: 'lowStock', value: counts['lowStock'], color: '#d97706', label: 'Мало' },
      { name: 'outOfStock', value: counts['outOfStock'], color: '#991b1b', label: 'Нет в наличии' },
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
        <h2 className="text-xl font-bold text-gray-800">Быстрые действия</h2>
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
      alert('Отчет успешно отправлен!');
      resetForm();
    } catch (error) {
      alert('Ошибка отправки отчета');
      console.error("Failed to submit report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Сообщить об отсутствии</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productSelect">Выберите товар</label>
          
          {/* Поле поиска товаров */}
          <div className="mb-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск товара по названию или SKU..."
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
            <option value="" disabled>Выберите товар</option>
            {filteredProducts.map(product => (
              <option key={product.product_id} value={product.product_id}>
                {product.product_name}
              </option>
            ))}
          </select>
          
          {/* Показ количества найденных товаров */}
          {productSearchQuery && (
            <p className="text-xs text-gray-500 mt-1">
              Найдено товаров: {filteredProducts.length} из {products.length}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата обнаружения</label>
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
              Сейчас
            </button>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expectedDelivery">Ожидаемая поставка</label>
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
          {isLoading ? 'Отправка...' : 'Отправить отчет'}
        </button>
      </form>
    </div>
  );
};

const ProductItem: React.FC<{
  product: Product;
  onSelect: (product: Product) => void;
}> = ({ product, onSelect }) => {
  const totalStock = product.stock_by_location 
    ? product.stock_by_location.reduce((sum, loc) => sum + Number(loc.stock), 0)
    : 0;

  return (
    <tr onClick={() => onSelect(product)} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{product.sku}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{product.price} ₽</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-sm font-bold text-gray-900">{totalStock}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <span className="text-amber-600 hover:text-amber-800">Детали</span>
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
            <h2 className="text-xl font-bold text-gray-800">Список товаров</h2>
            {filter && (
              <p className="mt-1 text-sm text-amber-700 font-semibold">
                Фильтр: {filter === 'inStock' ? 'В наличии' : filter === 'lowStock' ? 'Мало' : 'Нет в наличии'}
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
                placeholder="Поиск товаров..."
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
              <span className="hidden sm:inline">Добавить</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader title="Название" sortKey="product_name" sortConfig={sortConfig} onSort={onSort} className="text-left" />
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">SKU</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Цена</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Общий остаток</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Детали</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <ProductItem key={product.product_id} product={product} onSelect={onSelectProduct} />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  <h4 className="font-semibold text-lg text-gray-600">Нет товаров</h4>
                  <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос.</p>
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
          <h2 className="text-xl font-bold text-gray-800">Добавить товар</h2>
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
                Название товара <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Введите название товара"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Введите SKU"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена <span className="text-red-500">*</span>
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
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.product_name.trim()}
              className="flex-1 py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Добавление...' : 'Добавить'}
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
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Детали товара</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <div className="text-lg font-semibold text-gray-900">{product.product_name}</div>
            <div className="text-gray-500">SKU: {product.sku}</div>
            <div className="text-gray-500">Цена: {product.price} ₽</div>
          </div>
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

      // В будущем здесь можно добавить API для отправки отчета
      // Пока имитируем отправку
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Отчет отправлен для продукта:', product.product_name);
      
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
        p.sku.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Фильтрация по статусу
    if (activeFilter) {
      result = result.filter(product => {
        const totalStock = product.stock_by_location 
          ? product.stock_by_location.reduce((sum, loc) => sum + Number(loc.stock), 0)
          : 0;
          
        if (activeFilter === 'outOfStock') return totalStock === 0;
        if (activeFilter === 'lowStock') return totalStock > 0 && totalStock <= 10;
        if (activeFilter === 'inStock') return totalStock > 10;
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
  }, [products, searchQuery, activeFilter, sortConfig]);

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
        <Header stats={stats} error={error} />
        
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

export default InventoryManagementPage; 