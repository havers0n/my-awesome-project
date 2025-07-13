import { Variants, Transition } from 'framer-motion';

// Общие переходы
export const transitions: Record<string, Transition> = {
  default: {
    duration: 0.3,
    ease: 'easeInOut',
  },
  fast: {
    duration: 0.15,
    ease: 'easeOut',
  },
  slow: {
    duration: 0.5,
    ease: 'easeInOut',
  },
  bounce: {
    type: 'spring',
    damping: 20,
    stiffness: 300,
  },
  smooth: {
    type: 'spring',
    damping: 25,
    stiffness: 120,
  },
};

// Варианты анимаций для виджетов
export const widgetAnimations: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: transitions.fast,
  },
  hover: {
    scale: 1.02,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

// Варианты анимаций для модальных окон
export const modalAnimations: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: transitions.fast,
  },
};

// Варианты анимаций для оверлея
export const overlayAnimations: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// Варианты анимаций для sidebar
export const sidebarAnimations: Variants = {
  open: {
    x: 0,
    transition: transitions.smooth,
  },
  closed: {
    x: '-100%',
    transition: transitions.smooth,
  },
};

// Варианты анимаций для dropdown
export const dropdownAnimations: Variants = {
  initial: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// Варианты анимаций для списков
export const listAnimations: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const listItemAnimations: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transitions.fast,
  },
};

// Варианты анимаций для drag & drop
export const dragAnimations: Variants = {
  drag: {
    scale: 1.05,
    rotate: 2,
    zIndex: 1000,
    transition: transitions.fast,
  },
  dragEnd: {
    scale: 1,
    rotate: 0,
    zIndex: 1,
    transition: transitions.bounce,
  },
};

// Расширенные анимации для улучшенного UX drag & drop
export const enhancedDragUXAnimations: Variants = {
  idle: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: transitions.default,
  },
  hovering: {
    scale: 1.02,
    transition: transitions.fast,
  },
  dragging: {
    scale: 1.05,
    rotate: 2,
    opacity: 0.8,
    zIndex: 9999,
    transition: transitions.fast,
    filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))',
  },
  preview: {
    scale: 0.95,
    rotate: 2,
    opacity: 0.9,
    transition: transitions.smooth,
  },
  dropZoneIdle: {
    scale: 1,
    opacity: 1,
    transition: transitions.default,
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
    transition: transitions.bounce,
  },
  dropZoneInvalid: {
    scale: 0.98,
    transition: transitions.fast,
  },
  success: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.5, 1],
      ease: 'easeInOut',
    },
  },
  error: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

// Варианты анимаций для загрузки
export const loadingAnimations: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

// Варианты анимаций для появления/исчезновения
export const fadeAnimations: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// Варианты анимаций для слайдов
export const slideAnimations: Variants = {
  slideInLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: transitions.smooth },
    exit: { x: '-100%', opacity: 0, transition: transitions.fast },
  },
  slideInRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: transitions.smooth },
    exit: { x: '100%', opacity: 0, transition: transitions.fast },
  },
  slideInUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1, transition: transitions.smooth },
    exit: { y: '100%', opacity: 0, transition: transitions.fast },
  },
  slideInDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1, transition: transitions.smooth },
    exit: { y: '-100%', opacity: 0, transition: transitions.fast },
  },
};
