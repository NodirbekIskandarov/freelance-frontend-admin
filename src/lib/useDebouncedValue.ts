import { useEffect, useState } from 'react';

/**
 * Qiymatni kechiktirib qaytaradi.
 *
 * Qidiruv maydonida kerak: har bosilgan harf uchun so'rov yuborilsa,
 * "Abdullaev" yozganda 9 ta so'rov ketadi va javoblar tartibsiz qaytishi
 * mumkin. Kechikish bilan foydalanuvchi to'xtagandan keyin bittasi ketadi.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
