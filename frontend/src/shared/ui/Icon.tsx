import React from "react";
import { ICONS } from "@/helpers/icons";

type IconName = keyof typeof ICONS;

interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name: IconName;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 5, ...props }) => {
  const path = ICONS[name];

  if (!path) {
    console.warn(`Icon with name "${name}" not found.`);
    return null; // Можно заменить на иконку-заглушку
  }

  // Tailwind классы для размеров
  const sizeClasses = `w-${size} h-${size}`;

  return (
    <img
      src={path}
      alt={`${name} icon`}
      className={`${sizeClasses} ${className || ''}`}
      {...props}
    />
  );
};
