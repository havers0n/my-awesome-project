/**
 * @deprecated This page will be deprecated. Use /modules/inventory/pages instead.
 * Legacy page maintained for backward compatibility only.
 * @deprecated
 */
import React, { useState } from 'react';
import ShelfAvailabilityMenu from '@/components/inventory/ShelfAvailabilityMenu';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Button } from '@/components/atoms/Button';
import FeedbackForm from '@/components/common/FeedbackForm';
import { useModal } from '@/hooks/useModal';
import { Eye, XCircle, Search, TrendingUp, BarChart3, Zap, Clock, Target, MessageSquare, Calendar, Filter, Download, Settings, HelpCircle, RefreshCw } from 'lucide-react';

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

const ShelfAvailabilityPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductAvailability | null>(null);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const handleProductSelect = (product: ProductAvailability) => {
    setSelectedProduct(product);
    openModal();
  };

  const handleQuickAction = (action: string, product: ProductAvailability) => {
    console.log(`Action: ${action} for product:`, product);
    // Здесь можно добавить логику для различных действий
    switch (action) {
      case 'restock':
        alert(`Заказать пополнение для ${product.product_name}`);
        break;
      case 'reserve':
        alert(`Зарезервировать ${product.product_name}`);
        break;
      case 'location':
        alert(`Перейти к полке ${product.shelf_location}`);
        break;
      default:
        break;
    }
    closeModal();
  };

  // Функция для получения конфигурации статуса товара
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          icon: <Eye className="w-4 h-4" />
        };
      case 'low_stock':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          icon: <Eye className="w-4 h-4" />
        };
      case 'critical':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-500',
          icon: <Eye className="w-4 h-4" />
        };
      case 'out_of_stock':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          icon: <Eye className="w-4 h-4" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-500',
          icon: <Eye className="w-4 h-4" />
        };
    }
  };

  return (
    <>
      <PageMeta title="Доступность товаров на полке" description="Страница доступности товаров на полке" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 rounded-lg p-2">
            <Eye className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Доступность товаров</h1>
            <p className="text-sm text-gray-500">Управление доступностью товаров на полках</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHelpPanel(true)}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            <span>Справка</span>
          </Button>
          <FeedbackForm buttonName="Оставить отзыв" onSubmit={(msg) => console.log('FEEDBACK', msg)} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => alert('Настройки открыты')}
          >
            <Settings className="w-4 h-4 mr-1" />
            <span>Настройки</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-indigo-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-2">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <h2 className="font-medium">Доступность товаров</h2>
              <p className="text-xs text-indigo-100">Актуальная информация о наличии товаров на полках</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              <span>Обновить</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => alert('Экспорт в разработке')}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Download className="w-4 h-4 mr-1" />
              <span>Экспорт</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHelpPanel(true)}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              <span>Помощь</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 bg-indigo-50">
          <div className="bg-white rounded-lg p-4 flex items-center justify-center gap-3 shadow-sm">
            <div className="bg-amber-100 rounded-full p-2">
              <Eye className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">42</div>
              <div className="text-xs text-gray-500">Всего товаров</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 flex items-center justify-center gap-3 shadow-sm">
            <div className="bg-green-100 rounded-full p-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">28</div>
              <div className="text-xs text-gray-500">В наличии</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 flex items-center justify-center gap-3 shadow-sm">
            <div className="bg-yellow-100 rounded-full p-2">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">10</div>
              <div className="text-xs text-gray-500">Заканчиваются</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 flex items-center justify-center gap-3 shadow-sm">
            <div className="bg-red-100 rounded-full p-2">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">4</div>
              <div className="text-xs text-gray-500">Отсутствуют</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Предупреждения</h3>
              <Button 
                variant="link" 
                size="sm"
                className="text-indigo-600 hover:text-indigo-800"
              >
                Показать все
              </Button>
            </div>
            <div className="space-y-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-yellow-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-yellow-800">Запасы в категории «молочные продукты» заканчиваются</span>
                </div>
                <Button 
                  variant="link" 
                  size="sm"
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  Подробнее
                </Button>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-red-500">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-red-800">Критически низкий остаток по «Хлеб»</span>
                </div>
                <Button 
                  variant="link" 
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  Подробнее
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 rounded-full p-2">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Категория «Напитки»</div>
                <div className="text-sm text-gray-500">Целевой показатель доступности: 95%</div>
              </div>
            </div>
            <Button 
              variant="link" 
              size="sm"
              className="text-amber-600 hover:text-amber-800"
            >
              Детали
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ShelfAvailabilityMenu onProductSelect={handleProductSelect} />
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4">
            <div className={`p-4 rounded-t-xl bg-gray-50 border-b ${getStatusConfig(selectedProduct.status).borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusConfig(selectedProduct.status).bgColor}`}>
                    {getStatusConfig(selectedProduct.status).icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{selectedProduct.product_name}</h3>
                    <p className={`text-sm font-medium ${getStatusConfig(selectedProduct.status).textColor}`}>
                      {selectedProduct.status.replace(/_/g, ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><span className="text-gray-500">Общий запас:</span> <span className="font-medium text-gray-800">{selectedProduct.total_stock}</span></div>
                <div><span className="text-gray-500">Доступно:</span> <span className="font-medium text-gray-800">{selectedProduct.available_stock}</span></div>
                <div><span className="text-gray-500">Зарезервировано:</span> <span className="font-medium text-gray-800">{selectedProduct.reserved_stock}</span></div>
                <div><span className="text-gray-500">Полка:</span> <span className="font-medium text-gray-800">{selectedProduct.shelf_location}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Последнее пополнение:</span> <span className="font-medium text-gray-800">{selectedProduct.last_restock_date}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Время отсутствия:</span> <span className="font-medium text-gray-800">{selectedProduct.out_of_stock_hours} часов</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="primary"
                  size="default" 
                  onClick={() => handleQuickAction('restock', selectedProduct)}
                >
                  Заказать пополнение
                </Button>
                <Button 
                  variant="secondary" 
                  size="default"
                  onClick={() => handleQuickAction('reserve', selectedProduct)}
                >
                  Зарезервировать
                </Button>
                <Button 
                  variant="outline" 
                  size="default"
                  onClick={() => handleQuickAction('location', selectedProduct)}
                >
                  Перейти к полке
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={closeModal}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          size="lg" 
          className="rounded-full shadow-lg"
          onClick={() => alert('Начать сканирование')}
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Начать сканирование
        </Button>
      </div>

      {showHelpPanel && (
        <div className="fixed top-0 right-0 bottom-0 w-96 bg-white shadow-xl z-50 p-6 transform transition-transform duration-300 ease-in-out" style={{ transform: showHelpPanel ? 'translateX(0)' : 'translateX(100%)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Справочный центр</h3>
            <button onClick={() => setShowHelpPanel(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="text-sm">
            <p>Здесь будет подробная информация о работе с интерфейсом, описание метрик и другая полезная информация.</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowHelpPanel(false)}
            >
              Закрыть
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShelfAvailabilityPage;
