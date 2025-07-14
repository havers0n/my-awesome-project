import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { AddWidgetModalProps, WIDGET_CATEGORIES } from '../types/dashboard.types';
import { getWidgetsByCategory } from '../widgetRegistry';

export default function AddWidgetModal({
  isOpen,
  onClose,
  onAddWidget,
  availableWidgets,
}: AddWidgetModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  console.log('🎨 [AddWidgetModal] Modal state:', { 
    isOpen, 
    availableWidgets: availableWidgets.length,
    selectedCategory,
    searchQuery
  });

  // Фильтрация виджетов по категории и поисковому запросу
  const filteredWidgets = useMemo(() => {
    let widgets = availableWidgets;

    // Фильтрация по категории
    if (selectedCategory !== 'all') {
      widgets = widgets.filter(widget => widget.category === selectedCategory);
    }

    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      widgets = widgets.filter(widget => 
        widget.title.toLowerCase().includes(query) ||
        widget.description.toLowerCase().includes(query)
      );
    }

    console.log('🔍 [AddWidgetModal] Filtered widgets:', widgets.length);
    return widgets;
  }, [availableWidgets, selectedCategory, searchQuery]);

  const handleAddWidget = (widgetType: string) => {
    console.log('➕ [AddWidgetModal] Widget selected:', widgetType);
    console.log('➕ [AddWidgetModal] Calling onAddWidget callback');
    onAddWidget(widgetType);
    console.log('➕ [AddWidgetModal] Calling onClose callback');
    onClose();
    console.log('➕ [AddWidgetModal] Add widget process completed');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('❌ [AddWidgetModal] Backdrop clicked, closing modal');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Заголовок модального окна */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Добавить виджет
          </h2>
          <button
            onClick={() => {
              console.log('❌ [AddWidgetModal] Close button clicked');
              onClose();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Поиск и фильтры */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {/* Поисковая строка */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск виджетов..."
              value={searchQuery}
              onChange={(e) => {
                console.log('🔍 [AddWidgetModal] Search query changed:', e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Категории */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                console.log('📂 [AddWidgetModal] Category changed: all');
                setSelectedCategory('all');
              }}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Все
            </button>
            {WIDGET_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  console.log('📂 [AddWidgetModal] Category changed:', category.id);
                  setSelectedCategory(category.id);
                }}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Список виджетов */}
        <div className="p-6 overflow-y-auto max-h-96">
          {filteredWidgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery.trim() ? 'Виджеты не найдены' : 'Нет доступных виджетов'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWidgets.map(widget => (
                <div
                  key={widget.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors cursor-pointer"
                  onClick={() => {
                    console.log('🎯 [AddWidgetModal] Widget clicked:', widget.id, widget.title);
                    handleAddWidget(widget.id);
                  }}
                >
                  {/* Иконка и заголовок */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`
                      p-2 rounded-lg
                      ${WIDGET_CATEGORIES.find(cat => cat.id === widget.category)?.color || 'bg-gray-500'}
                    `}>
                      <div className="w-5 h-5 text-white">
                        {/* Здесь будет иконка виджета */}
                        📊
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {widget.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {widget.description}
                      </p>
                    </div>
                  </div>

                  {/* Размер по умолчанию */}
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Размер: {widget.defaultSize.w}×{widget.defaultSize.h}
                  </div>

                  {/* Индикатор настраиваемости */}
                  {widget.configurable && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Настраиваемый
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Нижняя панель */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Найдено виджетов: {filteredWidgets.length}
          </p>
          <button
            onClick={() => {
              console.log('❌ [AddWidgetModal] Cancel button clicked');
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
} 