import { ICONS } from '@/helpers/icons';
import * as LucideIcons from 'lucide-react';

// Локальные иконки
export type LocalIconName = keyof typeof ICONS;

// Lucide иконки
export type LucideIconName = keyof typeof LucideIcons;

// Все доступные иконки
export type IconName = LocalIconName | LucideIconName;

// Размеры иконок
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Варианты отображения (в основном для Lucide)
export type IconVariant = 'solid' | 'outline' | 'mini';

// Типы иконок
export type IconType = 'local' | 'lucide';

// Мапа размеров в пиксели
export const ICON_SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Наиболее часто используемые Lucide иконки
export const COMMON_LUCIDE_ICONS = [
  'Home',
  'User',
  'Settings',
  'Search',
  'Bell',
  'Mail',
  'Heart',
  'Star',
  'Plus',
  'Minus',
  'X',
  'Check',
  'ChevronLeft',
  'ChevronRight',
  'ChevronUp',
  'ChevronDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Download',
  'Upload',
  'Edit',
  'Trash2',
  'Copy',
  'Save',
  'Eye',
  'EyeOff',
  'Lock',
  'Unlock',
  'Shield',
  'AlertCircle',
  'Calendar',
  'Clock',
  'Image',
  'File',
  'Folder',
  'Link',
  'Menu',
  'MoreHorizontal',
  'MoreVertical',
  'Filter',
  'Sort',
] as const;

// Наиболее часто используемые локальные иконки
export const COMMON_LOCAL_ICONS = [
  'LOGO',
  'LOGO_DARK',
  'LOGO_ICON',
  'AUTH_LOGO',
  'ALERT',
  'ALERT_HEXA',
  'CHECK_CIRCLE',
  'INFO',
  'CALENDAR',
  'CHAT',
  'DOCS',
  'DOWNLOAD',
  'ENVELOPE',
  'FILE',
  'FOLDER',
  'GRID',
  'LIST',
  'LOCK',
  'PENCIL',
  'PLUS',
  'SEARCH',
  'SETTINGS',
  'STAR',
  'TRASH',
  'USER_CIRCLE',
  'USER_LINE',
  'TIME',
  'BOLT',
] as const;

// Утилитарные функции
export const isLocalIcon = (name: string): name is LocalIconName => {
  return name in ICONS;
};

export const isLucideIcon = (name: string): name is LucideIconName => {
  return name in LucideIcons;
};

export const getIconSize = (size: IconSize | number): number => {
  return typeof size === 'number' ? size : ICON_SIZE_MAP[size];
};

export const getStrokeWidth = (variant: IconVariant): number => {
  switch (variant) {
    case 'outline':
      return 1.5;
    case 'mini':
      return 2;
    case 'solid':
    default:
      return 1.5;
  }
};
