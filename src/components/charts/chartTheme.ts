import { useSyncExternalStore } from 'react';

import { subscribeToTheme } from '@/lib/theme';

/**
 * Grafik ranglari — tokenlardan O'QIB olinadi, nusxa emas.
 *
 * Ilgari bu yerda literal qiymatlar turardi va faylning o'z izohi buni
 * ogohlantirish bilan tan olardi: «palitra o'zgarsa BU FAYLNI HAM
 * yangilash kerak». Aynan shunday bo'ldi ham — palitra ko'tarilganda
 * o'qlar va to'r eski, quyuqroq fon uchun tanlangan ranglarda qolib ketdi.
 *
 * Recharts SVG atributiga aniq qiymat kutadi, ya'ni `var(--color-x)` ni
 * to'g'ridan-to'g'ri berib bo'lmaydi. Shuning uchun qiymat brauzerdan
 * hisoblab olinadi: token o'zgarsa (mavzu almashsa ham) grafik o'zi
 * ergashadi va sinxronlashni hech kim eslab yurishi shart emas.
 */

const FALLBACKS: Record<string, string> = {
  '--color-fg-muted': '#97a09b',
  '--color-line': '#2e3431',
  '--color-card': '#191f1c',
  '--color-chart-1': '#10b981',
  '--color-chart-2': '#3b82f6',
  '--color-chart-3': '#f59e0b',
  '--color-chart-4': '#a78bfa',
  '--color-danger': '#f87171',
};

/** Bitta tokenning hisoblangan qiymati (test muhitida — zaxira). */
function readToken(name: string): string {
  if (typeof document === 'undefined') return FALLBACKS[name] ?? '#10b981';
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || FALLBACKS[name] || '#10b981';
}

export interface ChartTheme {
  axis: string;
  grid: string;
  surface: string;
  /** Bir xil ko'rsatkich hamma grafikda bir xil rangda bo'lishi uchun. */
  series: [string, string, string, string];
  /**
   * Yo'qotishlar uchun — qaytarilgan pul, rad etilgan yechim.
   *
   * `series` ichida emas: u ketma-ket ko'rsatkichlar uchun va undan
   * navbatdagi rang olinganda «qaytarilgan» tasodifan yashil bo'lib
   * qolishi mumkin edi.
   */
  danger: string;
}

function snapshot(): ChartTheme {
  return {
    axis: readToken('--color-fg-muted'),
    grid: readToken('--color-line'),
    surface: readToken('--color-card'),
    series: [
      readToken('--color-chart-1'),
      readToken('--color-chart-2'),
      readToken('--color-chart-3'),
      readToken('--color-chart-4'),
    ],
    danger: readToken('--color-danger'),
  };
}

/*
 * `useSyncExternalStore` har chaqiruvda BIR XIL obyektni kutadi — yangi
 * obyekt qaytarilsa React cheksiz qayta chizadi. Shuning uchun qiymat
 * keshlanadi va faqat mavzu o'zgarganda bekor qilinadi.
 */
let cached: ChartTheme | null = null;

function getSnapshot(): ChartTheme {
  cached ??= snapshot();
  return cached;
}

function subscribe(onChange: () => void): () => void {
  return subscribeToTheme(() => {
    cached = null;
    onChange();
  });
}

/** Joriy mavzuga mos grafik ranglari. */
export function useChartTheme(): ChartTheme {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
