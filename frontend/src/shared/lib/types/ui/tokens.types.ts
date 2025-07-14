/**
 * TypeScript типы для дизайн-токенов
 *
 * Обеспечивает типобезопасность при работе с токенами
 * и автодополнение в IDE.
 */

// ============================================================================
// BASE TYPES - Базовые типы
// ============================================================================

export type ColorScale = {
  25?: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
};

export type SpacingKey =
  | 'px'
  | '0'
  | '0.5'
  | '1'
  | '1.5'
  | '2'
  | '2.5'
  | '3'
  | '3.5'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '14'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'
  | '36'
  | '40'
  | '44'
  | '48'
  | '52'
  | '56'
  | '60'
  | '64'
  | '72'
  | '80'
  | '96';

export type FontSizeKey =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl';

export type FontWeightKey =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

export type BreakpointKey =
  | 'mobile'
  | 'tablet'
  | 'desktop'
  | 'wide'
  | '2xsm'
  | 'xsm'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl';

export type ShadowKey =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'inner'
  | 'focus'
  | 'error'
  | 'success';

export type BorderRadiusKey =
  | 'none'
  | 'xs'
  | 'sm'
  | 'base'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | 'full';

export type AnimationDurationKey =
  | 'instant'
  | '75'
  | '100'
  | '150'
  | '200'
  | '300'
  | '500'
  | '700'
  | '1000';

export type AnimationEasingKey = 'linear' | 'in' | 'out' | 'inOut' | 'bounce' | 'elastic';

export type ZIndexKey =
  | 'hide'
  | 'auto'
  | 'base'
  | 'docked'
  | 'dropdown'
  | 'sticky'
  | 'banner'
  | 'overlay'
  | 'modal'
  | 'popover'
  | 'skipLink'
  | 'toast'
  | 'tooltip';

// ============================================================================
// COLOR TYPES - Типы цветов
// ============================================================================

export interface ColorTokens {
  brand: ColorScale;
  neutral: ColorScale;
  semantic: {
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
  };
  special: {
    white: string;
    black: string;
    transparent: string;
    current: string;
  };
}

export type BrandColor = keyof ColorTokens['brand'];
export type NeutralColor = keyof ColorTokens['neutral'];
export type SuccessColor = keyof ColorTokens['semantic']['success'];
export type WarningColor = keyof ColorTokens['semantic']['warning'];
export type ErrorColor = keyof ColorTokens['semantic']['error'];
export type InfoColor = keyof ColorTokens['semantic']['info'];
export type SpecialColor = keyof ColorTokens['special'];

// ============================================================================
// SPACING TYPES - Типы интервалов
// ============================================================================

export type SpacingTokens = Record<SpacingKey, string>;

// ============================================================================
// TYPOGRAPHY TYPES - Типы типографики
// ============================================================================

export interface TypographyTokens {
  fontFamily: {
    sans: string[];
    mono: string[];
    display: string[];
  };
  fontSize: Record<FontSizeKey, [string, { lineHeight: string }]>;
  fontWeight: Record<FontWeightKey, string>;
  lineHeight: {
    none: string;
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export type FontFamily = keyof TypographyTokens['fontFamily'];
export type LineHeight = keyof TypographyTokens['lineHeight'];
export type LetterSpacing = keyof TypographyTokens['letterSpacing'];

// ============================================================================
// LAYOUT TYPES - Типы макета
// ============================================================================

export type BreakpointTokens = Record<BreakpointKey, string>;

export type ShadowTokens = Record<ShadowKey, string>;

export type BorderRadiusTokens = Record<BorderRadiusKey, string>;

export type ZIndexTokens = Record<ZIndexKey, number | string>;

// ============================================================================
// ANIMATION TYPES - Типы анимации
// ============================================================================

export interface AnimationTokens {
  duration: Record<AnimationDurationKey, string>;
  easing: Record<AnimationEasingKey, string>;
  keyframes: {
    fadeIn: Record<string, Record<string, string>>;
    slideUp: Record<string, Record<string, string>>;
    slideDown: Record<string, Record<string, string>>;
    scaleIn: Record<string, Record<string, string>>;
  };
}

export type AnimationKeyframe = keyof AnimationTokens['keyframes'];

// ============================================================================
// MAIN TOKENS TYPE - Основной тип токенов
// ============================================================================

export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  breakpoints: BreakpointTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
  animation: AnimationTokens;
  zIndex: ZIndexTokens;
}

// ============================================================================
// THEME TYPES - Типы тем
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  highContrast: boolean;
  reducedMotion: boolean;
}

// ============================================================================
// CSS VARIABLE TYPES - Типы CSS переменных
// ============================================================================

export interface CSSVariableMap {
  // Colors
  '--color-brand-25': string;
  '--color-brand-50': string;
  '--color-brand-100': string;
  '--color-brand-200': string;
  '--color-brand-300': string;
  '--color-brand-400': string;
  '--color-brand-500': string;
  '--color-brand-600': string;
  '--color-brand-700': string;
  '--color-brand-800': string;
  '--color-brand-900': string;
  '--color-brand-950': string;

  // Neutral colors
  '--color-neutral-25': string;
  '--color-neutral-50': string;
  '--color-neutral-100': string;
  '--color-neutral-200': string;
  '--color-neutral-300': string;
  '--color-neutral-400': string;
  '--color-neutral-500': string;
  '--color-neutral-600': string;
  '--color-neutral-700': string;
  '--color-neutral-800': string;
  '--color-neutral-900': string;
  '--color-neutral-950': string;

  // Semantic colors
  '--text-primary': string;
  '--text-secondary': string;
  '--text-tertiary': string;
  '--text-quaternary': string;
  '--text-brand': string;
  '--text-success': string;
  '--text-warning': string;
  '--text-error': string;
  '--text-info': string;

  // Background colors
  '--bg-primary': string;
  '--bg-secondary': string;
  '--bg-tertiary': string;
  '--bg-brand': string;
  '--bg-success': string;
  '--bg-warning': string;
  '--bg-error': string;
  '--bg-info': string;

  // Border colors
  '--border-primary': string;
  '--border-secondary': string;
  '--border-brand': string;
  '--border-success': string;
  '--border-warning': string;
  '--border-error': string;
  '--border-info': string;

  // Interactive colors
  '--interactive-primary': string;
  '--interactive-primary-hover': string;
  '--interactive-primary-active': string;
  '--interactive-secondary': string;
  '--interactive-secondary-hover': string;
  '--interactive-secondary-active': string;

  // Spacing
  '--spacing-px': string;
  '--spacing-0': string;
  '--spacing-1': string;
  '--spacing-2': string;
  '--spacing-3': string;
  '--spacing-4': string;
  '--spacing-5': string;
  '--spacing-6': string;
  '--spacing-8': string;
  '--spacing-10': string;
  '--spacing-12': string;
  '--spacing-16': string;
  '--spacing-20': string;
  '--spacing-24': string;
  '--spacing-32': string;

  // Typography
  '--font-family-sans': string;
  '--font-family-mono': string;
  '--font-family-display': string;

  // Shadows
  '--shadow-xs': string;
  '--shadow-sm': string;
  '--shadow-md': string;
  '--shadow-lg': string;
  '--shadow-xl': string;
  '--shadow-2xl': string;
  '--shadow-inner': string;
  '--shadow-focus': string;
  '--shadow-error': string;
  '--shadow-success': string;

  // Border radius
  '--border-radius-none': string;
  '--border-radius-xs': string;
  '--border-radius-sm': string;
  '--border-radius-base': string;
  '--border-radius-md': string;
  '--border-radius-lg': string;
  '--border-radius-xl': string;
  '--border-radius-2xl': string;
  '--border-radius-3xl': string;
  '--border-radius-full': string;

  // Animation
  '--duration-instant': string;
  '--duration-75': string;
  '--duration-100': string;
  '--duration-150': string;
  '--duration-200': string;
  '--duration-300': string;
  '--duration-500': string;
  '--duration-700': string;
  '--duration-1000': string;

  // Easing
  '--easing-linear': string;
  '--easing-in': string;
  '--easing-out': string;
  '--easing-in-out': string;
  '--easing-bounce': string;
  '--easing-elastic': string;

  // Z-index
  '--z-index-hide': string;
  '--z-index-auto': string;
  '--z-index-base': string;
  '--z-index-docked': string;
  '--z-index-dropdown': string;
  '--z-index-sticky': string;
  '--z-index-banner': string;
  '--z-index-overlay': string;
  '--z-index-modal': string;
  '--z-index-popover': string;
  '--z-index-skip-link': string;
  '--z-index-toast': string;
  '--z-index-tooltip': string;
}

// ============================================================================
// UTILITY TYPES - Утилитарные типы
// ============================================================================

export type TokenValue<T> = T extends Record<string, infer U> ? U : never;

export type TokenKey<T> = T extends Record<infer K, any> ? K : never;

export type DeepTokenKey<T> =
  T extends Record<string, Record<string, any>>
    ? {
        [K in keyof T]: T[K] extends Record<string, any>
          ? `${K & string}.${keyof T[K] & string}`
          : never;
      }[keyof T]
    : never;

// ============================================================================
// COMPONENT PROP TYPES - Типы для пропсов компонентов
// ============================================================================

export interface ColorProps {
  /** Цвет бренда */
  brand?: BrandColor;
  /** Нейтральный цвет */
  neutral?: NeutralColor;
  /** Семантический цвет */
  semantic?: 'success' | 'warning' | 'error' | 'info';
  /** Специальный цвет */
  special?: SpecialColor;
}

export interface SpacingProps {
  /** Внешние отступы */
  margin?: SpacingKey;
  /** Внутренние отступы */
  padding?: SpacingKey;
  /** Отступы по горизонтали */
  mx?: SpacingKey;
  /** Отступы по вертикали */
  my?: SpacingKey;
  /** Отступ сверху */
  mt?: SpacingKey;
  /** Отступ справа */
  mr?: SpacingKey;
  /** Отступ снизу */
  mb?: SpacingKey;
  /** Отступ слева */
  ml?: SpacingKey;
  /** Внутренние отступы по горизонтали */
  px?: SpacingKey;
  /** Внутренние отступы по вертикали */
  py?: SpacingKey;
  /** Внутренний отступ сверху */
  pt?: SpacingKey;
  /** Внутренний отступ справа */
  pr?: SpacingKey;
  /** Внутренний отступ снизу */
  pb?: SpacingKey;
  /** Внутренний отступ слева */
  pl?: SpacingKey;
}

export interface TypographyProps {
  /** Размер шрифта */
  fontSize?: FontSizeKey;
  /** Вес шрифта */
  fontWeight?: FontWeightKey;
  /** Семейство шрифта */
  fontFamily?: FontFamily;
  /** Высота строки */
  lineHeight?: LineHeight;
  /** Интервал между буквами */
  letterSpacing?: LetterSpacing;
}

export interface ShadowProps {
  /** Тень */
  shadow?: ShadowKey;
  /** Тень при фокусе */
  focusRing?: boolean;
}

export interface BorderProps {
  /** Радиус границы */
  borderRadius?: BorderRadiusKey;
  /** Цвет границы */
  borderColor?: string;
  /** Ширина границы */
  borderWidth?: '0' | '1' | '2' | '4' | '8';
}

export interface AnimationProps {
  /** Длительность анимации */
  duration?: AnimationDurationKey;
  /** Функция плавности */
  easing?: AnimationEasingKey;
  /** Анимация */
  animation?: AnimationKeyframe;
}

// ============================================================================
// COMPONENT VARIANTS - Варианты компонентов
// ============================================================================

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'link';

export type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'disabled';

export type ComponentStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface ComponentProps
  extends ColorProps,
    SpacingProps,
    TypographyProps,
    ShadowProps,
    BorderProps,
    AnimationProps {
  /** Размер компонента */
  size?: ComponentSize;
  /** Вариант компонента */
  variant?: ComponentVariant;
  /** Состояние компонента */
  state?: ComponentState;
  /** Статус компонента */
  status?: ComponentStatus;
  /** Класс CSS */
  className?: string;
  /** Отключен ли компонент */
  disabled?: boolean;
  /** Загружается ли компонент */
  loading?: boolean;
  /** На всю ширину */
  fullWidth?: boolean;
}
