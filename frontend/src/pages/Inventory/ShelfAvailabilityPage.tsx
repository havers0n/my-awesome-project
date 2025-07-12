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
import Button from '@/components/ui/button/Button';
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
      <PageMeta title="Доступность товаров на полке" />
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
            className="flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Справка</span>
          </Button>
          <FeedbackForm buttonName="Оставить отзыв" onSubmit={(msg) => console.log('FEEDBACK', msg)} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => alert('Настройки открыты')}
            className="flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
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
              variant="light" 
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-white/20 text-white hover:bg-white/30 flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Обновить</span>
            </Button>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => alert('Экспорт в разработке')}
              className="bg-white/20 text-white hover:bg-white/30 flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              <span>Экспорт</span>
            </Button>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => setShowHelpPanel(true)}
              className="bg-white/20 text-white hover:bg-white/30 flex items-center gap-1"
            >
              <HelpCircle className="w-4 h-4" />
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
                variant="text" 
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
                  variant="text" 
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
                  <span className="text-sm text-red-800">Сыр «Российский» отсутствует уже 2 дня</span>
                </div>
                <Button 
                  variant="text" 
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  Заказать
                </Button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-blue-500">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-amber-800">Требуется инвентаризация полки «Хлебобулочные изделия»</span>
                </div>
                <Button 
                  variant="text" 
                  size="sm"
                  className="text-amber-600 hover:text-amber-800"
                >
                  Запланировать
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Учет доступности товаров</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input 
                    type="date" 
                    className="pl-8 pr-2 py-1 border border-gray-300 rounded-lg text-sm"
                    defaultValue="2023-07-25"
                  />
                  <Calendar className="w-4 h-4 text-gray-500 absolute left-2 top-1/2 transform -translate-y-1/2" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Filter className="w-4 h-4" />
                  <span>Фильтры</span>
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Применить
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <ShelfAvailabilityMenu 
                onProductSelect={handleProductSelect}
                showFilters={true}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Планы и выполнение</h3>
              <Button 
                variant="text" 
                size="sm"
                className="text-indigo-600 hover:text-indigo-800"
              >
                Подробнее
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">Молоко «Домик в деревне»</div>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">В наличии</div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Запас: 45 из 50</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">Хлеб «Бородинский»</div>
                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Заканчивается</div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Запас: 12 из 40</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">Масло сливочное «Простоквашино»</div>
                  <div className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Критически мало</div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Запас: 2 из 25</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Button 
              variant="primary" 
              size="md"
              className="bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Обновить данные</span>
            </Button>
            <Button 
              variant="success" 
              size="md"
              className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Экспорт отчета</span>
            </Button>
            <Button 
              variant="warning" 
              size="md"
              className="bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Сообщить об ОС</span>
            </Button>
            <Button 
               variant="danger" 
               size="md"
               onClick={() => setShowHelpPanel(true)}
               className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
             >
               <HelpCircle className="w-4 h-4" />
               <span>Инструкция</span>
             </Button>
          </div>
        </div>
      </div>

      {/* Панель справки */}
      {showHelpPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowHelpPanel(false)}></div>
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col">
            {/* Заголовок панели */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 rounded-full p-2">
                  <Eye className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Справочная информация</h3>
                  <p className="text-sm text-gray-600">Статусы и возможности системы</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpPanel(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Содержимое панели */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {/* Статусы товаров */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-500" />
                    Статусы товаров
                  </h4>
                  <div className="space-y-3">
                    {[
                      { status: 'available', desc: 'В наличии', fullDesc: 'Товар есть в достаточном количестве' },
                      { status: 'low_stock', desc: 'Заканчивается', fullDesc: 'Остаток менее 30% от общего объема' },
                      { status: 'critical', desc: 'Критично', fullDesc: 'Остаток менее 10% от общего объема' },
                      { status: 'out_of_stock', desc: 'Отсутствует', fullDesc: 'Товара нет в наличии' }
                    ].map((item, index) => {
                      const config = getStatusConfig(item.status);
                      return (
                        <div 
                          key={index}
                          className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`${config.iconColor}`}>
                              {config.icon}
                            </div>
                            <div className={`font-semibold ${config.textColor}`}>
                              {item.desc}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 ml-7">{item.fullDesc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Возможности системы */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Возможности системы
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-amber-50 rounded-xl p-4">
                      <h5 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Поиск и фильтрация
                      </h5>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Поиск по названию товара</li>
                        <li>• Поиск по номеру полки (например, A1-01)</li>
                        <li>• Фильтрация по статусу доступности</li>
                        <li>• Быстрые фильтры по критичности</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4">
                      <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Аналитика и отчеты
                      </h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Местоположение на полке</li>
                        <li>• Доступное/общее количество</li>
                        <li>• Время отсутствия товара</li>
                        <li>• Статистика по категориям</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Быстрые действия
                      </h5>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Обновление данных в реальном времени</li>
                        <li>• Экспорт отчетов</li>
                        <li>• Сканирование QR-кодов</li>
                        <li>• Интеграция с внешними системами</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4">
                      <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Трекинг отсутствия
                      </h5>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Учет времени отсутствия товаров</li>
                        <li>• Автоматические уведомления</li>
                        <li>• История изменений статуса</li>
                        <li>• Планирование пополнений</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Горячие клавиши */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Горячие клавиши
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Поиск</span>
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + F</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Обновить</span>
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">F5</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Справка</span>
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">F1</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Экспорт</span>
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + E</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Нижняя часть с кнопками */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => alert('Техническая поддержка')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Поддержка</span>
                </button>
                <button
                  onClick={() => setShowHelpPanel(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">Закрыть</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
