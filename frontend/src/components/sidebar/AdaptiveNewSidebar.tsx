import React, { useState, useEffect, useContext } from 'react';
import { 
  Home, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  HelpCircle, 
  ChevronDown,
  ChevronRight,
  Cake,
  Edit3,
  GripVertical
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { Link, useLocation } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: MenuItem[];
  color: string;
}

interface SortableItemProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  sidebarOpen: boolean;
  isEditing: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  isActive,
  isExpanded,
  onToggle,
  sidebarOpen,
  isEditing,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`
          flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
          ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'hover:bg-gray-100'}
          ${isDragging ? 'shadow-2xl z-50' : ''}
        `}
      >
        {isEditing && (
          <div
            {...attributes}
            {...listeners}
            className="mr-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={16} />
          </div>
        )}
        
        <div className="flex items-center min-w-0 flex-1">
          <span className={`text-xl ${item.color} flex-shrink-0`}>
            {item.icon}
          </span>
          
          {sidebarOpen && (
            <>
              <span className="ml-3 font-medium text-sm flex-1 min-w-0">
                {item.title}
              </span>
              
              {item.subItems && (
                <span className="ml-2 flex-shrink-0">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      
      {item.subItems && isExpanded && sidebarOpen && (
        <div className="ml-6 mt-2 space-y-1">
          {item.subItems.map((subItem) => (
            <Link
              key={subItem.id}
              to={subItem.path || '#'}
              className="flex items-center p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <span className={`mr-3 ${subItem.color}`}>
                {subItem.icon}
              </span>
              {subItem.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const AdaptiveNewSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Default menu items - restored from original sidebar
  const defaultMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home size={20} />,
      color: 'text-blue-600',
      subItems: [
        { id: 'overview', title: 'Общий обзор', icon: <BarChart3 size={16} />, path: '/dashboard/overview', color: 'text-blue-400' },
        { id: 'widgets', title: 'Настройка виджетов', icon: <Package size={16} />, path: '/dashboard/widgets', color: 'text-blue-400' }
      ]
    },
    {
      id: 'sales-forecast',
      title: 'Прогнозирование продаж',
      icon: <BarChart3 size={20} />,
      color: 'text-purple-600',
      subItems: [
        { id: 'current-forecast', title: 'Текущий прогноз', icon: <BarChart3 size={16} />, path: '/sales-forecast', color: 'text-purple-400' },
        { id: 'new-forecast', title: 'Новый прогноз', icon: <BarChart3 size={16} />, path: '/sales-forecast-new', color: 'text-purple-400' }
      ]
    },
    {
      id: 'api-test',
      title: 'Тест API прогноза',
      icon: <Settings size={20} />,
      color: 'text-green-600',
      path: '/test-forecast-api'
    },
    {
      id: 'inventory-management',
      title: 'Управление запасами',
      icon: <Package size={20} />,
      color: 'text-orange-600',
      path: '/inventory/management'
    },
    {
      id: 'shelf-availability',
      title: 'Доступность товаров на полке',
      icon: <Package size={20} />,
      color: 'text-orange-600',
      path: '/inventory/shelf-availability'
    },
    {
      id: 'warehouse-analytics',
      title: 'Аналитика склада',
      icon: <BarChart3 size={20} />,
      color: 'text-indigo-600',
      path: '/analytics/warehouse'
    },
    {
      id: 'monitoring',
      title: 'Мониторинг системы',
      icon: <Settings size={20} />,
      color: 'text-red-600',
      subItems: [
        { id: 'system-events', title: 'Системные события', icon: <Settings size={16} />, path: '/monitoring/events', color: 'text-red-400' },
        { id: 'performance', title: 'Производительность', icon: <BarChart3 size={16} />, path: '/monitoring/performance', color: 'text-red-400' },
        { id: 'notifications', title: 'Уведомления', icon: <Settings size={16} />, path: '/monitoring/notifications', color: 'text-red-400' },
        { id: 'system-logs', title: 'Логи системы', icon: <Settings size={16} />, path: '/monitoring/logs', color: 'text-red-400' }
      ]
    },
    {
      id: 'planning',
      title: 'Планирование',
      icon: <Settings size={20} />,
      color: 'text-blue-600',
      subItems: [
        { id: 'tasks', title: 'Задачи и проекты', icon: <Settings size={16} />, path: '/planning/tasks', color: 'text-blue-400' },
        { id: 'calendar', title: 'Календарь событий', icon: <Settings size={16} />, path: '/planning/calendar', color: 'text-blue-400' },
        { id: 'procurement', title: 'Планы закупок', icon: <ShoppingCart size={16} />, path: '/planning/procurement', color: 'text-blue-400' },
        { id: 'budget', title: 'Бюджетирование', icon: <Settings size={16} />, path: '/planning/budget', color: 'text-blue-400' }
      ]
    },
    {
      id: 'quality-control',
      title: 'Контроль качества',
      icon: <Settings size={20} />,
      color: 'text-green-600',
      subItems: [
        { id: 'inspections', title: 'Проверки качества', icon: <Settings size={16} />, path: '/quality/inspections', color: 'text-green-400' },
        { id: 'certificates', title: 'Сертификаты', icon: <Settings size={16} />, path: '/quality/certificates', color: 'text-green-400' },
        { id: 'complaints', title: 'Жалобы и возвраты', icon: <Settings size={16} />, path: '/quality/complaints', color: 'text-green-400' },
        { id: 'standards', title: 'Стандарты качества', icon: <Settings size={16} />, path: '/quality/standards', color: 'text-green-400' }
      ]
    },
    {
      id: 'finance',
      title: 'Финансы',
      icon: <Settings size={20} />,
      color: 'text-emerald-600',
      subItems: [
        { id: 'budget-planning', title: 'Бюджет и планирование', icon: <Settings size={16} />, path: '/finance/budget', color: 'text-emerald-400' },
        { id: 'expenses', title: 'Расходы и доходы', icon: <BarChart3 size={16} />, path: '/finance/expenses', color: 'text-emerald-400' },
        { id: 'payments', title: 'Платежи', icon: <ShoppingCart size={16} />, path: '/finance/payments', color: 'text-emerald-400' },
        { id: 'financial-reports', title: 'Финансовые отчеты', icon: <BarChart3 size={16} />, path: '/finance/reports', color: 'text-emerald-400' }
      ]
    },
    {
      id: 'reports',
      title: 'Отчеты',
      icon: <BarChart3 size={20} />,
      color: 'text-indigo-600',
      subItems: [
        { id: 'sales-reports', title: 'По продажам', icon: <ShoppingCart size={16} />, path: '/reports/sales', color: 'text-indigo-400' },
        { id: 'warehouse-reports', title: 'История операций', icon: <Package size={16} />, path: '/reports/warehouse', color: 'text-indigo-400' },
        { id: 'product-reports', title: 'По товарам', icon: <Package size={16} />, path: '/reports/products', color: 'text-indigo-400' },
        { id: 'location-reports', title: 'По локациям', icon: <Settings size={16} />, path: '/reports/locations', color: 'text-indigo-400' }
      ]
    },
    {
      id: 'products',
      title: 'Товары',
      icon: <ShoppingCart size={20} />,
      color: 'text-pink-600',
      subItems: [
        { id: 'product-management', title: 'Управление товарами', icon: <ShoppingCart size={16} />, path: '/products', color: 'text-pink-400' },
        { id: 'categories', title: 'Категории', icon: <Settings size={16} />, path: '/product-categories', color: 'text-pink-400' },
        { id: 'groups', title: 'Группы', icon: <Settings size={16} />, path: '/product-groups', color: 'text-pink-400' },
        { id: 'kinds', title: 'Виды', icon: <Settings size={16} />, path: '/product-kinds', color: 'text-pink-400' },
        { id: 'manufacturers', title: 'Производители', icon: <Settings size={16} />, path: '/manufacturers', color: 'text-pink-400' }
      ]
    },
    {
      id: 'organizations',
      title: 'Организации / Точки',
      icon: <Users size={20} />,
      color: 'text-cyan-600',
      subItems: [
        { id: 'organization-management', title: 'Управление организациями', icon: <Users size={16} />, path: '/organizations', color: 'text-cyan-400' },
        { id: 'location-management', title: 'Управление точками', icon: <Settings size={16} />, path: '/locations', color: 'text-cyan-400' },
        { id: 'suppliers', title: 'Поставщики', icon: <Users size={16} />, path: '/suppliers', color: 'text-cyan-400' }
      ]
    },
    {
      id: 'admin-panel',
      title: 'Административная панель',
      icon: <Settings size={20} />,
      color: 'text-red-600',
      subItems: [
        { id: 'user-management', title: 'Управление пользователями', icon: <Users size={16} />, path: '/admin/users', color: 'text-red-400' },
        { id: 'admin-organizations', title: 'Управление организациями', icon: <Users size={16} />, path: '/admin/organizations', color: 'text-red-400' },
        { id: 'role-management', title: 'Управление ролями', icon: <Settings size={16} />, path: '/admin/roles', color: 'text-red-400' },
        { id: 'admin-suppliers', title: 'Управление поставщиками', icon: <Users size={16} />, path: '/admin/suppliers', color: 'text-red-400' }
      ]
    },
    {
      id: 'security',
      title: 'Безопасность',
      icon: <Settings size={20} />,
      color: 'text-red-600',
      subItems: [
        { id: 'security-audit', title: 'Аудит безопасности', icon: <Settings size={16} />, path: '/security/audit', color: 'text-red-400' },
        { id: 'access-management', title: 'Управление доступом', icon: <Settings size={16} />, path: '/security/access', color: 'text-red-400' },
        { id: 'security-events', title: 'Журнал событий', icon: <Settings size={16} />, path: '/security/events', color: 'text-red-400' },
        { id: 'backup', title: 'Резервное копирование', icon: <Settings size={16} />, path: '/security/backup', color: 'text-red-400' }
      ]
    },
    {
      id: 'automation',
      title: 'Автоматизация',
      icon: <Settings size={20} />,
      color: 'text-yellow-600',
      subItems: [
        { id: 'workflows', title: 'Рабочие процессы', icon: <Settings size={16} />, path: '/automation/workflows', color: 'text-yellow-400' },
        { id: 'scheduler', title: 'Планировщик задач', icon: <Settings size={16} />, path: '/automation/scheduler', color: 'text-yellow-400' },
        { id: 'auto-notifications', title: 'Автоматические уведомления', icon: <Settings size={16} />, path: '/automation/notifications', color: 'text-yellow-400' },
        { id: 'scripts', title: 'Скрипты и макросы', icon: <Settings size={16} />, path: '/automation/scripts', color: 'text-yellow-400' }
      ]
    },
    {
      id: 'communication',
      title: 'Коммуникации',
      icon: <Settings size={20} />,
      color: 'text-blue-600',
      subItems: [
        { id: 'internal-messages', title: 'Внутренние сообщения', icon: <Settings size={16} />, path: '/communication/messages', color: 'text-blue-400' },
        { id: 'team-notifications', title: 'Уведомления команды', icon: <Settings size={16} />, path: '/communication/team-notifications', color: 'text-blue-400' },
        { id: 'announcements', title: 'Объявления', icon: <Settings size={16} />, path: '/communication/announcements', color: 'text-blue-400' },
        { id: 'support-chat', title: 'Чат поддержки', icon: <Settings size={16} />, path: '/communication/support-chat', color: 'text-blue-400' }
      ]
    },
    {
      id: 'integrations',
      title: 'Интеграции',
      icon: <Settings size={20} />,
      color: 'text-emerald-600',
      subItems: [
        { id: 'api-connections', title: 'API подключения', icon: <Settings size={16} />, path: '/integrations/api', color: 'text-emerald-400' },
        { id: 'import-export', title: 'Импорт/экспорт данных', icon: <Settings size={16} />, path: '/integrations/import-export', color: 'text-emerald-400' },
        { id: 'external-services', title: 'Внешние сервисы', icon: <Settings size={16} />, path: '/integrations/external', color: 'text-emerald-400' },
        { id: 'webhooks', title: 'Webhook настройки', icon: <Settings size={16} />, path: '/integrations/webhooks', color: 'text-emerald-400' }
      ]
    },
    {
      id: 'settings',
      title: 'Настройки',
      icon: <Settings size={20} />,
      color: 'text-gray-600',
      subItems: [
        { id: 'organization-settings', title: 'Настройки организации', icon: <Settings size={16} />, path: '/settings/organization', color: 'text-gray-400' },
        { id: 'system-settings', title: 'Настройки системы', icon: <Settings size={16} />, path: '/settings/system', color: 'text-gray-400' },
        { id: 'general-settings', title: 'Общие настройки', icon: <Settings size={16} />, path: '/settings/general', color: 'text-gray-400' },
        { id: 'profile-settings', title: 'Профиль пользователя', icon: <Users size={16} />, path: '/settings/profile', color: 'text-gray-400' },
        { id: 'notification-settings', title: 'Уведомления', icon: <Settings size={16} />, path: '/settings/notifications', color: 'text-gray-400' },
        { id: 'security-settings', title: 'Безопасность', icon: <Settings size={16} />, path: '/settings/security', color: 'text-gray-400' }
      ]
    },
    {
      id: 'help',
      title: 'Помощь',
      icon: <HelpCircle size={20} />,
      color: 'text-amber-600',
      subItems: [
        { id: 'documentation', title: 'Документация', icon: <HelpCircle size={16} />, path: '/help/documentation', color: 'text-amber-400' },
        { id: 'support', title: 'Поддержка', icon: <HelpCircle size={16} />, path: '/help/support', color: 'text-amber-400' },
        { id: 'training', title: 'Обучающие материалы', icon: <HelpCircle size={16} />, path: '/help/training', color: 'text-amber-400' },
        { id: 'faq', title: 'FAQ', icon: <HelpCircle size={16} />, path: '/help/faq', color: 'text-amber-400' }
      ]
    }
  ];

  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('sidebarOrder');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        // Restore the order based on saved IDs
        const reorderedItems = parsedOrder.map((savedId: string) => 
          defaultMenuItems.find(item => item.id === savedId)
        ).filter(Boolean);
        
        // Add any new items that weren't in the saved order
        const savedIds = new Set(parsedOrder);
        const newItems = defaultMenuItems.filter(item => !savedIds.has(item.id));
        
        setMenuItems([...reorderedItems, ...newItems]);
      } catch (error) {
        console.error('Error loading saved order:', error);
        setMenuItems(defaultMenuItems);
      }
    }
  }, []);

  // Save order to localStorage
  const saveOrder = (items: MenuItem[]) => {
    try {
      // Save only the IDs, not the full objects with React components
      const orderIds = items.map(item => item.id);
      localStorage.setItem('sidebarOrder', JSON.stringify(orderIds));
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close sidebar on mobile when clicking outside
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.getElementById('adaptive-sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          toggleMobileSidebar();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isMobileOpen, toggleMobileSidebar]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (item: MenuItem) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.subItems) {
      return item.subItems.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      try {
        setMenuItems((items) => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over?.id);
          
          if (oldIndex === -1 || newIndex === -1) {
            console.error('Invalid drag operation: item not found');
            return items;
          }
          
          const newItems = arrayMove(items, oldIndex, newIndex);
          saveOrder(newItems);
          return newItems;
        });
      } catch (error) {
        console.error('Error during drag operation:', error);
      }
    }
  };

  const resetOrder = () => {
    setMenuItems(defaultMenuItems);
    localStorage.removeItem('sidebarOrder');
    setExpandedItems([]);
    setIsEditing(false);
  };

  // Determine if sidebar should show text based on state
  const sidebarOpen = isExpanded || isHovered || isMobileOpen;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => toggleMobileSidebar()}
        />
      )}

      {/* Sidebar */}
      <div
        id="adaptive-sidebar"
        className={`
          fixed left-0 top-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out
          ${isMobile 
            ? (isMobileOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full')
            : (isExpanded ? 'w-80' : 'w-20 hover:w-80')
          }
          md:relative md:translate-x-0
        `}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Cake className="text-white" size={24} />
              </div>
              {sidebarOpen && (
                <div className="ml-3 flex-1">
                  <h1 className="text-lg font-bold text-gray-800">Добрынинский</h1>
                  <p className="text-xs text-gray-500">Панель управления</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Controls */}
          {sidebarOpen && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {isEditing ? 'Редактирование порядка' : 'Настройка меню'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`
                      px-3 py-1 rounded-md text-xs font-medium transition-colors
                      ${isEditing 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }
                    `}
                  >
                    {isEditing ? 'Готово' : <Edit3 size={12} />}
                  </button>
                  {isEditing && (
                    <button
                      onClick={resetOrder}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Сброс
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={menuItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <div key={item.id} onClick={() => item.subItems && toggleExpanded(item.id)}>
                      {item.path && !item.subItems ? (
                        <Link to={item.path}>
                          <SortableItem
                            item={item}
                            isActive={isActive(item)}
                            isExpanded={expandedItems.includes(item.id)}
                            onToggle={() => toggleExpanded(item.id)}
                            sidebarOpen={sidebarOpen}
                            isEditing={isEditing}
                          />
                        </Link>
                      ) : (
                        <SortableItem
                          item={item}
                          isActive={isActive(item)}
                          isExpanded={expandedItems.includes(item.id)}
                          onToggle={() => toggleExpanded(item.id)}
                          sidebarOpen={sidebarOpen}
                          isEditing={isEditing}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdaptiveNewSidebar; 