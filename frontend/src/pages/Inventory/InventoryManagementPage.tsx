import React, { useState, useMemo, useEffect } from 'react';
import { Warehouse, Search, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types/warehouse';
import { fetchProducts, addProduct, deleteProduct } from '@/services/warehouseApi';

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
        <StatCard label={t('inventory.management.stats.inStock')} value={stats.inStock} />
        <StatCard label={t('inventory.management.stats.lowStock')} value={stats.lowStock} />
        <StatCard label={t('inventory.management.stats.outOfStock')} value={stats.outOfStock} />
      </div>
    </header>
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

const ProductList: React.FC<{
  products: Product[];
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddProductClick: () => void;
}> = ({ products, onSelectProduct, searchQuery, onSearchChange, onAddProductClick }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t('inventory.management.productList.title')}</h2>
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
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Название</th>
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
                  <p className="text-sm">Попробуйте изменить поисковый запрос.</p>
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Загрузка данных
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const apiProducts = await fetchProducts();
        setProducts(apiProducts);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Ошибка загрузки данных');
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

  // Фильтрация
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.product_name.toLowerCase().includes(lowerCaseQuery) ||
        p.sku.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return result;
  }, [products, searchQuery]);

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
          <ProductList 
            products={filteredProducts} 
            onSelectProduct={handleSelectProduct} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddProductClick={() => setIsAddModalOpen(true)}
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