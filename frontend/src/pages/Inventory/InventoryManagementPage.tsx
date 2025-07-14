import React, { useState, useMemo, useEffect } from 'react';
import { Warehouse, Zap, Search, Plus, ChevronUp, ChevronDown, TestTube } from 'lucide-react';

// Типы данных (соответствуют system)
export enum ProductStatus {
  InStock = 'В наличии',
  LowStock = 'Мало',
  OutOfStock = 'Нет в наличии',
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: 'Поступление' | 'Списание' | 'Коррекция' | 'Отчет о нехватке';
  change: number;
  newQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  shelf: string;
  category: string;
  quantity: number;
  status: ProductStatus;
  history: HistoryEntry[];
  price?: number;
}

// Компоненты
const StatCard: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color = "text-gray-800" }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const Header: React.FC<{ stats: { total: number; inStock: number; lowStock: number; outOfStock: number } }> = ({ stats }) => (
  <header className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
      <div className="bg-amber-600 p-3 rounded-xl text-white">
        <Warehouse className="w-8 h-8"/>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Система управления складом</h1>
        <p className="text-gray-400">Полный контроль над товарными запасами в режиме реального времени</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Всего SKU" value={stats.total} />
      <StatCard label={ProductStatus.InStock} value={stats.inStock} color="text-green-500" />
      <StatCard label={ProductStatus.LowStock} value={stats.lowStock} color="text-yellow-500" />
      <StatCard label={ProductStatus.OutOfStock} value={stats.outOfStock} color="text-red-500" />
    </div>
  </header>
);

const DonutChart: React.FC<{ 
  data: { name: string; value: number; color: string }[];
  total: number;
  onSliceClick?: (payload: any) => void;
}> = ({ data, total, onSliceClick }) => {
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
        <span className="text-sm text-gray-400">товаров</span>
      </div>
    </div>
  );
};

const QuickActions: React.FC<{
  products: Product[];
  onFilterChange: (status: ProductStatus | null) => void;
  activeFilter: ProductStatus | null;
}> = ({ products, onFilterChange, activeFilter }) => {
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
        <h2 className="text-xl font-bold text-gray-800">Обзор склада</h2>
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
                  {item.value} {item.name}
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
      alert('Отчёт успешно отправлен!');
      resetForm();
    } catch (error) {
      alert('Ошибка при отправке отчёта.');
      console.error("Failed to submit report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Отчёт о недостатке товара</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productSelect">Выберите товар</label>
          <select 
            id="productSelect"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            <option value="" disabled>-- Выберите товар --</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата и время обнаружения</label>
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
          {isLoading ? 'Отправка...' : 'Отправить отчёт'}
        </button>
      </form>
    </div>
  );
};

const ProductItem: React.FC<{
  product: Product;
  onSelect: (product: Product) => void;
}> = ({ product, onSelect }) => {
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
          {product.status}
        </span>
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
  filter: ProductStatus | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddProductClick: () => void;
  sortConfig: any;
  onSort: (key: string) => void;
}> = ({ products, onSelectProduct, filter, searchQuery, onSearchChange, onAddProductClick, sortConfig, onSort }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Состояние склада</h2>
            {filter && (
              <p className="mt-1 text-sm text-amber-700 font-semibold">
                Показаны товары со статусом: &quot;{filter}&quot;
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
                placeholder="Поиск по названию или полке..."
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
              <SortableHeader title="Название" sortKey="name" sortConfig={sortConfig} onSort={onSort} className="text-left" />
              <SortableHeader title="Полка" sortKey="shelf" sortConfig={sortConfig} onSort={onSort} className="text-left" />
              <SortableHeader title="Кол-во" sortKey="quantity" sortConfig={sortConfig} onSort={onSort} className="text-center" />
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
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
                  <h4 className="font-semibold text-lg text-gray-600">Товары не найдены</h4>
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

// Главный компонент
const InventoryManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ProductStatus | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<any>(null);

  // Загрузка данных
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Имитация загрузки данных
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
          },
          {
            id: '4',
            name: 'Хлеб белый',
            shelf: 'A1',
            category: 'Хлебобулочные изделия',
            quantity: 33,
            status: ProductStatus.InStock,
            history: [],
            price: 45
          },
          {
            id: '5',
            name: 'Масло сливочное',
            shelf: 'D1',
            category: 'Молочные продукты',
            quantity: 14,
            status: ProductStatus.InStock,
            history: [],
            price: 280
          },
          {
            id: '6',
            name: 'Яйца куриные (десяток)',
            shelf: 'C2',
            category: 'Яйца',
            quantity: 25,
            status: ProductStatus.InStock,
            history: [],
            price: 90
          },
          {
            id: '7',
            name: 'Рис круглозерный 1кг',
            shelf: 'A1',
            category: 'Крупы',
            quantity: 8,
            status: ProductStatus.LowStock,
            history: [],
            price: 85
          }
        ];
        
        setProducts(mockProducts);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
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
    // Имитация отправки отчета
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Отчет отправлен для продукта:', productId);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
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
        <Header stats={stats} />
        
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