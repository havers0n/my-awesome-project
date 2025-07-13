import { MouseSensor, TouchSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const useDndSensors = () => {
  const mouseSensor = useSensor(MouseSensor, {
    // Требуется перемещение мыши на 10px для активации
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    // Требуется удержание в течение 250ms для активации
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  return useSensors(mouseSensor, touchSensor, keyboardSensor);
};

export const dndCollisionDetection = {
  // Конфигурация для обнаружения столкновений
  strategy: 'closestCenter' as const,
};

export const dndModifiers = {
  // Модификаторы для ограничения перемещения
  restrictToVerticalAxis: true,
  restrictToHorizontalAxis: false,
  restrictToWindowEdges: true,
  restrictToFirstScrollableAncestor: true,
};

export const dndSnapToGrid = {
  // Настройки привязки к сетке
  enabled: false,
  size: 20,
};

export const dndAnimation = {
  // Настройки анимации
  duration: 200,
  easing: 'ease-out',
};

// Расширенная конфигурация для drag & drop UX
export const enhancedDragAnimations = {
  idle: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  dragging: {
    scale: 1.05,
    rotate: 2,
    opacity: 0.8,
    zIndex: 9999,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  preview: {
    scale: 0.95,
    rotate: 2,
    opacity: 0.9,
    transition: { type: 'spring', damping: 25, stiffness: 120 },
  },
  dropZoneActive: {
    scale: 1.02,
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
  dropZoneValid: {
    scale: 1.05,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
  dropZoneInvalid: {
    scale: 0.98,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

// Конфигурация для spring анимаций
export const springConfigs = {
  gentle: {
    type: 'spring',
    damping: 25,
    stiffness: 120,
  },
  bouncy: {
    type: 'spring',
    damping: 15,
    stiffness: 300,
  },
  stiff: {
    type: 'spring',
    damping: 30,
    stiffness: 400,
  },
} as const;

// Конфигурация для haptic feedback
export const hapticPatterns = {
  dragStart: [10],
  dragEnd: [50],
  dropSuccess: [100],
  dropError: [50, 50, 50],
} as const;

// Конфигурация для звуков
export const soundFrequencies = {
  dragStart: 800,
  dragEnd: 600,
  dropSuccess: 1000,
  dropError: 400,
} as const;

// Классы для cursor states
export const cursorClasses = {
  grab: 'cursor-grab',
  grabbing: 'cursor-grabbing',
  notAllowed: 'cursor-not-allowed',
} as const;

// Классы для drag states
export const dragStateClasses = {
  idle: 'draggable--idle',
  dragging: 'draggable--dragging',
  notAllowed: 'draggable--not-allowed',
} as const;

// Классы для drop zones
export const dropZoneClasses = {
  base: 'drop-zone',
  active: 'drop-zone--active',
  valid: 'drop-zone--valid',
  invalid: 'drop-zone--invalid',
} as const;
