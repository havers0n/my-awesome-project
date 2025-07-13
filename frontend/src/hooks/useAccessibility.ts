import { useState, useRef, useCallback, useEffect } from 'react';

export interface AccessibilityState {
  announcements: string[];
  focusedElement: string | null;
  isKeyboardMode: boolean;
  currentFocusIndex: number;
  draggedElement: string | null;
  dropTarget: string | null;
}

export interface AccessibilityOptions {
  enableAnnouncements?: boolean;
  enableKeyboardNavigation?: boolean;
  enableFocusManagement?: boolean;
  announcementDelay?: number;
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const {
    enableAnnouncements = true,
    enableKeyboardNavigation = true,
    enableFocusManagement = true,
    announcementDelay = 100,
  } = options;

  const [state, setState] = useState<AccessibilityState>({
    announcements: [],
    focusedElement: null,
    isKeyboardMode: false,
    currentFocusIndex: -1,
    draggedElement: null,
    dropTarget: null,
  });

  const announcementTimeoutRef = useRef<number | null>(null);
  const focusableElements = useRef<HTMLElement[]>([]);
  const lastMouseMovement = useRef<number>(0);

  // Функция для создания объявлений для screen readers
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!enableAnnouncements) return;

      // Очищаем предыдущий таймаут
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }

      announcementTimeoutRef.current = window.setTimeout(() => {
        setState(prev => ({
          ...prev,
          announcements: [...prev.announcements.slice(-4), message], // Ограничиваем 5 сообщениями
        }));
      }, announcementDelay);
    },
    [enableAnnouncements, announcementDelay]
  );

  // Функция для очистки объявлений
  const clearAnnouncements = useCallback(() => {
    setState(prev => ({
      ...prev,
      announcements: [],
    }));
  }, []);

  // Обновление списка фокусируемых элементов
  const updateFocusableElements = useCallback((container: HTMLElement | null) => {
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="widget"]'
      )
    ).filter(el => !el.hasAttribute('disabled') && !el.hasAttribute('aria-hidden'));

    focusableElements.current = elements;
  }, []);

  // Навигация по клавиатуре
  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent, container: HTMLElement | null) => {
      if (!enableKeyboardNavigation || !container) return;

      const { key, shiftKey, ctrlKey, altKey } = event;
      const currentIndex = state.currentFocusIndex;
      const elements = focusableElements.current;

      switch (key) {
        case 'Tab':
          setState(prev => ({ ...prev, isKeyboardMode: true }));
          break;

        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          if (state.isKeyboardMode) {
            event.preventDefault();

            let newIndex = currentIndex;
            const totalElements = elements.length;

            if (key === 'ArrowUp' || key === 'ArrowLeft') {
              newIndex = currentIndex <= 0 ? totalElements - 1 : currentIndex - 1;
            } else if (key === 'ArrowDown' || key === 'ArrowRight') {
              newIndex = currentIndex >= totalElements - 1 ? 0 : currentIndex + 1;
            }

            if (elements[newIndex]) {
              elements[newIndex].focus();
              setState(prev => ({ ...prev, currentFocusIndex: newIndex }));
              announce(`Фокус на элементе ${newIndex + 1} из ${totalElements}`);
            }
          }
          break;

        case 'Enter':
        case ' ':
          if (state.isKeyboardMode) {
            const focusedElement = elements[currentIndex];
            if (focusedElement) {
              if (state.draggedElement) {
                // Завершение drag & drop
                handleKeyboardDrop(focusedElement);
              } else {
                // Начало drag & drop
                handleKeyboardGrab(focusedElement);
              }
            }
          }
          break;

        case 'Escape':
          if (state.draggedElement) {
            handleKeyboardCancel();
          }
          break;

        case 'Home':
          if (state.isKeyboardMode) {
            event.preventDefault();
            if (elements[0]) {
              elements[0].focus();
              setState(prev => ({ ...prev, currentFocusIndex: 0 }));
              announce(`Фокус на первом элементе`);
            }
          }
          break;

        case 'End':
          if (state.isKeyboardMode) {
            event.preventDefault();
            const lastIndex = elements.length - 1;
            if (elements[lastIndex]) {
              elements[lastIndex].focus();
              setState(prev => ({ ...prev, currentFocusIndex: lastIndex }));
              announce(`Фокус на последнем элементе`);
            }
          }
          break;
      }
    },
    [
      enableKeyboardNavigation,
      state.currentFocusIndex,
      state.isKeyboardMode,
      state.draggedElement,
      announce,
    ]
  );

  // Keyboard drag & drop handlers
  const handleKeyboardGrab = useCallback(
    (element: HTMLElement) => {
      const elementId = element.id || element.getAttribute('data-widget-id');
      if (!elementId) return;

      setState(prev => ({ ...prev, draggedElement: elementId }));
      element.setAttribute('aria-grabbed', 'true');
      announce(
        `Элемент ${elementId} захвачен. Используйте стрелки для перемещения, пробел для размещения, Escape для отмены.`,
        'assertive'
      );
    },
    [announce]
  );

  const handleKeyboardDrop = useCallback(
    (targetElement: HTMLElement) => {
      const targetId = targetElement.id || targetElement.getAttribute('data-widget-id');
      if (!targetId || !state.draggedElement) return;

      setState(prev => ({ ...prev, dropTarget: targetId }));

      // Очищаем drag state
      const draggedElement = document.getElementById(state.draggedElement);
      if (draggedElement) {
        draggedElement.setAttribute('aria-grabbed', 'false');
      }

      announce(`Элемент ${state.draggedElement} размещен в позиции ${targetId}`, 'assertive');

      setState(prev => ({
        ...prev,
        draggedElement: null,
        dropTarget: null,
      }));
    },
    [state.draggedElement, announce]
  );

  const handleKeyboardCancel = useCallback(() => {
    if (state.draggedElement) {
      const draggedElement = document.getElementById(state.draggedElement);
      if (draggedElement) {
        draggedElement.setAttribute('aria-grabbed', 'false');
      }

      announce(`Перемещение отменено`, 'assertive');
      setState(prev => ({
        ...prev,
        draggedElement: null,
        dropTarget: null,
      }));
    }
  }, [state.draggedElement, announce]);

  // Обработчики mouse events для определения режима навигации
  const handleMouseMovement = useCallback(() => {
    const now = Date.now();
    lastMouseMovement.current = now;

    // Переключаемся в mouse mode если была активность мыши
    if (state.isKeyboardMode) {
      setState(prev => ({ ...prev, isKeyboardMode: false }));
    }
  }, [state.isKeyboardMode]);

  // Focus management
  const manageFocus = useCallback(
    (element: HTMLElement | null) => {
      if (!enableFocusManagement || !element) return;

      const elementId = element.id || element.getAttribute('data-widget-id');
      setState(prev => ({ ...prev, focusedElement: elementId }));

      // Обновляем current focus index
      const elements = focusableElements.current;
      const index = elements.indexOf(element);
      if (index !== -1) {
        setState(prev => ({ ...prev, currentFocusIndex: index }));
      }
    },
    [enableFocusManagement]
  );

  // Drag & drop accessibility handlers
  const handleDragStart = useCallback(
    (elementId: string) => {
      setState(prev => ({ ...prev, draggedElement: elementId }));

      const element = document.getElementById(elementId);
      if (element) {
        element.setAttribute('aria-grabbed', 'true');
      }

      announce(`Элемент ${elementId} начал перемещение`, 'assertive');
    },
    [announce]
  );

  const handleDragEnd = useCallback(() => {
    if (state.draggedElement) {
      const element = document.getElementById(state.draggedElement);
      if (element) {
        element.setAttribute('aria-grabbed', 'false');
      }

      announce(`Перемещение завершено`, 'assertive');
      setState(prev => ({
        ...prev,
        draggedElement: null,
        dropTarget: null,
      }));
    }
  }, [state.draggedElement, announce]);

  const handleDragOver = useCallback(
    (targetId: string) => {
      setState(prev => ({ ...prev, dropTarget: targetId }));

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.setAttribute('aria-dropeffect', 'move');
      }

      announce(`Перемещение над элементом ${targetId}`, 'polite');
    },
    [announce]
  );

  const handleDrop = useCallback(
    (targetId: string) => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.setAttribute('aria-dropeffect', 'none');
      }

      announce(`Элемент ${state.draggedElement} размещен в позиции ${targetId}`, 'assertive');

      setState(prev => ({
        ...prev,
        draggedElement: null,
        dropTarget: null,
      }));
    },
    [state.draggedElement, announce]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    announce,
    clearAnnouncements,
    updateFocusableElements,
    handleKeyNavigation,
    handleMouseMovement,
    manageFocus,
    dragDropHandlers: {
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDrop,
    },
    keyboardHandlers: {
      handleKeyboardGrab,
      handleKeyboardDrop,
      handleKeyboardCancel,
    },
  };
}

// Утилитарные функции для ARIA атрибутов
export const createAccessibilityProps = (role: string, label: string, description?: string) => {
  const props: Record<string, string | boolean> = {
    role,
    'aria-label': label,
    'aria-grabbed': 'false',
    'aria-dropeffect': 'none',
    tabIndex: 0,
  };

  if (description) {
    props['aria-describedby'] = `${role}-description`;
  }

  return props;
};

export const createScreenReaderMessage = (action: string, element: string, context?: string) => {
  const baseMessage = `${action}: ${element}`;
  return context ? `${baseMessage} (${context})` : baseMessage;
};
