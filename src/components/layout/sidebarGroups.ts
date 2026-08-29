/**
 * Sidebar guruhlarining ochiq/yopiq holati.
 *
 * React holatida emas, tashqarida: menyu har sahifa almashganda qayta
 * chiziladi va holat komponent ichida bo'lsa yopilgan guruh o'z-o'zidan
 * qayta ochilib ketardi.
 *
 * Sukut bo'yicha hammasi OCHIQ — birinchi kirgan odam bandlar qayerga
 * yashiringanini qidirmasin. Saqlanadigan narsa faqat FARQ: odam
 * o'zi yopgan guruhlar.
 */

const KEY = 'admin.sidebar.groups';
const EVENT = 'yopamiz-admin:sidebar-groups';

export type OpenGroups = Record<string, boolean>;

const EMPTY: OpenGroups = {};

let cache: OpenGroups | null = null;

function read(): OpenGroups {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as OpenGroups) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/*
 * `useSyncExternalStore` har chaqiruvda bir xil havolani kutadi — yangi
 * obyekt qaytarilsa React cheksiz qayta chizadi.
 */
export function getOpenGroups(): OpenGroups {
  if (typeof window === 'undefined') return EMPTY;
  cache ??= read();
  return cache;
}

export function toggleGroup(id: string): void {
  const current = getOpenGroups();
  const next = { ...current, [id]: !(current[id] ?? true) };

  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Saqlab bo'lmasa ham joriy seansda ishlasin.
  }
  cache = next;
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeToGroups(onChange: () => void): () => void {
  const handleStorage = () => {
    cache = null;
    onChange();
  };

  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', handleStorage);
  };
}
