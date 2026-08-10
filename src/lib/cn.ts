import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Shartli class'larni birlashtiradi va Tailwind ziddiyatlarini hal qiladi.
 *
 * `twMerge` kerak, chunki komponentga tashqaridan `className` berilganda
 * u ichkaridagi bir xil turdagi class'ni bosib o'tishi kerak:
 * `cn('px-4', 'px-6')` → `px-6`. Oddiy birlashtirishda ikkalasi ham qolib,
 * qaysi biri ishlashi CSS tartibiga bog'liq bo'lib qolardi.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
