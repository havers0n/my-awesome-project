/**
 * Design Tokens - системные значения для дизайна
 *
 * Используется для создания консистентного дизайна во всем приложении.
 * Включает цвета, типографику, интервалы, тени и другие системные значения.
 */

// ============================================================================
// COLORS - Цветовая палитра
// ============================================================================

// Основные цвета бренда
export const colors = {
  // Основные цвета бренда
  brand: {
    25: '#f2f7ff',
    50: '#ecf3ff',
    100: '#dde9ff',
    200: '#c2d6ff',
    300: '#9cb9ff',
    400: '#7592ff',
    500: '#465fff', // Основной цвет бренда
    600: '#3641f5',
    700: '#2a31d8',
    800: '#252dae',
    900: '#262e89',
    950: '#161950',
  },

  // Нейтральные цвета (серая палитра)
  neutral: {
    25: '#fcfcfd',
    50: '#f9fafb',
    100: '#f2f4f7',
    200: '#e4e7ec',
    300: '#d0d5dd',
    400: '#98a2b3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1d2939',
    900: '#101828',
    950: '#0c111d',
  },

  // Семантические цвета
  semantic: {
    success: {
      25: '#f6fef9',
      50: '#ecfdf3',
      100: '#d1fadf',
      200: '#a6f4c5',
      300: '#6ce9a6',
      400: '#32d583',
      500: '#12b76a',
      600: '#039855',
      700: '#027a48',
      800: '#05603a',
      900: '#054f31',
      950: '#053321',
    },
    warning: {
      25: '#fffcf5',
      50: '#fffaeb',
      100: '#fef0c7',
      200: '#fedf89',
      300: '#fec84b',
      400: '#fdb022',
      500: '#f79009',
      600: '#dc6803',
      700: '#b54708',
      800: '#93370d',
      900: '#7a2e0e',
      950: '#4e1d09',
    },
    error: {
      25: '#fffbfa',
      50: '#fef3f2',
      100: '#fee4e2',
      200: '#fecdca',
      300: '#fda29b',
      400: '#f97066',
      500: '#f04438',
      600: '#d92d20',
      700: '#b42318',
      800: '#912018',
      900: '#7a271a',
      950: '#55160c',
    },
    info: {
      25: '#f5fbff',
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#b9e6fe',
      300: '#7cd4fd',
      400: '#36bffa',
      500: '#0ba5ec',
      600: '#0086c9',
      700: '#026aa2',
      800: '#065986',
      900: '#0b4a6f',
      950: '#062c41',
    },
  },

  // Специальные цвета
  special: {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    current: 'currentColor',
  },
};

// ============================================================================
// SPACING - Интервалы (базовая сетка 4px)
// ============================================================================

export const spacing = {
  // Базовые интервалы на основе 4px сетки
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
};

// ============================================================================
// TYPOGRAPHY - Типографика
// ============================================================================

export const typography = {
  // Семейства шрифтов
  fontFamily: {
    sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'monospace'],
    display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
  },

  // Размеры шрифтов с line-height
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }], // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
  },

  // Веса шрифтов
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Высота строки
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Интервалы между буквами
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============================================================================
// BREAKPOINTS - Точки останова
// ============================================================================

export const breakpoints = {
  mobile: '375px', // Мобильные устройства
  tablet: '768px', // Планшеты
  desktop: '1024px', // Настольные компьютеры
  wide: '1280px', // Широкие экраны
  // Дополнительные breakpoints
  '2xsm': '375px',
  xsm: '425px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '2000px',
};

// ============================================================================
// SHADOWS - Тени
// ============================================================================

export const shadows = {
  xs: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
  sm: '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
  md: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
  lg: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
  xl: '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
  '2xl': '0px 25px 50px -12px rgba(16, 24, 40, 0.25)',
  inner: 'inset 0px 2px 4px 0px rgba(16, 24, 40, 0.05)',
  // Специальные тени
  focus: '0px 0px 0px 4px rgba(70, 95, 255, 0.12)',
  error: '0px 0px 0px 4px rgba(240, 68, 56, 0.12)',
  success: '0px 0px 0px 4px rgba(18, 183, 106, 0.12)',
};

// ============================================================================
// BORDER RADIUS - Радиусы границ
// ============================================================================

export const borderRadius = {
  none: '0',
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  base: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px',
};

// ============================================================================
// ANIMATIONS - Анимации
// ============================================================================

export const animation = {
  // Длительность анимаций
  duration: {
    instant: '0ms',
    '75': '75ms',
    '100': '100ms',
    '150': '150ms',
    '200': '200ms',
    '300': '300ms',
    '500': '500ms',
    '700': '700ms',
    '1000': '1000ms',
  },

  // Функции плавности
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Дополнительные функции
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Готовые анимации
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      '0%': { transform: 'translateY(-10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
  },
};

// ============================================================================
// Z-INDEX - Порядок слоев
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// ============================================================================
// UTILITIES - Утилиты
// ============================================================================

// Все токены вместе для удобства экспорта
export const tokens = {
  colors,
  spacing,
  typography,
  breakpoints,
  shadows,
  borderRadius,
  animation,
  zIndex,
} as const;

// Экспорт по умолчанию для совместимости
export default tokens;

// Типы для TypeScript
export type ColorTokens = typeof colors;
export type SpacingTokens = typeof spacing;
export type TypographyTokens = typeof typography;
export type BreakpointTokens = typeof breakpoints;
export type ShadowTokens = typeof shadows;
export type BorderRadiusTokens = typeof borderRadius;
export type AnimationTokens = typeof animation;
export type ZIndexTokens = typeof zIndex;
export type DesignTokens = typeof tokens;

// Экспорт всех типов для удобства
export * from './types';
