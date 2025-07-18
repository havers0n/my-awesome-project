import React, { useState, useMemo, useEffect } from 'react';
import { Warehouse, Zap, Search, Plus, ChevronUp, ChevronDown, TestTube, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product, ProductStatus, HistoryEntry } from '@/types/warehouse';
import { fetchProducts, addProduct, deleteProduct } from '@/services/warehouseApi';

// Хелпер для расчета статуса продукта на основе количества
const calculateProductStatus = (quantity: number): ProductStatus => {
  if (quantity === 0) return ProductStatus.OutOfStock;
  if (quantity <= 10) return ProductStatus.LowStock;
  return ProductStatus.InStock;
};

// Хелпер для получения переводов статуса
const getStatusTranslation = (t: any, status: ProductStatus) => {
  switch (status) {
    case ProductStatus.InStock:
      return t('inventory.management.status.inStock');
    case ProductStatus.LowStock:
      return t('inventory.management.status.lowStock');
    case ProductStatus.OutOfStock:
      return t('inventory.management.status.outOfStock');
    default:
      return status;
  }
};

// Хелпер для получения переводов типа операции
const getHistoryTypeTranslation = (t: any, type: string) => {
  const typeMap: Record<string, string> = {
    'Поступление': t('inventory.management.history.arrival'),
    'Списание': t('inventory.management.history.writeOff'),
    'Коррекция': t('inventory.management.history.correction'),
    'Отчет о нехватке': t('inventory.management.history.shortageReport'),
  };
  return typeMap[type] || type;
};

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
        <StatCard label={getStatusTranslation(t, ProductStatus.InStock)} value={stats.inStock} color="text-green-500" />
        <StatCard label={getStatusTranslation(t, ProductStatus.LowStock)} value={stats.lowStock} color="text-yellow-500" />
        <StatCard label={getStatusTranslation(t, ProductStatus.OutOfStock)} value={stats.outOfStock} color="text-red-500" />
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
        <span className="text-sm text-gray-400">{t('inventory.management.donut.totalItems')}</span>
      </div>
    </div>
  );
};

const QuickActions: React.FC<{
  products: Product[];
  onFilterChange: (status: ProductStatus | null) => void;
  activeFilter: ProductStatus | null;
}> = ({ products, onFilterChange, activeFilter }) => {
  const { t } = useTranslation();
  const data = useMemo(() => {
    const counts = {
      [ProductStatus.InStock]: 0,
      [ProductStatus.LowStock]: 0,
      [ProductStatus.OutOfStock]: 0,
    };

    products.forEach(p => {
      counts[p.status]++;
    });

    return [
      { name: ProductStatus.InStock, value: counts[ProductStatus.InStock], color: '#22c55e' },
      { name: ProductStatus.LowStock, value: counts[ProductStatus.LowStock], color: '#d97706' },
      { name: ProductStatus.OutOfStock, value: counts[ProductStatus.OutOfStock], color: '#991b1b' },
    ].filter(item => item.value > 0);
  }, [products]);

  const totalProducts = useMemo(() => products.length, [products]);

  const handleFilter = (status: ProductStatus) => {
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
            onSliceClick={(payload) => handleFilter(payload.name as ProductStatus)} 
          />
        </div>
        
        <ul className="space-y-3 self-center">
          {data.map(item => {
            const status = item.name as ProductStatus;
            const isActive = activeFilter === status;
            return (
              <li
                key={item.name}
                onClick={() => handleFilter(status)}
                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className={`font-semibold text-gray-700 ${isActive ? 'font-bold' : ''}`}>
                    {item.value} {getStatusTranslation(t, item.name as ProductStatus)}
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
  onReportSubmit: (productId: string) => Promise<void>;
}> = ({ products, onReportSubmit }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0,5));

  useEffect(() => {
    if (selectedProductId && !products.find(p => p.id === selectedProductId)) {
      setSelectedProductId('');
    }
  }, [products, selectedProductId]);

  const handleSetNow = () => {
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0,5));
  };

  const resetForm = () => {
    setSelectedProductId('');
    handleSetNow();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setIsLoading(true);
    try {
      await onReportSubmit(selectedProductId);
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
          <select 
            id="productSelect"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            <option value="" disabled>{t('inventory.management.reportForm.chooseProduct')}</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
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

const ProductItem: React.FC<{
  product: Product;
  onSelect: (product: Product) => void;
}> = ({ product, onSelect }) => {
  const { t } = useTranslation();
  const getStatusClasses = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.InStock:
        return 'bg-green-100 text-green-800';
      case ProductStatus.LowStock:
        return 'bg-yellow-100 text-yellow-800';
      case ProductStatus.OutOfStock:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr onClick={() => onSelect(product)} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{product.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{product.shelf}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-sm font-bold text-gray-900">{product.quantity}</div>
      </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(product.status)}`}>
            {getStatusTranslation(t, product.status)}
          </span>
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
  const { t } = useTranslation();
  const isSorted = sortConfig?.key === sortKey;
  const direction = sortConfig?.direction;

  return (
    <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 group">
        {t(title)}
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
  filter: ProductStatus | null;
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
                  {t('inventory.management.productList.filteredBy', { status: getStatusTranslation(t, filter) })}
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
              <SortableHeader title="inventory.management.productList.name" sortKey="name" sortConfig={sortConfig} onSort={onSort} className="text-left" />
              <SortableHeader title="inventory.management.productList.shelf" sortKey="shelf" sortConfig={sortConfig} onSort={onSort} className="text-left" />
              <SortableHeader title="inventory.management.productList.quantity" sortKey="quantity" sortConfig={sortConfig} onSort={onSort} className="text-center" />
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.management.productList.status')}</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <ProductItem key={product.id} product={product} onSelect={onSelectProduct} />
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
  onSubmit: (productData: Omit<Product, 'id' | 'status' | 'history'>) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shelf: '',
    category: '',
    quantity: 0,
    price: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      shelf: '',
      category: '',
      quantity: 0,
      price: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

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
                {t('inventory.management.addProductModal.nameLabel')} {t('inventory.management.addProductModal.required')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('inventory.management.addProductModal.namePlaceholder')}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inventory.management.addProductModal.shelfLabel')}
              </label>
              <input
                type="text"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('inventory.management.addProductModal.shelfPlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inventory.management.addProductModal.categoryLabel')}
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('inventory.management.addProductModal.categoryPlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inventory.management.addProductModal.quantityLabel')} {t('inventory.management.addProductModal.required')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inventory.management.addProductModal.priceLabel')}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              disabled={isLoading || !formData.name.trim()}
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
  const { t } = useTranslation();

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{t('inventory.management.modal.productDetails')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.management.productList.name')}
                </label>
                <p className="text-lg font-semibold text-gray-900">{product.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.management.modal.category')}
                </label>
                <p className="text-gray-900">{product.category}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.management.productList.shelf')}
                </label>
                <p className="text-gray-900">{product.shelf}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.management.productList.quantity')}
                </label>
                <p className="text-2xl font-bold text-gray-900">{product.quantity}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.management.productList.status')}
                </label>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  product.status === ProductStatus.InStock ? 'bg-green-100 text-green-800' :
                  product.status === ProductStatus.LowStock ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusTranslation(t, product.status)}
                </span>
              </div>
              
              {product.price && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inventory.management.modal.price')}
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{product.price} ₽</p>
                </div>
              )}
            </div>
          </div>
          
          {product.history.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('inventory.management.modal.movementHistory')}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.management.modal.date')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.management.modal.type')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.management.modal.change')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.management.modal.newQuantity')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.history.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.date).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {getHistoryTypeTranslation(t, entry.type)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          <span className={`font-medium ${
                            entry.change > 0 ? 'text-green-600' : 
                            entry.change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {entry.change > 0 ? '+' : ''}{entry.change}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                          {entry.newQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {product.history.length === 0 && (
            <div className="mt-8 text-center py-8">
              <p className="text-gray-500">{t('inventory.management.modal.noHistory')}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            {t('inventory.management.modal.close')}
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
  const [activeFilter, setActiveFilter] = useState<ProductStatus | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<any>(null);

  // Загрузка данных
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        console.log('Загружаем продукты из API...');
        
        const apiProducts = await fetchProducts();
        console.log('Получено продуктов:', apiProducts.length);
        
        // Преобразуем данные из API к формату интерфейса
        const transformedProducts: Product[] = apiProducts.map((apiProduct: any) => ({
          id: String(apiProduct.id),
          name: apiProduct.name || '',
          shelf: apiProduct.sku || 'N/A', // Используем SKU как полку временно
          category: 'Общие', // Пока используем общую категорию
          quantity: parseInt(apiProduct.quantity || '0'),
          status: calculateProductStatus(parseInt(apiProduct.quantity || '0')),
          history: [], // История пока пустая
          price: parseFloat(apiProduct.price || '0')
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError(error instanceof Error ? error.message : 'Ошибка загрузки данных');
        
        // Показываем моковые данные в случае ошибки для демонстрации интерфейса
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Колбаса докторская',
            shelf: 'B1',
            category: 'Мясные изделия',
            quantity: 36,
            status: ProductStatus.InStock,
            history: [],
            price: 450
          },
          {
            id: '2',
            name: 'Сыр российский',
            shelf: 'B1',
            category: 'Молочные продукты',
            quantity: 7,
            status: ProductStatus.LowStock,
            history: [],
            price: 380
          },
          {
            id: '3',
            name: 'Молоко 3.2%',
            shelf: 'E2',
            category: 'Молочные продукты',
            quantity: 0,
            status: ProductStatus.OutOfStock,
            history: [],
            price: 65
          }
        ];
        setProducts(mockProducts);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Статистика
  const stats = useMemo(() => {
    return products.reduce((acc, product) => {
      acc.total++;
      if (product.status === ProductStatus.InStock) acc.inStock++;
      else if (product.status === ProductStatus.LowStock) acc.lowStock++;
      else if (product.status === ProductStatus.OutOfStock) acc.outOfStock++;
      return acc;
    }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  }, [products]);

  // Обработчики
  const handleReportSubmit = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Продукт не найден');
      }

      // В будущем здесь можно добавить API для отправки отчета
      // Пока имитируем отправку
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Отчет отправлен для продукта:', product.name);
      
      // Можно добавить обновление истории продукта
      const updatedProducts = products.map(p => 
        p.id === productId 
          ? {
              ...p,
              history: [
                ...p.history,
                {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  type: 'Отчет о нехватке' as const,
                  change: 0,
                  newQuantity: p.quantity
                }
              ]
            }
          : p
      );
      setProducts(updatedProducts);
      
    } catch (error) {
      console.error('Ошибка отправки отчета:', error);
      throw error;
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'status' | 'history'>) => {
    try {
      // Попытка добавить через API
      const newProduct = await addProduct(productData);
      
      // Если API недоступно, добавляем локально для демонстрации
      const localProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        status: calculateProductStatus(productData.quantity),
        history: []
      };
      
      setProducts(prev => [...prev, localProduct]);
      console.log('Продукт добавлен:', localProduct.name);
    } catch (error) {
      console.error('Ошибка добавления продукта:', error);
      
      // Добавляем локально в случае ошибки API
      const localProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        status: calculateProductStatus(productData.quantity),
        history: []
      };
      
      setProducts(prev => [...prev, localProduct]);
      console.log('Продукт добавлен локально (API недоступно):', localProduct.name);
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
    let result = [...products];

    if (activeFilter) {
      result = result.filter(p => p.status === activeFilter);
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerCaseQuery) ||
        p.shelf.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Product];
        const bValue = b[sortConfig.key as keyof Product];
        
        if (aValue === undefined || bValue === undefined) {
          return 0;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [products, activeFilter, searchQuery, sortConfig]);

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