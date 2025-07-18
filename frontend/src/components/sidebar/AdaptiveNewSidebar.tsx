import React, { useState, useEffect, useContext, useMemo } from 'react';
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
  GripVertical,
  Eye,
  EyeOff
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
import { useTranslation, Trans } from 'react-i18next';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: MenuItem[];
  color: string;
  isVisible?: boolean;
}

interface SortableItemProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  sidebarOpen: boolean;
  isEditing: boolean;
  onVisibilityToggle: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  isActive,
  isExpanded,
  onToggle,
  sidebarOpen,
  isEditing,
  onVisibilityToggle,
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
    opacity: isDragging ? 0.5 : item.isVisible === false ? 0.6 : 1,
  };
  const { t } = useTranslation();

  // Don't render hidden items when not in edit mode
  if (!isEditing && item.isVisible === false) {
    return null;
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`
          flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
          ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'hover:bg-gray-100'}
          ${isDragging ? 'shadow-2xl z-50' : ''}
          ${item.isVisible === false ? 'bg-gray-50 border-2 border-dashed border-gray-300' : ''}
        `}
      >
        {isEditing && (
          <div className="flex items-center mr-2">
            <div
              {...attributes}
              {...listeners}
              className="mr-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={16} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVisibilityToggle(item.id);
              }}
              className={`
                p-1 rounded hover:bg-gray-200 transition-colors
                ${item.isVisible === false ? 'text-gray-400' : 'text-gray-600'}
              `}
              title={item.isVisible === false ? t('sidebar.controls.show_item') : t('sidebar.controls.hide_item')}
            >
              {item.isVisible === false ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        )}
        
        <div className="flex items-center min-w-0 flex-1">
          <span className={`text-xl ${item.color} flex-shrink-0 ${item.isVisible === false ? 'opacity-50' : ''}`}>
            {item.icon}
          </span>
          
          {sidebarOpen && (
            <>
              <span className={`ml-3 font-medium text-sm flex-1 min-w-0 ${item.isVisible === false ? 'opacity-50 line-through' : ''}`}>
                {item.title}
                {item.isVisible === false && (
                  <span className="ml-2 text-xs text-gray-400">({t('sidebar.hidden_label')})</span>
                )}
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
              className={`
                flex items-center p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors
                ${item.isVisible === false ? 'opacity-50' : ''}
              `}
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
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  const { t, ready } = useTranslation();

  // Default menu items - мемоизируем с зависимостью от t и ready
  const defaultMenuItems = useMemo((): MenuItem[] => {
    if (!ready) {
      return []; // Возвращаем пустой массив пока переводы не загружены
    }

    return [
      {
        id: 'dashboard',
        title: t('sidebar.nav.dashboard.title'),
        icon: <Home size={20} />,
        color: 'text-blue-600',
        subItems: [
          { id: 'overview', title: t('sidebar.nav.dashboard.overview'), icon: <BarChart3 size={16} />, path: '/dashboard', color: 'text-blue-400' },
          { id: 'widgets', title: t('sidebar.nav.dashboard.widgets'), icon: <Package size={16} />, path: '/dashboard/widgets', color: 'text-blue-400' }
        ]
      },
      {
        id: 'sales-forecast',
        title: t('sidebar.nav.salesForecast.title'),
        icon: <BarChart3 size={20} />,
        color: 'text-purple-600',
        subItems: [
          { id: 'current-forecast', title: t('sidebar.nav.salesForecast.current'), icon: <BarChart3 size={16} />, path: '/sales-forecast', color: 'text-purple-400' },
          { id: 'new-forecast', title: t('sidebar.nav.salesForecast.new'), icon: <BarChart3 size={16} />, path: '/sales-forecast-new', color: 'text-purple-400' }
        ]
      },
      {
        id: 'api-test',
        title: t('sidebar.nav.testApi.title'),
        icon: <Settings size={20} />,
        color: 'text-green-600',
        path: '/test-forecast-api'
      },
      {
        id: 'inventory-management',
        title: t('sidebar.nav.inventory.title'),
        icon: <Package size={20} />,
        color: 'text-orange-600',
        path: '/inventory/management'
      },
      {
        id: 'shelf-availability',
        title: t('sidebar.nav.shelfAvailability.title'),
        icon: <Package size={20} />,
        color: 'text-orange-600',
        path: '/inventory/shelf-availability'
      },
      {
        id: 'warehouse-analytics',
        title: t('sidebar.nav.warehouseAnalytics.title'),
        icon: <BarChart3 size={20} />,
        color: 'text-indigo-600',
        path: '/analytics/warehouse'
      },
      {
        id: 'monitoring',
        title: t('sidebar.nav.monitoring.title'),
        icon: <Settings size={20} />,
        color: 'text-red-600',
        subItems: [
          { id: 'system-events', title: t('sidebar.nav.monitoring.events'), icon: <Settings size={16} />, path: '/monitoring/events', color: 'text-red-400' },
          { id: 'performance', title: t('sidebar.nav.monitoring.performance'), icon: <BarChart3 size={16} />, path: '/monitoring/performance', color: 'text-red-400' },
          { id: 'notifications', title: t('sidebar.nav.monitoring.notifications'), icon: <Settings size={16} />, path: '/monitoring/notifications', color: 'text-red-400' },
          { id: 'system-logs', title: t('sidebar.nav.monitoring.logs'), icon: <Settings size={16} />, path: '/monitoring/logs', color: 'text-red-400' }
        ]
      },
      {
        id: 'planning',
        title: t('sidebar.nav.planning.title'),
        icon: <Settings size={20} />,
        color: 'text-blue-600',
        subItems: [
          { id: 'tasks', title: t('sidebar.nav.planning.tasks'), icon: <Settings size={16} />, path: '/planning/tasks', color: 'text-blue-400' },
          { id: 'calendar', title: t('sidebar.nav.planning.calendar'), icon: <Settings size={16} />, path: '/planning/calendar', color: 'text-blue-400' },
          { id: 'procurement', title: t('sidebar.nav.planning.procurement'), icon: <ShoppingCart size={16} />, path: '/planning/procurement', color: 'text-blue-400' },
          { id: 'budget', title: t('sidebar.nav.planning.budgeting'), icon: <Settings size={16} />, path: '/planning/budget', color: 'text-blue-400' }
        ]
      },
      {
        id: 'quality-control',
        title: t('sidebar.nav.qualityControl.title'),
        icon: <Cake size={20} />,
        color: 'text-pink-600',
        subItems: [
          { id: 'inspections', title: t('sidebar.nav.qualityControl.inspections'), icon: <Cake size={16} />, path: '/quality/inspections', color: 'text-pink-400' },
          { id: 'certificates', title: t('sidebar.nav.qualityControl.certificates'), icon: <Cake size={16} />, path: '/quality/certificates', color: 'text-pink-400' },
          { id: 'complaints', title: t('sidebar.nav.qualityControl.complaints'), icon: <Cake size={16} />, path: '/quality/complaints', color: 'text-pink-400' },
          { id: 'standards', title: t('sidebar.nav.qualityControl.standards'), icon: <Cake size={16} />, path: '/quality/standards', color: 'text-pink-400' }
        ]
      },
      {
        id: 'finance',
        title: t('sidebar.nav.finance.title'),
        icon: <Users size={20} />,
        color: 'text-cyan-600',
        subItems: [
          { id: 'budget-planning', title: t('sidebar.nav.finance.budget'), icon: <Users size={16} />, path: '/finance/budget', color: 'text-cyan-400' },
          { id: 'expenses-income', title: t('sidebar.nav.finance.expenses'), icon: <Users size={16} />, path: '/finance/expenses', color: 'text-cyan-400' },
          { id: 'payments', title: t('sidebar.nav.finance.payments'), icon: <Users size={16} />, path: '/finance/payments', color: 'text-cyan-400' },
          { id: 'financial-reports', title: t('sidebar.nav.finance.reports'), icon: <BarChart3 size={16} />, path: '/finance/reports', color: 'text-cyan-400' }
        ]
      },
      {
        id: 'reports',
        title: t('sidebar.nav.reports.title'),
        icon: <BarChart3 size={20} />,
        color: 'text-teal-600',
        subItems: [
          { id: 'sales-reports', title: t('sidebar.nav.reports.sales'), icon: <BarChart3 size={16} />, path: '/reports/sales', color: 'text-teal-400' },
          { id: 'warehouse-reports', title: t('sidebar.nav.reports.warehouse'), icon: <Package size={16} />, path: '/reports/warehouse', color: 'text-teal-400' },
          { id: 'product-reports', title: t('sidebar.nav.reports.products'), icon: <ShoppingCart size={16} />, path: '/reports/products', color: 'text-teal-400' },
          { id: 'location-reports', title: t('sidebar.nav.reports.locations'), icon: <Users size={16} />, path: '/reports/locations', color: 'text-teal-400' }
        ]
      },
      {
        id: 'products',
        title: t('sidebar.nav.products.title'),
        icon: <ShoppingCart size={20} />,
        color: 'text-lime-600',
        subItems: [
          { id: 'manage-products', title: t('sidebar.nav.products.manage'), icon: <ShoppingCart size={16} />, path: '/products/management', color: 'text-lime-400' },
          { id: 'categories', title: t('sidebar.nav.products.categories'), icon: <ShoppingCart size={16} />, path: '/products/categories', color: 'text-lime-400' },
          { id: 'groups', title: t('sidebar.nav.products.groups'), icon: <ShoppingCart size={16} />, path: '/products/groups', color: 'text-lime-400' },
          { id: 'kinds', title: t('sidebar.nav.products.kinds'), icon: <ShoppingCart size={16} />, path: '/products/kinds', color: 'text-lime-400' },
          { id: 'manufacturers', title: t('sidebar.nav.products.manufacturers'), icon: <ShoppingCart size={16} />, path: '/products/manufacturers', color: 'text-lime-400' }
        ]
      },
      {
        id: 'organizations',
        title: t('sidebar.nav.organizations.title'),
        icon: <Users size={20} />,
        color: 'text-emerald-600',
        subItems: [
          { id: 'manage-orgs', title: t('sidebar.nav.organizations.manageOrgs'), icon: <Users size={16} />, path: '/organizations/management', color: 'text-emerald-400' },
          { id: 'manage-locs', title: t('sidebar.nav.organizations.manageLocs'), icon: <Users size={16} />, path: '/locations/management', color: 'text-emerald-400' },
          { id: 'suppliers', title: t('sidebar.nav.organizations.suppliers'), icon: <Users size={16} />, path: '/suppliers/management', color: 'text-emerald-400' }
        ]
      },
      {
        id: 'admin',
        title: t('sidebar.nav.admin.title'),
        icon: <Settings size={20} />,
        color: 'text-gray-600',
        subItems: [
          { id: 'admin-users', title: t('sidebar.nav.admin.users'), icon: <Users size={16} />, path: '/admin/users', color: 'text-gray-400' },
          { id: 'admin-orgs', title: t('sidebar.nav.admin.orgs'), icon: <Users size={16} />, path: '/admin/organizations', color: 'text-gray-400' },
          { id: 'admin-roles', title: t('sidebar.nav.admin.roles'), icon: <Users size={16} />, path: '/admin/roles', color: 'text-gray-400' },
          { id: 'admin-suppliers', title: t('sidebar.nav.admin.suppliers'), icon: <Users size={16} />, path: '/admin/suppliers', color: 'text-gray-400' }
        ]
      },
      {
        id: 'settings',
        title: t('sidebar.nav.settings.title'),
        icon: <Settings size={20} />,
        color: 'text-gray-600',
        subItems: [
          { id: 'org-settings', title: t('sidebar.nav.settings.organization'), icon: <Settings size={16} />, path: '/settings/organization', color: 'text-gray-400' },
          { id: 'system-settings', title: t('sidebar.nav.settings.system'), icon: <Settings size={16} />, path: '/settings/system', color: 'text-gray-400' }
        ]
      }
    ];
  }, [t, ready]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Load saved order and hidden items from server
  useEffect(() => {
    // Не загружаем настройки пока переводы не готовы
    if (!ready || defaultMenuItems.length === 0) {
      return;
    }

    const loadUserPreferences = async () => {
      try {
        const { getUserPreferencesAuth } = await import('@/services/userPreferencesService');
        const preferences = await getUserPreferencesAuth();
        
        if (preferences.sidebar) {
          const { order, hiddenItems } = preferences.sidebar;
          
          // Restore order if exists
          if (order && order.length > 0) {
            const reorderedItems = order.map((savedId: string) => 
              defaultMenuItems.find(item => item.id === savedId)
            ).filter((item): item is MenuItem => item !== undefined);
            
            // Add any new items that weren't in the saved order
            const savedIds = new Set(order);
            const newItems = defaultMenuItems.filter(item => !savedIds.has(item.id));
            
            setMenuItems([...reorderedItems, ...newItems]);
          } else {
            setMenuItems(defaultMenuItems);
          }
          
          // Restore hidden items
          if (hiddenItems && hiddenItems.length > 0) {
            setHiddenItems(new Set(hiddenItems));
          }
        } else {
          setMenuItems(defaultMenuItems);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        // Fallback to localStorage for backward compatibility
        const savedOrder = localStorage.getItem('sidebarOrder');
        const savedHiddenItems = localStorage.getItem('sidebarHiddenItems');
        
        if (savedOrder) {
          try {
            const parsedOrder = JSON.parse(savedOrder);
            const reorderedItems = parsedOrder.map((savedId: string) => 
              defaultMenuItems.find(item => item.id === savedId)
            ).filter(Boolean);
            
            const savedIds = new Set(parsedOrder);
            const newItems = defaultMenuItems.filter(item => !savedIds.has(item.id));
            
            setMenuItems([...reorderedItems, ...newItems]);
          } catch (error) {
            console.error('Error loading saved order:', error);
            setMenuItems(defaultMenuItems);
          }
        } else {
          setMenuItems(defaultMenuItems);
        }
        
        if (savedHiddenItems) {
          try {
            const parsedHiddenItems = JSON.parse(savedHiddenItems);
            setHiddenItems(new Set(parsedHiddenItems));
          } catch (error) {
            console.error('Error loading hidden items:', error);
          }
        }
      }
    };

    loadUserPreferences();
  }, [defaultMenuItems, ready]);

  // Save order to server and localStorage as fallback
  const saveOrder = async (items: MenuItem[]) => {
    try {
      const orderIds = items.map(item => item.id);
      
      // Save to server
      const { saveSidebarPreferencesAuth } = await import('@/services/userPreferencesService');
      await saveSidebarPreferencesAuth(orderIds, Array.from(hiddenItems));
      
      // Keep localStorage as fallback
      localStorage.setItem('sidebarOrder', JSON.stringify(orderIds));
    } catch (error) {
      console.error('Error saving order:', error);
      // Fallback to localStorage only
      try {
        const orderIds = items.map(item => item.id);
        localStorage.setItem('sidebarOrder', JSON.stringify(orderIds));
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    }
  };

  // Save hidden items to server and localStorage as fallback
  const saveHiddenItems = async (hiddenSet: Set<string>) => {
    try {
      const orderIds = menuItems.map(item => item.id);
      
      // Save to server
      const { saveSidebarPreferencesAuth } = await import('@/services/userPreferencesService');
      await saveSidebarPreferencesAuth(orderIds, Array.from(hiddenSet));
      
      // Keep localStorage as fallback
      localStorage.setItem('sidebarHiddenItems', JSON.stringify(Array.from(hiddenSet)));
    } catch (error) {
      console.error('Error saving hidden items:', error);
      // Fallback to localStorage only
      try {
        localStorage.setItem('sidebarHiddenItems', JSON.stringify(Array.from(hiddenSet)));
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
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

  const toggleVisibility = (itemId: string) => {
    setHiddenItems(prev => {
      const newHiddenItems = new Set(prev);
      if (newHiddenItems.has(itemId)) {
        newHiddenItems.delete(itemId);
      } else {
        newHiddenItems.add(itemId);
      }
      saveHiddenItems(newHiddenItems);
      return newHiddenItems;
    });
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
    setHiddenItems(new Set());
    
    // Clear both server and localStorage
    const clearPreferences = async () => {
      try {
        const { saveSidebarPreferencesAuth } = await import('@/services/userPreferencesService');
        await saveSidebarPreferencesAuth([], []);
      } catch (error) {
        console.error('Error clearing server preferences:', error);
      }
    };
    
    clearPreferences();
    localStorage.removeItem('sidebarOrder');
    localStorage.removeItem('sidebarHiddenItems');
    setExpandedItems([]);
    setIsEditing(false);
  };

  // Apply visibility state to menu items
  const visibleMenuItems = menuItems.map(item => ({
    ...item,
    isVisible: !hiddenItems.has(item.id)
  }));

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
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {isEditing ? t('sidebar.controls.edit_mode') : t('sidebar.controls.setup_menu')}
                  </span>
                  {hiddenItems.size > 0 && (
                    <span className="text-xs text-gray-500 mt-1">
                      {t('sidebar.controls.hidden_items_count', { count: hiddenItems.size })}
                    </span>
                  )}
                </div>
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
                    {isEditing ? t('sidebar.controls.done') : <Edit3 size={12} />}
                  </button>
                  {isEditing && (
                    <button
                      onClick={resetOrder}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      title={t('sidebar.controls.reset_all_settings')}
                    >
                      {t('sidebar.controls.reset')}
                    </button>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="mt-3 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    <Trans i18nKey="sidebar.controls.hint">
                      💡 <strong>Подсказка:</strong> Используйте <GripVertical size={12} className="inline" /> для перетаскивания и <Eye size={12} className="inline" /> для скрытия элементов
                    </Trans>
                  </p>
                </div>
              )}
            </div>
          )}

                  {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!ready ? (
            <div className="flex items-center justify-center p-4">
              <div className="text-gray-500">Загрузка меню...</div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={visibleMenuItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {visibleMenuItems.map((item) => (
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
                            onVisibilityToggle={toggleVisibility}
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
                          onVisibilityToggle={toggleVisibility}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default AdaptiveNewSidebar; 