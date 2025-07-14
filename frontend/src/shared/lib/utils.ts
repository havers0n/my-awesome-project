import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет классы с помощью clsx и tailwind-merge
 * Это позволяет условно применять классы и правильно объединять Tailwind классы
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Утилита для условного применения классов
 */
export function conditional(condition: boolean, trueClass: string, falseClass?: string) {
  return condition ? trueClass : falseClass || "";
}

/**
 * Создает объект классов на основе условий
 */
export function createClasses<T extends Record<string, boolean>>(conditions: T) {
  return Object.entries(conditions)
    .filter(([_, condition]) => condition)
    .map(([className]) => className)
    .join(' ');
}
