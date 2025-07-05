import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { outOfStockService } from '@/services/outOfStockService';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { ICONS } from '@/helpers/icons';

interface ProductAvailability {
  id: string;
  product_name: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  last_restock_date: string;
  out_of_stock_hours: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'critical';
  shelf_location: string;
}

interface ShelfAvailabilityMenuProps {
  onProductSelect?: (product: ProductAvailability) => void;
  showFilters?: boolean;
}

export default function ShelfAvailabilityMenu({ 
  onProductSelect, 
  showFilters = true 
}: ShelfAvailabilityMenuProps) {
  const [products, setProducts] = useState<ProductAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'status'>('name');
  const [userId, setUserId] = useState<string | null>(null);

  // Получить user_id текущего пользователя
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id || null);
    })();
  }, []);

  // Симуляция данных для демонстрации
  const generateMockData = (): ProductAvailability[] => {
    const mockProducts = [
      { name: 'Хлеб белый', stock: 45, available: 35, reserved: 10, shelf: 'A1-01' },
      { name: 'Молоко 3.2%', stock: 120, available: 89, reserved: 31, shelf: 'B2-03' },
      { name: 'Масло сливочное', stock: 25, available: 15, reserved: 10, shelf: 'C1-05' },
      { name: 'Яйца куриные', stock: 80, available: 65, reserved: 15, shelf: 'D3-02' },
      { name: 'Сыр российский', stock: 12, available: 3, reserved: 9, shelf: 'E2-04' },
      { name: 'Колбаса докторская', stock: 0, available: 0, reserved: 0, shelf: 'F1-06' },
      { name: 'Макароны спагетти', stock: 200, available: 180, reserved: 20, shelf: 'G3-01' },
      { name: 'Рис круглозерный', stock: 8, available: 2, reserved: 6, shelf: 'H2-02' },
      { name: 'Сахар песок', stock: 150, available: 140, reserved: 10, shelf: 'I1-03' },
      { name: 'Чай черный', stock: 3, available: 1, reserved: 2, shelf: 'J3-05' },
    ];

    return mockProducts.map((product, index) => {
      const outOfStockHours = product.available === 0 ? Math.floor(Math.random() * 48) : 0;
      let status: ProductAvailability['status'] = 'available';
      
      if (product.available === 0) {
        status = 'out_of_stock';
      } else if (product.available < product.stock * 0.1) {
        status = 'critical';
      } else if (product.available < product.stock * 0.3) {
        status = 'low_stock';
      }

      return {
        id: `product-${index}`,
        product_name: product.name,
        total_stock: product.stock,
        available_stock: product.available,
        reserved_stock: product.reserved,
        last_restock_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        out_of_stock_hours: outOfStockHours,
        status,
        shelf_location: product.shelf,
      };
    });
  };

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // В реальном приложении здесь был бы API вызов
        // const response = await fetch('/api/inventory/shelf-availability');
        // const data = await response.json();
        
        // Пока используем моковые данные
        const mockData = generateMockData();
        setProducts(mockData);
      } catch (err) {
        setError('Ошибка загрузки данных о доступности товаров');
        console.error('Error loading shelf availability:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Фильтрация и сортировка
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.shelf_location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product_name.localeCompare(b.product_name);
        case 'stock':
          return b.available_stock - a.available_stock;
        case 'status':
          const statusOrder = { 'out_of_stock': 0, 'critical': 1, 'low_stock': 2, 'available': 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

  // Получить цвет статуса
  const getStatusColor = (status: ProductAvailability['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Получить текст статуса
  const getStatusText = (status: ProductAvailability['status']) => {
    switch (status) {
      case 'available':
        return 'В наличии';
      case 'low_stock':
        return 'Заканчивается';
      case 'critical':
        return 'Критически мало';
      case 'out_of_stock':
        return 'Отсутствует';
      default:
        return 'Неизвестно';
    }
  };

  // Получить иконку статуса
  const getStatusIcon = (status: ProductAvailability['status']) => {
    switch (status) {
      case 'available':
        return '✅';
      case 'low_stock':
        return '⚠️';
      case 'critical':
        return '🔶';
      case 'out_of_stock':
        return '❌';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Загрузка данных...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-400 mr-2">⚠️</span>
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Заголовок */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">📦</span>
          Доступность товаров на полке
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Актуальная информация о наличии товаров и их местоположении
        </p>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Поиск */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Поиск по названию или полке..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Фильтр по статусу */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все статусы</option>
              <option value="available">В наличии</option>
              <option value="low_stock">Заканчивается</option>
              <option value="critical">Критически мало</option>
              <option value="out_of_stock">Отсутствует</option>
            </select>

            {/* Сортировка */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">По названию</option>
              <option value="stock">По количеству</option>
              <option value="status">По статусу</option>
            </select>
          </div>

          {/* Статистика */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>В наличии: {products.filter(p => p.status === 'available').length}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              <span>Заканчивается: {products.filter(p => p.status === 'low_stock').length}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              <span>Критически мало: {products.filter(p => p.status === 'critical').length}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span>Отсутствует: {products.filter(p => p.status === 'out_of_stock').length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Список товаров */}
      <div className="max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <span className="text-4xl mb-2 block">🔍</span>
            <p>Товары не найдены</p>
            <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  onProductSelect ? 'cursor-pointer' : ''
                }`}
                onClick={() => onProductSelect?.(product)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getStatusIcon(product.status)}</span>
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.product_name}
                      </h3>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span className="mr-4">📍 {product.shelf_location}</span>
                      <span className="mr-4">
                        📦 {product.available_stock}/{product.total_stock}
                      </span>
                      {product.reserved_stock > 0 && (
                        <span className="mr-4">🔒 {product.reserved_stock} зарезервировано</span>
                      )}
                    </div>
                    {product.out_of_stock_hours > 0 && (
                      <div className="mt-1 text-xs text-red-600">
                        ⏱️ Отсутствует уже {product.out_of_stock_hours} часов
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(product.status)} text-xs`}
                    >
                      {getStatusText(product.status)}
                    </Badge>
                    {onProductSelect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductSelect(product);
                        }}
                      >
                        Выбрать
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Подвал */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Всего товаров: {filteredProducts.length}</span>
          <span>Последнее обновление: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
