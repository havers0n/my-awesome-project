import { Edit3, Eye, Plus, RotateCcw, Save } from 'lucide-react';

interface DashboardControlsProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onAddWidget: () => void;
  onResetLayout: () => void;
  onSaveLayout: () => void;
  hasUnsavedChanges?: boolean;
}

export default function DashboardControls({
  isEditMode,
  onToggleEditMode,
  onAddWidget,
  onResetLayout,
  onSaveLayout,
  hasUnsavedChanges = false,
}: DashboardControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Левая часть - заголовок */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Дашборд
        </h1>
        {hasUnsavedChanges && (
          <span className="px-2 py-1 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 rounded-full">
            Есть несохраненные изменения
          </span>
        )}
      </div>

      {/* Правая часть - кнопки управления */}
      <div className="flex items-center gap-2">
        {/* Кнопка переключения режима */}
        <button
          onClick={onToggleEditMode}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
            ${isEditMode 
              ? 'bg-brand-500 text-white hover:bg-brand-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }
          `}
        >
          {isEditMode ? (
            <>
              <Eye className="w-4 h-4" />
              Просмотр
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              Редактировать
            </>
          )}
        </button>

        {/* Кнопки для режима редактирования */}
        {isEditMode && (
          <>
            {/* Кнопка добавления виджета */}
            <button
              onClick={onAddWidget}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить виджет
            </button>

            {/* Кнопка сохранения */}
            <button
              onClick={onSaveLayout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>

            {/* Кнопка сброса */}
            <button
              onClick={onResetLayout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Сбросить макет к настройкам по умолчанию"
            >
              <RotateCcw className="w-4 h-4" />
              Сбросить
            </button>
          </>
        )}
      </div>
    </div>
  );
} 