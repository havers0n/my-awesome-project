import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Video, Music, Folder, Settings } from 'lucide-react';
import EnhancedDropZone from '../common/EnhancedDropZone';
import DragPreview, {
  WidgetDragPreview,
  FileDragPreview,
  ListItemDragPreview,
} from '../common/DragPreview';
import { useDragDropUX } from '../../hooks/useDragDropUX';
import { DragDropUXProvider } from '../../hooks/useDragDropUX';

// Демо данные
const demoFiles = [
  { id: '1', name: 'document.pdf', type: 'pdf', size: '2.5 MB', icon: FileText },
  { id: '2', name: 'image.jpg', type: 'jpg', size: '1.2 MB', icon: Image },
  { id: '3', name: 'video.mp4', type: 'mp4', size: '15.3 MB', icon: Video },
  { id: '4', name: 'audio.mp3', type: 'mp3', size: '3.8 MB', icon: Music },
];

const demoWidgets = [
  { id: '1', type: 'chart', title: 'График продаж', description: 'Отображает данные о продажах' },
  { id: '2', type: 'table', title: 'Таблица заказов', description: 'Список последних заказов' },
  { id: '3', type: 'metric', title: 'Метрики', description: 'Ключевые показатели' },
];

const demoListItems = [
  { id: '1', title: 'Задача 1', subtitle: 'Высокий приоритет', completed: false },
  { id: '2', title: 'Задача 2', subtitle: 'Средний приоритет', completed: true },
  { id: '3', title: 'Задача 3', subtitle: 'Низкий приоритет', completed: false },
];

// Компонент для демонстрации файлов
function FileDragDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  const { state, handlers } = useDragDropUX();

  const handleFileDrop = (droppedFiles: File[]) => {
    setFiles(prev => [...prev, ...droppedFiles]);
    console.log('Файлы добавлены:', droppedFiles);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Загрузка файлов</h3>
        <EnhancedDropZone
          onDrop={handleFileDrop}
          acceptedTypes={['image/*', 'application/pdf', 'text/*']}
          maxFileSize={10 * 1024 * 1024}
          maxFiles={5}
          title="Перетащите файлы сюда"
          subtitle="Поддерживаются: изображения, PDF, текстовые файлы"
        />
      </div>

      {files.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3">Загруженные файлы:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для демонстрации виджетов
function WidgetDragDemo() {
  const [widgets, setWidgets] = useState(demoWidgets);
  const [draggedWidget, setDraggedWidget] = useState<any>(null);
  const { state, handlers } = useDragDropUX();

  const handleWidgetDragStart = (widget: any) => {
    setDraggedWidget(widget);
    handlers.handleDragStart(widget);
  };

  const handleWidgetDragEnd = () => {
    setDraggedWidget(null);
    handlers.handleDragEnd();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Виджеты дашборда</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map(widget => (
            <motion.div
              key={widget.id}
              className="draggable bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
              draggable
              onDragStart={() => handleWidgetDragStart(widget)}
              onDragEnd={handleWidgetDragEnd}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{widget.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{widget.description}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Тип: {widget.type}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Drop zone для виджетов */}
      <div className="drop-zone p-8 text-center">
        <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Область для виджетов
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Перетащите виджеты сюда для добавления на дашборд
        </p>
      </div>

      {/* Drag preview для виджетов */}
      <WidgetDragPreview
        widgetType={draggedWidget?.type || ''}
        title={draggedWidget?.title || ''}
        isDragging={state.isDragging}
      />
    </div>
  );
}

// Компонент для демонстрации сортируемого списка
function SortableListDemo() {
  const [items, setItems] = useState(demoListItems);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const { state, handlers } = useDragDropUX();

  const handleItemDragStart = (item: any) => {
    setDraggedItem(item);
    handlers.handleDragStart(item);
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
    handlers.handleDragEnd();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Сортируемый список</h3>
        <div className="sortable-list">
          {items.map(item => (
            <motion.div
              key={item.id}
              className="sortable-item draggable"
              draggable
              onDragStart={() => handleItemDragStart(item)}
              onDragEnd={handleItemDragEnd}
              layout
            >
              <div className="flex items-center gap-3">
                <div className="drag-handle">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mb-1" />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mb-1" />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Drag preview для элементов списка */}
      <ListItemDragPreview
        title={draggedItem?.title || ''}
        subtitle={draggedItem?.subtitle || ''}
        isDragging={state.isDragging}
      />
    </div>
  );
}

// Основной компонент демонстрации
export default function DragDropUXDemo() {
  return (
    <DragDropUXProvider options={{ enableHapticFeedback: true }}>
      <div className="max-w-6xl mx-auto p-6 space-y-12">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Drag & Drop UX Демонстрация
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Улучшенные компоненты с визуальными индикаторами, анимациями и haptic feedback
          </p>
        </div>

        {/* Демонстрация файлов */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8"
        >
          <FileDragDemo />
        </motion.section>

        {/* Демонстрация виджетов */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8"
        >
          <WidgetDragDemo />
        </motion.section>

        {/* Демонстрация сортируемого списка */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8"
        >
          <SortableListDemo />
        </motion.section>

        {/* Информация о функциях */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Функции UX улучшений
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cursor States</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                grab → grabbing → not-allowed с плавными переходами
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Drop Zones</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Подсветка доступных областей при перетаскивании
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Preview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Полупрозрачный preview перетаскиваемого элемента
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Smooth Animations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Spring-анимации для естественного движения
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Haptic Feedback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Вибрация на мобильных устройствах при drag
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Accessibility</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Поддержка клавиатуры и screen readers
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </DragDropUXProvider>
  );
}
