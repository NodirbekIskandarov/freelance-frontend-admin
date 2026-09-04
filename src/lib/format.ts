/**
 * 125000 → "125 000".
 *
 * `ru-RU` ming ajratgichi sifatida uzilmas probel (U+00A0) qo'yadi.
 * Uni oddiy probelga almashtiramiz, aks holda matn nusxalanganda
 * ko'rinmas belgi ergashadi va qidiruvda mos kelmay qoladi.
 */
export function formatSom(value: number | null | undefined): string {
  /*
    Yo'q qiymat sahifani YIQITMASLIGI kerak.

    Ilgari tur `number` edi va u yerda yolg'on bor edi: javob to'liq
    kelmasa (yangi maydon, eski backend, qisman xato) chaqiruvchi
    `undefined` uzatardi va `undefined.toLocaleString()` butun ekranni
    xato chegarasiga olib borardi. Dashboard aynan shunday yiqilardi —
    bitta yetishmagan maydon uchun.

    Nol emas, chiziqcha: «0» va «ma'lumot yo'q» boshqa-boshqa gap.
  */
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('ru-RU').replace(/ /g, ' ');
}

/** 24560000 → "24.6 mln". Qisqa ko'rinish kerak bo'lgan joylar uchun. */
export function formatMillions(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${(value / 1_000_000).toFixed(1)} mln`;
}

/**
 * DRF `DecimalField` satrini o'qiladigan pul ko'rinishiga o'tkazadi:
 * `"7310.00"` → `"7 310 so'm"`.
 *
 * Satr ataylab `Number`ga o'tkazilgandan keyin ham ASL qiymat sifatida
 * emas, faqat KO'RSATISH uchun ishlatiladi — hisob-kitob va API'ga
 * qaytarish har doim satr ustida bo'ladi, aks holda katta summalarda
 * float aniqligi yo'qoladi.
 */
export function formatDecimalSom(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') return '—';

  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;

  return `${formatSom(parsed)} so'm`;
}

/** `"2026-08-17T04:44:52.082Z"` → `"17.08.2026 04:44"`. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * `"2026-08-17T04:44:52Z"` → `"17.08.2026"` va `"04:44"` — ALOHIDA.
 *
 * Jadvalda ular ikki qatorga bo'linadi: bitta qatorda yozilganda ustun
 * kengayib ketardi va sanalarni ko'z bilan solishtirib bo'lmasdi.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
