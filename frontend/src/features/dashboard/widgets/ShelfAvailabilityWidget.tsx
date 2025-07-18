import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';

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
  const { t } = useTranslation();
  console.log('ShelfAvailabilityWidget rendered');
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Генерация моковых данных для демонстрации
  const generateSummaryData = (translate: (key: string) => string): InventorySummary => {
    const urgentItems: ProductSummary[] = [
      { name: translate('widget.shelfAvailability.urgentItems.item1'), available: 0, total: 0, status: 'out_of_stock' },
      { name: translate('widget.shelfAvailability.urgentItems.item2'), available: 2, total: 8, status: 'critical' },
      { name: translate('widget.shelfAvailability.urgentItems.item3'), available: 1, total: 3, status: 'critical' },
      { name: translate('widget.shelfAvailability.urgentItems.item4'), available: 3, total: 12, status: 'low_stock' },
    ];

    return {
      totalProducts: 156,
      outOfStockCount: 8,
      lowStockCount: 12,
      criticalCount: 5,
      availableCount: 131,
      urgentItems: urgentItems.slice(0, 3),
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setSummary(generateSummaryData(t));
      setLoading(false);
    };

    loadData();
  }, [t]);

  const getStatusIcon = (status: ProductSummary['status']) => {
    switch (status) {
      case 'available':
        return <Package className="w-4 h-4 text-green-600" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'out_of_stock':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{t('widget.shelfAvailability.loadError')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="w-5 h-5 mr-2 text-amber-600" />
          {t('widget.shelfAvailability.title')}
        </h3>
        <span className="text-xs text-gray-500">{t('widget.shelfAvailability.updatedNow')}</span>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600">{t('widget.shelfAvailability.status.available')}</p>
              <p className="text-lg font-bold text-green-700">{summary.availableCount}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600">{t('widget.shelfAvailability.status.outOfStock')}</p>
              <p className="text-lg font-bold text-red-700">{summary.outOfStockCount}</p>
            </div>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600">{t('widget.shelfAvailability.status.lowStock')}</p>
              <p className="text-lg font-bold text-yellow-700">{summary.lowStockCount}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600">{t('widget.shelfAvailability.status.critical')}</p>
              <p className="text-lg font-bold text-orange-700">{summary.criticalCount}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Срочные товары */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {t('widget.shelfAvailability.attentionRequired')}
        </h4>
        <div className="space-y-2">
          {summary.urgentItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center flex-1 min-w-0">
                {getStatusIcon(item.status)}
                <span className="ml-2 text-sm truncate">{item.name}</span>
              </div>
              <span className="text-xs text-gray-500 ml-2">
                {item.available}/{item.total}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShelfAvailabilityWidget; 