import React, { useState } from 'react';
import ShelfAvailabilityMenu from '@/components/inventory/ShelfAvailabilityMenu';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { useModal } from '@/hooks/useModal';

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

  return (
    <>
      <PageMeta title="Доступность товаров на полке" />
      <div className="mb-6">
        <PageBreadcrumb pageTitle="Доступность товаров" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Основное меню доступности */}
        <ComponentCard title="" className="">
          <ShelfAvailabilityMenu 
            onProductSelect={handleProductSelect}
            showFilters={true}
          />
        </ComponentCard>

        {/* Краткие инструкции */}
        <ComponentCard title="Инструкция по использованию" className="">
          <div className="space-y-4 text-sm text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Статусы товаров:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span><strong>В наличии</strong> - товар есть в достаточном количестве</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">⚠️</span>
                    <span><strong>Заканчивается</strong> - остаток менее 30% от общего объема</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">🔶</span>
                    <span><strong>Критически мало</strong> - остаток менее 10% от общего объема</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-500 mr-2">❌</span>
                    <span><strong>Отсутствует</strong> - товара нет в наличии</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Возможности поиска:</h4>
                <ul className="space-y-2">
                  <li>• Поиск по названию товара</li>
                  <li>• Поиск по номеру полки (например, A1-01)</li>
                  <li>• Фильтрация по статусу доступности</li>
                  <li>• Сортировка по различным параметрам</li>
                </ul>
                
                <h4 className="font-medium text-gray-900 mb-2 mt-4">Дополнительная информация:</h4>
                <ul className="space-y-2">
                  <li>• 📍 Местоположение на полке</li>
                  <li>• 📦 Доступное/общее количество</li>
                  <li>• 🔒 Зарезервированные товары</li>
                  <li>• ⏱️ Время отсутствия товара</li>
                </ul>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Быстрые действия */}
        <ComponentCard title="Быстрые действия" className="">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              size="md"
              onClick={() => window.location.reload()}
              className="flex items-center justify-center"
            >
              <span className="mr-2">🔄</span>
              Обновить данные
            </Button>
            <Button 
              variant="outline" 
              size="md"
              onClick={() => alert('Экспорт в разработке')}
              className="flex items-center justify-center"
            >
              <span className="mr-2">📥</span>
              Экспорт отчета
            </Button>
            <Button 
              variant="outline" 
              size="md"
              onClick={() => alert('Настройки в разработке')}
              className="flex items-center justify-center"
            >
              <span className="mr-2">⚙️</span>
              Настройки
            </Button>
          </div>
        </ComponentCard>
      </div>

      {/* Модальное окно с детальной информацией о товаре */}
      {isOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {selectedProduct.product_name}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Статус:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          selectedProduct.status === 'available' ? 'bg-green-100 text-green-800' :
                          selectedProduct.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                          selectedProduct.status === 'critical' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedProduct.status === 'available' ? 'В наличии' :
                           selectedProduct.status === 'low_stock' ? 'Заканчивается' :
                           selectedProduct.status === 'critical' ? 'Критически мало' :
                           'Отсутствует'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Местоположение:</span>
                        <span className="font-medium">{selectedProduct.shelf_location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Доступно:</span>
                        <span className="font-medium">{selectedProduct.available_stock} шт.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Общий запас:</span>
                        <span className="font-medium">{selectedProduct.total_stock} шт.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Зарезервировано:</span>
                        <span className="font-medium">{selectedProduct.reserved_stock} шт.</span>
                      </div>
                      {selectedProduct.out_of_stock_hours > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Отсутствует:</span>
                          <span className="font-medium text-red-600">{selectedProduct.out_of_stock_hours} часов</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Последнее пополнение:</span>
                        <span className="font-medium">{new Date(selectedProduct.last_restock_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleQuickAction('restock', selectedProduct)}
                  className="w-full sm:w-auto"
                >
                  Заказать пополнение
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('location', selectedProduct)}
                  className="w-full sm:w-auto"
                >
                  Перейти к полке
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
                  className="w-full sm:w-auto"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShelfAvailabilityPage;
