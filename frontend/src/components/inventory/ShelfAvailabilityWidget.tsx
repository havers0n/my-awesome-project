/**
 * @deprecated This component will be deprecated. Use /modules/inventory/components instead.
 * Legacy component maintained for backward compatibility only.
 */
/**
 * @deprecated
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

interface ProductSummary {
  name: string;
  available: number;
  total: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'critical';
}

interface InventorySummary {
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  criticalCount: number;
  availableCount: number;
  urgentItems: ProductSummary[];
}

const ShelfAvailabilityWidget: React.FC = () => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Генерация моковых данных для демонстрации
  const generateSummaryData = (): InventorySummary => {
    const urgentItems: ProductSummary[] = [
      { name: 'Колбаса докторская', available: 0, total: 0, status: 'out_of_stock' },
      { name: 'Рис круглозерный', available: 2, total: 8, status: 'critical' },
      { name: 'Чай черный', available: 1, total: 3, status: 'critical' },
      { name: 'Сыр российский', available: 3, total: 12, status: 'low_stock' },
      { name: 'Масло сливочное', available: 15, total: 25, status: 'low_stock' },
    ];

    return {
      totalProducts: 10,
      outOfStockCount: 1,
      lowStockCount: 2,
      criticalCount: 2,
      availableCount: 5,
      urgentItems: urgentItems.slice(0, 3), // Показываем только топ-3 срочных
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 500));
      setSummary(generateSummaryData());
      setLoading(false);
    };

    loadData();
  }, []);

  const getStatusColor = (status: ProductSummary['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-orange-100 text-orange-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ProductSummary['status']) => {
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <span className="text-2xl block mb-2">⚠️</span>
          <p className="text-sm">Не удалось загрузить данные</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Заголовок */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <span className="mr-2">📦</span>
            Склад
          </h3>
          <Link 
            to="/shelf-availability"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Подробнее →
          </Link>
        </div>
      </div>

      {/* Статистика */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Всего товаров:</span>
            <span className="font-medium">{summary.totalProducts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">В наличии:</span>
            <span className="font-medium text-green-600">{summary.availableCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Заканчивается:</span>
            <span className="font-medium text-yellow-600">{summary.lowStockCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Отсутствует:</span>
            <span className="font-medium text-red-600">{summary.outOfStockCount}</span>
          </div>
        </div>

        {/* Индикатор состояния */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="flex h-2 rounded-full overflow-hidden">
            {summary.availableCount > 0 && (
              <div 
                className="bg-green-500" 
                style={{ width: `${(summary.availableCount / summary.totalProducts) * 100}%` }}
              ></div>
            )}
            {summary.lowStockCount > 0 && (
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(summary.lowStockCount / summary.totalProducts) * 100}%` }}
              ></div>
            )}
            {summary.criticalCount > 0 && (
              <div 
                className="bg-orange-500" 
                style={{ width: `${(summary.criticalCount / summary.totalProducts) * 100}%` }}
              ></div>
            )}
            {summary.outOfStockCount > 0 && (
              <div 
                className="bg-red-500" 
                style={{ width: `${(summary.outOfStockCount / summary.totalProducts) * 100}%` }}
              ></div>
            )}
          </div>
        </div>

        {/* Срочные товары */}
        {summary.urgentItems.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">
              Требует внимания:
            </h4>
            <div className="space-y-2">
              {summary.urgentItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="mr-1">{getStatusIcon(item.status)}</span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-gray-500">
                      {item.available}/{item.total}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(item.status)} text-xs px-1 py-0`}
                    >
                      {item.status === 'out_of_stock' ? '0%' : 
                       `${Math.round((item.available / item.total) * 100)}%`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Быстрые действия */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => window.location.reload()}
            >
              🔄 Обновить
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => alert('Переход к отчетам')}
            >
              📊 Отчет
            </Button>
          </div>
        </div>
      </div>

      {/* Время обновления */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Обновлено: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ShelfAvailabilityWidget;
