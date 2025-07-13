import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilityAnnouncementsProps {
  announcements: string[];
  priority?: 'polite' | 'assertive';
  className?: string;
  showVisualIndicator?: boolean;
}

export default function AccessibilityAnnouncements({
  announcements,
  priority = 'assertive',
  className = '',
  showVisualIndicator = false,
}: AccessibilityAnnouncementsProps) {
  const latestAnnouncement = announcements[announcements.length - 1];

  return (
    <>
      {/* Screen reader только объявления */}
      <div
        role="region"
        aria-live={priority}
        aria-atomic="true"
        aria-label="Объявления системы"
        className="sr-only"
      >
        {latestAnnouncement}
      </div>

      {/* Визуальный индикатор (опционально) */}
      {showVisualIndicator && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
          <AnimatePresence mode="wait">
            {latestAnnouncement && (
              <motion.div
                key={latestAnnouncement}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-md text-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {latestAnnouncement}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

// Компонент для отображения инструкций по использованию
export function AccessibilityInstructions({
  isEditMode,
  className = '',
}: {
  isEditMode: boolean;
  className?: string;
}) {
  return (
    <div
      id="grid-instructions"
      className={`sr-only ${className}`}
      aria-label="Инструкции по использованию"
    >
      {isEditMode ? (
        <>
          Режим редактирования активен. Используйте Tab для навигации между виджетами. Нажмите
          пробел для захвата виджета. Используйте стрелки для перемещения. Нажмите пробел для
          размещения виджета. Нажмите Escape для отмены. Нажмите Delete для удаления виджета.
        </>
      ) : (
        <>
          Режим просмотра. Используйте Tab для навигации между элементами управления. Нажмите пробел
          или Enter для активации кнопок.
        </>
      )}
    </div>
  );
}

// Компонент для отображения статуса drag & drop
export function DragDropStatus({
  isDragging,
  draggedElement,
  dropTarget,
  className = '',
}: {
  isDragging: boolean;
  draggedElement: string | null;
  dropTarget: string | null;
  className?: string;
}) {
  let statusMessage = '';

  if (isDragging && draggedElement) {
    if (dropTarget) {
      statusMessage = `Перемещение виджета ${draggedElement} над позицией ${dropTarget}`;
    } else {
      statusMessage = `Перемещение виджета ${draggedElement}`;
    }
  }

  return (
    <div
      id="drag-drop-status"
      className={`sr-only ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {statusMessage}
    </div>
  );
}

// Компонент для отображения контекстной помощи
export function AccessibilityHelp({
  isVisible,
  onClose,
  className = '',
}: {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}) {
  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="accessibility-help-title"
      aria-describedby="accessibility-help-content"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="accessibility-help-title" className="text-xl font-semibold mb-4">
          Справка по доступности
        </h2>

        <div id="accessibility-help-content" className="space-y-4 text-sm">
          <section>
            <h3 className="font-medium mb-2">Навигация с клавиатуры:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Tab</kbd> /{' '}
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Shift+Tab</kbd> -
                Навигация между элементами
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑↓←→</kbd> -
                Перемещение фокуса по виджетам
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Home</kbd> /{' '}
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">End</kbd> - Первый /
                последний элемент
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-medium mb-2">Drag & Drop:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Пробел</kbd> -
                Захватить виджет
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑↓←→</kbd> -
                Перемещение виджета
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Пробел</kbd> -
                Разместить виджет
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Escape</kbd> -
                Отменить перемещение
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-medium mb-2">Управление виджетами:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Delete</kbd> -
                Удалить виджет
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd> -
                Активировать кнопку
              </li>
              <li>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Shift+Enter</kbd> -
                Настроить виджет
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </div>
  );
}
