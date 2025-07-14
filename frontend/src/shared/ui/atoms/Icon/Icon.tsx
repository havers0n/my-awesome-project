import React from "react";
import { ICONS } from "@/helpers/icons";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

// Типы для локальных иконок
type LocalIconName = keyof typeof ICONS;

// Типы для Lucide иконок
type LucideIconName = keyof typeof LucideIcons;

// Объединенный тип иконок
type IconName = LocalIconName | LucideIconName;

interface BaseIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  className?: string;
  variant?: 'solid' | 'outline' | 'mini';
}

interface LocalIconProps extends BaseIconProps {
  name: LocalIconName;
  type?: 'local';
}

interface LucideIconProps extends BaseIconProps {
  name: LucideIconName;
  type: 'lucide';
}

type IconProps = LocalIconProps | LucideIconProps;

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'currentColor',
  className = '',
  variant = 'solid',
  type = 'local',
  ...props
}) => {
  // Определяем размер в пикселях
  const pixelSize = typeof size === 'number' ? size : sizeMap[size];

  // Если это Lucide иконка
  if (type === 'lucide' && name in LucideIcons) {
    const LucideIcon = LucideIcons[name as LucideIconName] as React.ComponentType<{
      size?: number;
      color?: string;
      className?: string;
      strokeWidth?: number;
    }>;

    const strokeWidth = variant === 'outline' ? 1.5 : variant === 'mini' ? 2 : 1.5;

    return (
      <LucideIcon
        size={pixelSize}
        color={color}
        strokeWidth={strokeWidth}
        className={cn('shrink-0', className)}
        {...props}
      />
    );
  }

  // Если это локальная иконка
  if (type === 'local' && name in ICONS) {
    const path = ICONS[name as LocalIconName];

    return (
      <img
        src={path}
        alt={`${name} icon`}
        width={pixelSize}
        height={pixelSize}
        className={cn('shrink-0', className)}
        style={{ color }}
        {...props}
      />
    );
  }

  // Fallback для неизвестных иконок
  console.warn(`Icon with name "${name}" not found.`);
  return (
    <div
      className={cn('shrink-0 bg-gray-200 rounded', className)}
      style={{ width: pixelSize, height: pixelSize }}
      title={`Missing icon: ${name}`}
    />
  );
};

export default Icon;
