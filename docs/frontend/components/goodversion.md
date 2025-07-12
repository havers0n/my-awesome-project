import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  Download, 
  Settings, 
  Package, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Search,
  Filter,
  Eye,
  ArrowRight,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Timer,
  Bell,
  PieChart,
  Activity,
  Target,
  Zap,
  FileText,
  Camera,
  Scan,
  Users,
  MapPin as Map,
  TrendingDown,
  Star,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ShelfAvailabilityPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Состояние для трекера отсутствия товаров
  const [outOfStockData, setOutOfStockData] = useState({
    date: new Date().toISOString().slice(0, 10),
    product: '',
    hours: '',
    minutes: ''
  });
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const minutesRef = useRef(null);
  
  // Новые состояния для дополнительных функций
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Молоко "Домик в деревне" заканчивается', time: '10 мин назад' },
    { id: 2, type: 'error', message: 'Сок яблочный отсутствует 2 дня', time: '1 час назад' },
    { id: 3, type: 'info', message: 'Пополнение хлеба запланировано на завтра', time: '2 часа назад' }
  ]);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    openModal();
  };

  const handleQuickAction = (action, product) => {
    console.log(`Action: ${action} for product:`, product);
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

  // Функции для трекера отсутствия товаров
  const handleMinutesChange = (val) => {
    let v = val.replace(/[^0-9]/g, "");
    if (v.length > 2) v = v.slice(0, 2);
    if (v && Number(v) > 59) v = "59";
    setOutOfStockData(prev => ({ ...prev, minutes: v }));
  };

  const handleHoursChange = (val) => {
    let v = val.replace(/[^0-9]/g, "");
    if (v.length > 2) v = v.slice(0, 2);
    setOutOfStockData(prev => ({ ...prev, hours: v }));
    if (v.length === 2 && minutesRef.current) {
      minutesRef.current.focus();
    }
  };

  const handleAddOutOfStock = async (e) => {
    e.preventDefault();
    setError(null);
    
    const h = Number(outOfStockData.hours);
    const m = outOfStockData.minutes === "" ? 0 : Number(outOfStockData.minutes);
    
    if (!outOfStockData.product.trim() || isNaN(h) || isNaN(m) || h < 0 || m < 0 || m > 59) {
      setError("Введите корректные часы (целое число) и минуты (0-59)");
      return;
    }
    
    setLoading(true);
    try {
      // Симуляция добавления записи
      const newItem = {
        id: Date.now().toString(),
        date: outOfStockData.date,
        product_name: outOfStockData.product.trim(),
        hours: h,
        minutes: m,
      };
      
      setOutOfStockItems(prev => [...prev, newItem]);
      setSuccess("Товар добавлен!");
      setOutOfStockData({
        date: outOfStockData.date,
        product: '',
        hours: '',
        minutes: ''
      });
      
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError(e.message || "Ошибка добавления");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutOfStock = async (id) => {
    setLoading(true);
    setError(null);
    try {
      setOutOfStockItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      setError(e.message || "Ошибка удаления");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'В наличии',
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500'
        };
      case 'low_stock':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Заканчивается',
          bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500'
        };
      case 'critical':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Критически мало',
          bgColor: 'bg-gradient-to-r from-orange-50 to-red-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-500'
        };
      default:
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Отсутствует',
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500'
        };
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Мокап данных для демонстрации
  const mockProducts = [
    {
      id: '1',
      product_name: 'Молоко "Домик в деревне" 3.2%',
      total_stock: 100,
      available_stock: 85,
      reserved_stock: 15,
      last_restock_date: '2024-01-15',
      out_of_stock_hours: 0,
      status: 'available',
      shelf_location: 'A1-03'
    },
    {
      id: '2',
      product_name: 'Хлеб "Дарницкий"',
      total_stock: 50,
      available_stock: 12,
      reserved_stock: 5,
      last_restock_date: '2024-01-14',
      out_of_stock_hours: 0,
      status: 'low_stock',
      shelf_location: 'B2-01'
    },
    {
      id: '3',
      product_name: 'Масло сливочное "Простоквашино"',
      total_stock: 30,
      available_stock: 2,
      reserved_stock: 1,
      last_restock_date: '2024-01-10',
      out_of_stock_hours: 0,
      status: 'critical',
      shelf_location: 'C3-05'
    },
    {
      id: '4',
      product_name: 'Сок яблочный "Сады Придонья"',
      total_stock: 80,
      available_stock: 0,
      reserved_stock: 0,
      last_restock_date: '2024-01-05',
      out_of_stock_hours: 48,
      status: 'out_of_stock',
      shelf_location: 'D1-02'
    }
  ];

  // Функции для новых возможностей
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.shelf_location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getAnalyticsData = () => {
    const totalProducts = mockProducts.length;
    const availableProducts = mockProducts.filter(p => p.status === 'available').length;
    const lowStockProducts = mockProducts.filter(p => p.status === 'low_stock').length;
    const outOfStockProducts = mockProducts.filter(p => p.status === 'out_of_stock').length;
    const criticalProducts = mockProducts.filter(p => p.status === 'critical').length;
    
    return {
      totalProducts,
      availableProducts,
      lowStockProducts,
      outOfStockProducts,
      criticalProducts,
      availabilityRate: Math.round((availableProducts / totalProducts) * 100)
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Улучшенный заголовок с градиентом */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Package className="w-8 h-8" />
                Доступность товаров
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </h1>
              <p className="text-blue-100 text-lg">
                Управление запасами и контроль доступности товаров на полках
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 relative">
                <BarChart3 className="w-12 h-12 text-white" />
                {notifications.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {notifications.length}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Мини-панель аналитики */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const analytics = getAnalyticsData();
              return (
                <>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-white">{analytics.totalProducts}</div>
                    <div className="text-sm text-blue-100">Всего товаров</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-green-300">{analytics.availableProducts}</div>
                    <div className="text-sm text-blue-100">В наличии</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-300">{analytics.lowStockProducts}</div>
                    <div className="text-sm text-blue-100">Заканчивается</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-red-300">{analytics.outOfStockProducts}</div>
                    <div className="text-sm text-blue-100">Отсутствует</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Панель уведомлений */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 rounded-full p-2">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Уведомления</h3>
                    <p className="text-sm text-gray-600">Важные события и предупреждения</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications([])}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Очистить все
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-xl border-l-4 ${
                      notification.type === 'error' ? 'bg-red-50 border-red-400' :
                      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Трекер отсутствия товаров - перемещен наверх */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <Timer className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Учёт отсутствия товаров</h3>
                <p className="text-sm text-gray-600">Отслеживание времени отсутствия товаров на полках</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Форма добавления */}
            <form onSubmit={handleAddOutOfStock} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Дата</label>
                  <input
                    type="date"
                    value={outOfStockData.date}
                    onChange={(e) => setOutOfStockData(prev => ({ ...prev, date: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Наименование товара</label>
                  <input
                    type="text"
                    value={outOfStockData.product}
                    onChange={(e) => setOutOfStockData(prev => ({ ...prev, product: e.target.value }))}
                    placeholder="Введите название товара"
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Часы</label>
                  <input
                    type="text"
                    value={outOfStockData.hours}
                    onChange={(e) => handleHoursChange(e.target.value)}
                    placeholder="0"
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Минуты</label>
                  <input
                    ref={minutesRef}
                    type="text"
                    value={outOfStockData.minutes}
                    onChange={(e) => handleMinutesChange(e.target.value)}
                    placeholder="0"
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Например: 1 час 20 минут — введите 1 и 20
              </div>
            </form>

            {/* Сообщения об успехе или ошибках */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 font-medium">Успех</span>
                </div>
                <p className="text-green-600 text-sm mt-1">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 font-medium">Ошибка</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Таблица записей */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Дата
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Наименование
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Время отсутствия
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {outOfStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
                          <Clock className="w-3 h-3 text-red-500" />
                          {item.hours}:{item.minutes.toString().padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteOutOfStock(item.id)}
                          disabled={loading}
                          className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                  {outOfStockItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <Timer className="w-8 h-8 text-gray-300" />
                          <span>Нет записей об отсутствии товаров</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Основное меню с улучшенным дизайном */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Поиск и фильтрация</h2>
                  <p className="text-sm text-gray-600">Найдите нужный товар или полку</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHelpPanel(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Справка</span>
                </button>
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Фильтры активны</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Расширенный поиск и фильтрация */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Поиск по названию товара или полке..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Все статусы</option>
                  <option value="available">В наличии</option>
                  <option value="low_stock">Заканчивается</option>
                  <option value="critical">Критически мало</option>
                  <option value="out_of_stock">Отсутствует</option>
                </select>
                <button 
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <PieChart className="w-5 h-5" />
                  Аналитика
                </button>
              </div>
              
              {/* Быстрые фильтры */}
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setStatusFilter('out_of_stock')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Отсутствующие
                </button>
                <button 
                  onClick={() => setStatusFilter('critical')}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                >
                  Критичные
                </button>
                <button 
                  onClick={() => setStatusFilter('low_stock')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                >
                  Заканчивающиеся
                </button>
                <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Очистить
                </button>
              </div>
              
              {/* Панель аналитики */}
              {showAnalytics && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Аналитика по товарам
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const analytics = getAnalyticsData();
                      return (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{analytics.availabilityRate}%</div>
                            <div className="text-sm text-gray-600">Доступность</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{analytics.availableProducts}</div>
                            <div className="text-sm text-gray-600">В наличии</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{analytics.lowStockProducts + analytics.criticalProducts}</div>
                            <div className="text-sm text-gray-600">Требуют внимания</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{analytics.outOfStockProducts}</div>
                            <div className="text-sm text-gray-600">Отсутствуют</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Список товаров */}
              <div className="grid gap-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Товары не найдены</p>
                    <p className="text-sm">Попробуйте изменить критерии поиска</p>
                  </div>
                ) : (
                  filteredProducts.map(product => {
                  const config = getStatusConfig(product.status);
                  return (
                    <div 
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{product.product_name}</h4>
                          <p className="text-sm text-gray-600">Полка: {product.shelf_location}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Доступно</p>
                            <p className="font-semibold">{product.available_stock} шт.</p>
                          </div>
                          <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg px-3 py-1`}>
                            <div className="flex items-center gap-2">
                              <div className={config.iconColor}>
                                {config.icon}
                              </div>
                              <span className={`text-sm font-medium ${config.textColor}`}>
                                {config.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
                )}
              </div>
            </div>
          </div>
        </div>





        {/* Улучшенные быстрые действия */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <Settings className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Быстрые действия</h3>
                <p className="text-sm text-gray-600">Часто используемые операции</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-medium">Обновить данные</span>
              </button>
              <button 
                onClick={() => alert('Экспорт в разработке')}
                className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
                <span className="font-medium">Экспорт отчета</span>
              </button>
              <button 
                onClick={() => alert('Сканирование QR-кода')}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-3"
              >
                <Scan className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Сканировать QR</span>
              </button>
              <button 
                onClick={() => alert('Настройки в разработке')}
                className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-3"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Настройки</span>
              </button>
            </div>
            
            {/* Дополнительные инструменты */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Дополнительные инструменты
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                  onClick={() => alert('Интеграция с 1С')}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm"
                >
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span>Синхронизация с 1С</span>
                </button>
                <button 
                  onClick={() => alert('Мобильное приложение')}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                  <span>Мобильное приложение</span>
                </button>
                <button 
                  onClick={() => alert('Командная работа')}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm"
                >
                  <Users className="w-4 h-4 text-gray-600" />
                  <span>Командная работа</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Улучшенное модальное окно */}
      {isOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" 
              aria-hidden="true"
              onClick={closeModal}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
              {/* Заголовок модального окна */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {selectedProduct.product_name}
                    </h3>
                    <p className="text-sm text-gray-600">Детальная информация о товаре</p>
                  </div>
                </div>
              </div>

              {/* Содержимое модального окна */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Статус */}
                  <div className="col-span-full">
                    {(() => {
                      const config = getStatusConfig(selectedProduct.status);
                      return (
                        <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4`}>
                          <div className="flex items-center gap-3">
                            <div className={`${config.iconColor}`}>
                              {config.icon}
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Статус:</span>
                              <p className={`font-semibold ${config.textColor} text-lg`}>
                                {config.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Информационные карточки */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Местоположение</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">{selectedProduct.shelf_location}</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Доступно</span>
                    </div>
                    <p className="font-semibold text-green-700 text-lg">{selectedProduct.available_stock} шт.</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Общий запас</span>
                    </div>
                    <p className="font-semibold text-blue-700 text-lg">{selectedProduct.total_stock} шт.</p>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Зарезервировано</span>
                    </div>
                    <p className="font-semibold text-yellow-700 text-lg">{selectedProduct.reserved_stock} шт.</p>
                  </div>

                  {selectedProduct.out_of_stock_hours > 0 && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">Отсутствует</span>
                      </div>
                      <p className="font-semibold text-red-700 text-lg">{selectedProduct.out_of_stock_hours} часов</p>
                    </div>
                  )}

                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Последнее пополнение</span>
                    </div>
                    <p className="font-semibold text-purple-700 text-lg">
                      {new Date(selectedProduct.last_restock_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={() => handleQuickAction('restock', selectedProduct)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 mb-3 sm:mb-0"
                >
                  <Package className="w-4 h-4" />
                  Заказать пополнение
                </button>
                <button
                  onClick={() => handleQuickAction('location', selectedProduct)}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 mb-3 sm:mb-0"
                >
                  <MapPin className="w-4 h-4" />
                  Перейти к полке
                </button>
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Выдвижная панель справки */}
      {showHelpPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowHelpPanel(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Заголовок панели */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Eye className="w-5 h-5 text-blue-600" />
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
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Поиск и фильтрация
                        </h5>
                        <ul className="text-sm text-blue-700 space-y-1">
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
        </div>
      )}
    </div>
  );
};

export default ShelfAvailabilityPage;