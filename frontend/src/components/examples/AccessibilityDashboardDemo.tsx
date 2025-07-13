import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Volume2, VolumeX, Keyboard, Mouse, Settings, Info } from 'lucide-react';

import DashboardGrid from '../../features/dashboard/components/DashboardGrid';
import {
  DashboardLayoutItem,
  DashboardWidget,
} from '../../features/dashboard/types/dashboard.types';
import { useAccessibility } from '../../hooks/useAccessibility';
import AccessibilityAnnouncements, {
  AccessibilityHelp,
} from '../common/AccessibilityAnnouncements';

// Демонстрационные данные для виджетов
const createDemoWidget = (id: string, title: string, type: string): DashboardWidget => ({
  id,
  widgetType: type,
  config: { title },
  visible: true,
  width: 300,
  height: 200,
});

const createDemoLayout = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number
): DashboardLayoutItem => ({
  i: id,
  x,
  y,
  w,
  h,
  static: false,
  minW: 2,
  minH: 2,
  maxW: 12,
  maxH: 6,
});

const DEMO_WIDGETS: Record<string, DashboardWidget> = {
  'sales-chart': createDemoWidget('sales-chart', 'График продаж', 'sales-chart'),
  'user-stats': createDemoWidget('user-stats', 'Статистика пользователей', 'user-stats'),
  'revenue-card': createDemoWidget('revenue-card', 'Карточка выручки', 'revenue-card'),
  'inventory-table': createDemoWidget('inventory-table', 'Таблица инвентаря', 'inventory-table'),
  'weather-widget': createDemoWidget('weather-widget', 'Виджет погоды', 'weather-widget'),
  'task-list': createDemoWidget('task-list', 'Список задач', 'task-list'),
};

const DEMO_LAYOUT: DashboardLayoutItem[] = [
  createDemoLayout('sales-chart', 0, 0, 6, 4),
  createDemoLayout('user-stats', 6, 0, 6, 4),
  createDemoLayout('revenue-card', 0, 4, 4, 3),
  createDemoLayout('inventory-table', 4, 4, 8, 3),
  createDemoLayout('weather-widget', 0, 7, 3, 3),
  createDemoLayout('task-list', 3, 7, 9, 3),
];

interface AccessibilityDemoProps {
  showDemo?: boolean;
  onClose?: () => void;
}

export default function AccessibilityDashboardDemo({
  showDemo = false,
  onClose,
}: AccessibilityDemoProps) {
  const [layout, setLayout] = useState<DashboardLayoutItem[]>(DEMO_LAYOUT);
  const [widgets, setWidgets] = useState<Record<string, DashboardWidget>>(DEMO_WIDGETS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAccessibilityHelp, setShowAccessibilityHelp] = useState(false);
  const [visualIndicators, setVisualIndicators] = useState(true);
  const [audioAnnouncements, setAudioAnnouncements] = useState(true);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  // Инициализация accessibility хука
  const accessibility = useAccessibility({
    enableAnnouncements: audioAnnouncements,
    enableKeyboardNavigation: true,
    enableFocusManagement: true,
    announcementDelay: 100,
  });

  // Демонстрационные сценарии
  const demos = {
    'keyboard-navigation': {
      title: 'Навигация с клавиатуры',
      description: 'Используйте Tab для навигации между виджетами',
      action: () => {
        setKeyboardMode(true);
        accessibility.announce(
          'Режим клавиатурной навигации активирован. Используйте Tab для навигации.',
          'assertive'
        );
      },
    },
    'drag-drop': {
      title: 'Drag & Drop с клавиатуры',
      description: 'Нажмите пробел для захвата виджета, стрелки для перемещения',
      action: () => {
        setIsEditMode(true);
        accessibility.announce(
          'Режим редактирования активирован. Нажмите пробел для захвата виджета.',
          'assertive'
        );
      },
    },
    'screen-reader': {
      title: 'Поддержка Screen Reader',
      description: 'Все изменения объявляются для пользователей screen reader',
      action: () => {
        accessibility.announce(
          'Демонстрация поддержки screen reader. Все действия будут объявлены.',
          'assertive'
        );
      },
    },
    'focus-management': {
      title: 'Управление фокусом',
      description: 'Фокус правильно передается при изменениях в интерфейсе',
      action: () => {
        accessibility.announce(
          'Демонстрация управления фокусом. Фокус будет автоматически управляться.',
          'assertive'
        );
      },
    },
  };

  // Обработчики событий
  const handleLayoutChange = (newLayout: DashboardLayoutItem[]) => {
    setLayout(newLayout);
    accessibility.announce(
      `Макет дашборда обновлен. Размещено ${newLayout.length} виджетов.`,
      'polite'
    );
  };

  const handleRemoveWidget = (widgetId: string) => {
    const newWidgets = { ...widgets };
    delete newWidgets[widgetId];
    setWidgets(newWidgets);

    const newLayout = layout.filter(item => item.i !== widgetId);
    setLayout(newLayout);

    accessibility.announce(`Виджет ${widgetId} удален из дашборда.`, 'assertive');
  };

  const handleConfigWidget = (widgetId: string) => {
    accessibility.announce(`Открыта настройка виджета ${widgetId}.`, 'assertive');
  };

  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    accessibility.announce(
      newEditMode ? 'Режим редактирования активирован' : 'Режим редактирования деактивирован',
      'assertive'
    );
  };

  const runDemo = (demoKey: string) => {
    setCurrentDemo(demoKey);
    demos[demoKey as keyof typeof demos]?.action();

    // Автоматически сбрасываем демо через 5 секунд
    setTimeout(() => {
      setCurrentDemo(null);
    }, 5000);
  };

  // Автоматическое определение режима навигации
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardMode(true);
      }
    };

    const handleMouseMove = () => {
      setKeyboardMode(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!showDemo) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Демонстрация Accessibility</h1>
                <p className="text-blue-100">Полная поддержка доступности для dashboard grid</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 rounded-md p-2"
                aria-label="Закрыть демонстрацию"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4">
              {/* Mode Toggle */}
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isEditMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                <Settings className="w-4 h-4" />
                {isEditMode ? 'Режим просмотра' : 'Режим редактирования'}
              </button>

              {/* Visual Indicators Toggle */}
              <button
                onClick={() => setVisualIndicators(!visualIndicators)}
                className="px-4 py-2 rounded-md flex items-center gap-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {visualIndicators ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Визуальные индикаторы
              </button>

              {/* Audio Announcements Toggle */}
              <button
                onClick={() => setAudioAnnouncements(!audioAnnouncements)}
                className="px-4 py-2 rounded-md flex items-center gap-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {audioAnnouncements ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                Аудио объявления
              </button>

              {/* Navigation Mode Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                {keyboardMode ? <Keyboard className="w-4 h-4" /> : <Mouse className="w-4 h-4" />}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {keyboardMode ? 'Клавиатура' : 'Мышь'}
                </span>
              </div>

              {/* Help Button */}
              <button
                onClick={() => setShowAccessibilityHelp(true)}
                className="px-4 py-2 rounded-md flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Info className="w-4 h-4" />
                Справка
              </button>
            </div>
          </div>

          {/* Demo Scenarios */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                Демонстрации:
              </span>
              {Object.entries(demos).map(([key, demo]) => (
                <button
                  key={key}
                  onClick={() => runDemo(key)}
                  className={`px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    currentDemo === key
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                  title={demo.description}
                >
                  {demo.title}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className={`h-full ${keyboardMode ? 'keyboard-mode' : ''}`}>
              <DashboardGrid
                layout={layout}
                widgets={widgets}
                isEditMode={isEditMode}
                onLayoutChange={handleLayoutChange}
                onRemoveWidget={handleRemoveWidget}
                onConfigWidget={handleConfigWidget}
                useResponsiveGrid={false}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-gray-100 dark:bg-gray-800 p-2 flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">
                  Виджетов: {Object.keys(widgets).length}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Режим: {isEditMode ? 'Редактирование' : 'Просмотр'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Навигация: {keyboardMode ? 'Клавиатура' : 'Мышь'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${audioAnnouncements ? 'bg-green-400' : 'bg-gray-400'}`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {audioAnnouncements ? 'Объявления включены' : 'Объявления выключены'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Announcements */}
        <AccessibilityAnnouncements
          announcements={accessibility.state.announcements}
          priority="assertive"
          showVisualIndicator={visualIndicators}
        />

        {/* Accessibility Help Dialog */}
        {showAccessibilityHelp && (
          <AccessibilityHelp
            isVisible={showAccessibilityHelp}
            onClose={() => setShowAccessibilityHelp(false)}
          />
        )}
      </div>
    </div>
  );
}

// Компонент для быстрого запуска демонстрации
export function AccessibilityDemoLauncher() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDemo(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-40"
        title="Запустить демонстрацию accessibility"
        aria-label="Запустить демонстрацию accessibility"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <AccessibilityDashboardDemo showDemo={showDemo} onClose={() => setShowDemo(false)} />
    </>
  );
}
