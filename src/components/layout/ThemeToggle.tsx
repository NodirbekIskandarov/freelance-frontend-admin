import { Monitor, Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { IconButton } from '@/components/ui/Button';
import { getThemeMode, setThemeMode, subscribeToTheme, type ThemeMode } from '@/lib/theme';

const ORDER = ['system', 'light', 'dark'] as const satisfies readonly ThemeMode[];

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;
const LABELS = { system: 'Tizim bo‘yicha', light: 'Yorug‘', dark: 'Qorong‘i' } as const;

/**
 * Mavzu tugmasi.
 *
 * Uchta holat bo'ylab aylanadi, ikkitasi emas: `system` alohida ma'noga
 * ega — kechqurun tizim qorong'iga o'tsa panel ham o'tishi kerak, ya'ni
 * saqlanadigan narsa tanlovning O'ZI, natijasi emas.
 *
 * `useSyncExternalStore`: holat DOM'da va localStorage'da yashaydi, React
 * holatida emas. Ikki nusxa bo'lsa boshqa yorliqda almashtirilganda ular
 * bir-biridan uzoqlashardi.
 */
export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribeToTheme, getThemeMode, () => 'dark' as ThemeMode);
  const Icon = ICONS[mode];

  // `indexOf` -1 qaytarsa (kutilmagan qiymat) birinchisiga qaytamiz.
  const current = ORDER.indexOf(mode as (typeof ORDER)[number]);
  const next = ORDER[(current + 1) % ORDER.length] ?? 'system';

  return (
    <IconButton
      label={`Mavzu: ${LABELS[mode]}. Almashtirish — ${LABELS[next]}`}
      onClick={() => setThemeMode(next)}
    >
      <Icon className="size-[18px]" strokeWidth={1.75} />
    </IconButton>
  );
}
