
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, XCircle, Bell, Package, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InventoryAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  productName: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
}

interface AlertsSummary {
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  unreadAlerts: number;
  recentAlerts: InventoryAlert[];
}

const InventoryAlertsWidget: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Генерация моковых данных для демонстрации
  const generateAlertsData = (translate: (key: string) => string): AlertsSummary => {
    const recentAlerts: InventoryAlert[] = [
      {
        id: '1',
        type: 'critical',
        title: translate('inventoryAlerts.criticalShortageTitle'),
        message: translate('inventoryAlerts.criticalShortageMessage'),
        productName: translate('inventoryAlerts.criticalShortageProduct'),
        severity: 'high',
        timestamp: '2024-01-20T14:30:00Z',
        isRead: false,
        actionRequired: true
      },
      {
        id: '2',
        type: 'warning',
        title: translate('inventoryAlerts.lowStockTitle'),
        message: translate('inventoryAlerts.lowStockMessage'),
        productName: translate('inventoryAlerts.lowStockProduct'),
        severity: 'medium',
        timestamp: '2024-01-20T13:15:00Z',
        isRead: false,
        actionRequired: true
      },
      {
        id: '3',
        type: 'critical',
        title: translate('inventoryAlerts.expiredProductTitle'),
        message: translate('inventoryAlerts.expiredProductMessage'),
        productName: translate('inventoryAlerts.expiredProduct'),
        severity: 'high',
        timestamp: '2024-01-20T12:00:00Z',
        isRead: true,
        actionRequired: true
      },
      {
        id: '4',
        type: 'warning',
        title: translate('inventoryAlerts.slowSalesTitle'),
        message: translate('inventoryAlerts.slowSalesMessage'),
        productName: translate('inventoryAlerts.slowSalesProduct'),
        severity: 'low',
        timestamp: '2024-01-20T10:45:00Z',
        isRead: false,
        actionRequired: false
      },
      {
        id: '5',
        type: 'info',
        title: translate('inventoryAlerts.plannedReplenishmentTitle'),
        message: translate('inventoryAlerts.plannedReplenishmentMessage'),
        productName: translate('inventoryAlerts.plannedReplenishmentProduct'),
        severity: 'low',
        timestamp: '2024-01-20T09:30:00Z',
        isRead: true,
        actionRequired: false
      }
    ];

    return {
      totalAlerts: 15,
      criticalAlerts: 5,
      warningAlerts: 7,
      unreadAlerts: 8,
      recentAlerts: recentAlerts,
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setAlerts(generateAlertsData(t));
      setLoading(false);
    };

    loadData();
  }, [t]);

  const getAlertIcon = (type: InventoryAlert['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Package className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertColor = (type: InventoryAlert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) {
      return `${diffMins} ${t('inventoryAlerts.minutesAgo')}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t('inventoryAlerts.hoursAgo')}`;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!alerts) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{t('inventoryAlerts.failedToLoad')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-amber-600" />
          {t('inventoryAlerts.criticalNotificationsTitle')}
        </h3>
        <div className="flex items-center space-x-2">
          {alerts.unreadAlerts > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {alerts.unreadAlerts}
            </span>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600">{t('inventoryAlerts.critical')}</p>
              <p className="text-lg font-bold text-red-700">{alerts.criticalAlerts}</p>
            </div>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600">{t('inventoryAlerts.warnings')}</p>
              <p className="text-lg font-bold text-yellow-700">{alerts.warningAlerts}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600">{t('inventoryAlerts.total')}</p>
              <p className="text-lg font-bold text-blue-700">{alerts.totalAlerts}</p>
            </div>
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">{t('inventoryAlerts.unread')}</p>
              <p className="text-lg font-bold text-gray-700">{alerts.unreadAlerts}</p>
            </div>
            <TrendingDown className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Последние уведомления */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {t('inventoryAlerts.recentNotifications')}
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {alerts.recentAlerts.slice(0, 4).map((alert) => (
            <div 
              key={alert.id} 
              className={`p-2 rounded-lg border-l-4 ${getAlertColor(alert.type)} ${
                !alert.isRead ? 'shadow-sm' : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1 min-w-0">
                  <div className="mr-2 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 truncate">{alert.title}</p>
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <div className="flex items-center mt-1">
                      <Package className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                      <p className="text-xs text-gray-500 truncate">{alert.productName}</p>
                    </div>
                    <div className="mt-1.5 flex items-center">
                      {!alert.isRead && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
                          {t('inventoryAlerts.new')}
                        </span>
                      )}
                      {alert.actionRequired && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          {t('inventoryAlerts.actionRequired')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryAlertsWidget; 