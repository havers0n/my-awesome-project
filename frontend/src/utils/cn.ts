import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилитарная функция для объединения CSS классов
 * Использует clsx для условного объединения классов и tailwind-merge для разрешения конфликтов Tailwind
 *
 * @param inputs - Массив классов или условий для классов
 * @returns Строка с объединенными классами
 *
 * @example
 * cn('px-2 py-1', 'bg-red-500', { 'text-white': true, 'font-bold': false })
 * // => 'px-2 py-1 bg-red-500 text-white'
 *
 * @example
 * cn('px-2 py-1 bg-red-500', 'bg-blue-500') // bg-blue-500 переопределит bg-red-500
 * // => 'px-2 py-1 bg-blue-500'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default cn;
