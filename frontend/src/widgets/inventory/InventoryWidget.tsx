import React from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { AlertTriangle, Package, CheckCircle, Clock } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
}

interface InventoryWidgetProps {
  title?: string;
  items?: InventoryItem[];
  showAlerts?: boolean;
  onRefresh?: () => void;
}

const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Товар А',
    quantity: 150,
    minQuantity: 50,
    status: 'in-stock',
    lastUpdated: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    name: 'Товар Б',
    quantity: 25,
    minQuantity: 50,
    status: 'low-stock',
    lastUpdated: '2024-01-10T09:30:00Z'
  },
  {
    id: '3',
    name: 'Товар В',
    quantity: 0,
    minQuantity: 20,
    status: 'out-of-stock',
    lastUpdated: '2024-01-10T08:45:00Z'
  }
];

export const InventoryWidget: React.FC<InventoryWidgetProps> = ({
  title = 'Управление складом',
  items = mockInventoryItems,
  showAlerts = true,
  onRefresh
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'low-stock':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'out-of-stock':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge variant="success">В наличии</Badge>;
      case 'low-stock':
        return <Badge variant="warning">Мало</Badge>;
      case 'out-of-stock':
        return <Badge variant="destructive">Нет в наличии</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  const alertItems = items.filter(item => item.status !== 'in-stock');

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Обновить
          </Button>
        )}
      </div>

      {showAlerts && alertItems.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Требуется внимание: {alertItems.length} товаров
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status)}
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">
                  Количество: {item.quantity} / Минимум: {item.minQuantity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(item.status)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Последнее обновление: {new Date().toLocaleString()}
      </div>
    </Card>
  );
};

export default InventoryWidget;
