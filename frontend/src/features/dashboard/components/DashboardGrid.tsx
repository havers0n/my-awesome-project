import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { DashboardLayoutItem, DashboardWidget } from '../types/dashboard.types';
import { getWidgetById } from '../widgetRegistry';
import WidgetWrapper from './WidgetWrapper';

interface DashboardGridProps {
  layout: DashboardLayoutItem[];
  widgets: Record<string, DashboardWidget>;
  isEditMode: boolean;
  onLayoutChange: (layout: DashboardLayoutItem[]) => void;
  onRemoveWidget: (widgetId: string) => void;
  onConfigWidget?: (widgetId: string) => void;
}

// Компонент для отдельного элемента сетки
interface SortableWidgetProps {
  layoutItem: DashboardLayoutItem;
  widget: DashboardWidget;
  isEditMode: boolean;
  onRemove: (widgetId: string) => void;
  onConfig?: (widgetId: string) => void;
}

function SortableWidget({
  layoutItem,
  widget,
  isEditMode,
  onRemove,
  onConfig,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layoutItem.i }); // Изменено с id на i

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const widgetDefinition = getWidgetById(widget.widgetType);
  if (!widgetDefinition) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">
          Виджет "{widget.widgetType}" не найден
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${getGridItemClasses(layoutItem)}
        ${isDragging ? 'z-50' : ''}
      `}
      {...attributes}
      {...(isEditMode ? listeners : {})}
    >
      <WidgetWrapper
        widget={widget}
        widgetDefinition={widgetDefinition}
        isEditMode={isEditMode}
        onRemove={onRemove}
        onConfig={onConfig}
        className="h-full"
      />
    </div>
  );
}

export default function DashboardGrid({
  layout,
  widgets,
  isEditMode,
  onLayoutChange,
  onRemoveWidget,
  onConfigWidget,
}: DashboardGridProps) {
  console.log('🎨 [DashboardGrid] Component rendered');
  console.log('📋 [DashboardGrid] Props:', { 
    layoutCount: layout.length, 
    widgetsCount: Object.keys(widgets).length, 
    isEditMode 
  });
  console.log('📊 [DashboardGrid] Layout items:', layout);
  console.log('🔧 [DashboardGrid] Widgets:', widgets);
  
  const [activeId, setActiveId] = useState<string | null>(null);

  // Настройка сенсоров для drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Фильтрация только видимых виджетов
  const visibleLayout = useMemo(() => {
    console.log('🔍 [DashboardGrid] Filtering visible widgets...');
    const filtered = layout.filter(item => {
      const widget = widgets[item.i]; // Используем item.i
      const isVisible = widget && widget.visible;
      console.log(`🎯 [DashboardGrid] Widget ${item.i}: exists=${!!widget}, visible=${widget?.visible}, included=${isVisible}`);
      return isVisible;
    });
    console.log('✅ [DashboardGrid] Visible layout result:', filtered);
    return filtered;
  }, [layout, widgets]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = visibleLayout.findIndex(item => item.i === active.id); // Изменено с id на i
      const newIndex = visibleLayout.findIndex(item => item.i === over?.id); // Изменено с id на i
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newLayout = arrayMove(visibleLayout, oldIndex, newIndex);
        onLayoutChange(newLayout);
      }
    }
    
    setActiveId(null);
  };

  const activeWidget = activeId ? widgets[activeId] : null;
  const activeLayoutItem = activeId ? visibleLayout.find(item => item.i === activeId) : null; // Изменено с id на i

  if (visibleLayout.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Дашборд пуст
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {isEditMode ? 'Добавьте виджеты для начала работы' : 'Перейдите в режим редактирования для добавления виджетов'}
          </p>
          {/* Отладочная информация */}
          <div className="mt-4 text-xs text-gray-400">
            <p>Layout items: {layout.length}</p>
            <p>Widgets: {Object.keys(widgets).length}</p>
            <p>Visible widgets: {visibleLayout.length}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={visibleLayout.map(item => item.i)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-12 gap-4 p-4">
          {visibleLayout.map(layoutItem => {
            const widget = widgets[layoutItem.i]; // Используем item.i
            if (!widget) {
              return (
                <div key={layoutItem.i} className="col-span-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">
                    ❌ Виджет не найден: {layoutItem.i}
                  </p>
                </div>
              );
            }

            return (
              <SortableWidget
                key={layoutItem.i} // Изменено с id на i
                layoutItem={layoutItem}
                widget={widget}
                isEditMode={isEditMode}
                onRemove={onRemoveWidget}
                onConfig={onConfigWidget}
              />
            );
          })}
        </div>
      </SortableContext>

      {/* Overlay для перетаскиваемого элемента */}
      <DragOverlay>
        {activeId && activeWidget && activeLayoutItem ? (
          <div className={getGridItemClasses(activeLayoutItem)}>
            <div className="h-full bg-white dark:bg-gray-800 border-2 border-brand-400 rounded-lg shadow-lg opacity-90">
              <div className="p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getWidgetById(activeWidget.widgetType)?.title || 'Виджет'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Функция для генерации CSS классов для элементов сетки
function getGridItemClasses(layoutItem: DashboardLayoutItem): string {
  // Используем стандартные классы Tailwind CSS
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  };

  const rowSpanClasses = {
    1: '',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
    5: 'row-span-5',
    6: 'row-span-6',
  };

  const colSpan = colSpanClasses[Math.min(layoutItem.w, 12) as keyof typeof colSpanClasses] || 'col-span-12';
  const rowSpan = rowSpanClasses[Math.min(layoutItem.h, 6) as keyof typeof rowSpanClasses] || '';
  
  return `${colSpan} ${rowSpan}`.trim();
} 