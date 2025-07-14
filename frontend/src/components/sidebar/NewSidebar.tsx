import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Clock, 
  TestTube, 
  Package, 
  FileText, 
  ShoppingCart, 
  Users, 
  Shield, 
  Settings, 
  Puzzle, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  Cake
} from 'lucide-react';

interface SubMenuItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  hasSubmenu: boolean;
  color: string;
  isHighlighted?: boolean;
  subItems?: SubMenuItem[];
}

const NewSidebar: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      hasSubmenu: true,
      color: 'text-blue-600',
      subItems: [
        { name: 'Общий обзор', path: '/dashboard' },
        { name: 'Настройка виджетов', path: '/dashboard/widgets' },
      ]
    },
    {
      id: 'sales-forecast',
      label: 'Прогнозирование продаж',
      icon: Clock,
      hasSubmenu: false,
      color: 'text-purple-600',
      path: '/sales-forecast'
    },
    {
      id: 'api-test',
      label: 'Тест API прогноза',
      icon: TestTube,
      hasSubmenu: false,
      color: 'text-green-600',
      path: '/test-forecast-api'
    },
    {
      id: 'product-availability',
      label: 'Доступность товаров на полке',
      icon: Package,
      hasSubmenu: false,
      color: 'text-orange-600',
      isHighlighted: true,
      path: '/inventory/shelf-availability'
    },
    {
      id: 'reports',
      label: 'Отчеты',
      icon: FileText,
      hasSubmenu: true,
      color: 'text-indigo-600',
      subItems: [
        { name: 'По продажам', path: '/reports/sales' },
        { name: 'По товарам', path: '/reports/products' },
        { name: 'По локациям', path: '/reports/locations' },
      ]
    },
    {
      id: 'products',
      label: 'Товары',
      icon: ShoppingCart,
      hasSubmenu: true,
      color: 'text-pink-600',
      subItems: [
        { name: 'Управление товарами', path: '/products' },
        { name: 'Категории', path: '/product-categories' },
        { name: 'Группы', path: '/product-groups' },
        { name: 'Виды', path: '/product-kinds' },
        { name: 'Производители', path: '/manufacturers' },
      ]
    },
    {
      id: 'organizations',
      label: 'Организации / Точки',
      icon: Users,
      hasSubmenu: true,
      color: 'text-cyan-600',
      subItems: [
        { name: 'Управление организациями', path: '/organizations' },
        { name: 'Управление точками', path: '/locations' },
        { name: 'Поставщики', path: '/suppliers' },
      ]
    },
    {
      id: 'admin-panel',
      label: 'Административная панель',
      icon: Shield,
      hasSubmenu: true,
      color: 'text-red-600',
      subItems: [
        { name: 'Управление пользователями', path: '/admin/users' },
        { name: 'Управление организациями', path: '/admin/organizations' },
        { name: 'Управление ролями', path: '/admin/roles' },
        { name: 'Управление поставщиками', path: '/admin/suppliers' },
      ]
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: Settings,
      hasSubmenu: true,
      color: 'text-gray-600',
      subItems: [
        { name: 'Настройки организации', path: '/settings/organization' },
        { name: 'Настройки системы', path: '/settings/system' },
      ]
    }
  ];

  const additionalItems: MenuItem[] = [
    {
      id: 'integrations',
      label: 'Интеграции',
      icon: Puzzle,
      hasSubmenu: true,
      color: 'text-emerald-600',
      subItems: [
        { name: 'API подключения', path: '/integrations/api' },
        { name: 'Импорт/экспорт данных', path: '/integrations/import-export' },
      ]
    },
    {
      id: 'help',
      label: 'Помощь',
      icon: HelpCircle,
      hasSubmenu: true,
      color: 'text-amber-600',
      subItems: [
        { name: 'Документация', path: '/help/documentation' },
        { name: 'Поддержка', path: '/help/support' },
      ]
    }
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.hasSubmenu) {
      toggleExpanded(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const MenuItem: React.FC<{ item: MenuItem; isAdditional?: boolean }> = ({ item, isAdditional = false }) => {
    const isItemActive = item.path ? isActive(item.path) : false;
    const hasActiveSubItem = item.subItems?.some(subItem => isActive(subItem.path)) || false;
    const isExpanded = expandedItems[item.id];

    return (
      <div className="mb-1">
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-xl mx-2 cursor-pointer transition-all duration-200 group ${
            item.isHighlighted 
              ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
              : isItemActive || hasActiveSubItem
              ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
              : 'hover:bg-gray-50 hover:shadow-sm'
          }`}
          onClick={() => handleItemClick(item)}
        >
          <div className="flex items-center space-x-3">
            <item.icon 
              className={`w-5 h-5 ${
                isItemActive || hasActiveSubItem ? 'text-brand-500' : item.color
              } transition-transform duration-200 group-hover:scale-110`} 
            />
            <span className={`text-sm font-medium ${
              item.isHighlighted 
                ? 'text-blue-700' 
                : isItemActive || hasActiveSubItem
                ? 'text-brand-500'
                : 'text-gray-700'
            } group-hover:text-gray-900`}>
              {item.label}
            </span>
          </div>
          {item.hasSubmenu && (
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
              {isExpanded ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              }
            </div>
          )}
        </div>
        {item.hasSubmenu && isExpanded && item.subItems && (
          <div className="ml-8 mt-2 space-y-1">
            {item.subItems.map((subItem, index) => (
              <Link
                key={index}
                to={subItem.path}
                className={`block px-4 py-2 text-sm rounded-lg mx-2 transition-colors duration-200 ${
                  isActive(subItem.path)
                    ? 'bg-brand-50 text-brand-500 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Cake className="w-6 h-6 text-white" />
          </div>
          <Link to="/" className="text-xl font-bold text-gray-800 hover:text-gray-900 transition-colors">
            Добрынинский
          </Link>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-3">
            Основное меню
          </h2>
          <div className="space-y-1">
            {menuItems.map(item => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-3">
            Дополнительно
          </h2>
          <div className="space-y-1">
            {additionalItems.map(item => (
              <MenuItem key={item.id} item={item} isAdditional={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSidebar; 