/**
 * 125000 → "125 000".
 *
 * `ru-RU` ming ajratgichi sifatida uzilmas probel (U+00A0) qo'yadi.
 * Uni oddiy probelga almashtiramiz, aks holda matn nusxalanganda
 * ko'rinmas belgi ergashadi va qidiruvda mos kelmay qoladi.
 */
export function formatSom(value: number): string {
  return value.toLocaleString('ru-RU').replace(/ /g, ' ');
}

/** 24560000 → "24.6 mln". Qisqa ko'rinish kerak bo'lgan joylar uchun. */
export function formatMillions(value: number): string {
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
export function formatDecimalSom(value: string | null): string {
  if (value === null || value.trim() === '') return '—';

  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;

  return `${formatSom(parsed)} so'm`;
}

/** `"2026-08-17T04:44:52.082Z"` → `"17.08.2026 04:44"`. */
export function formatDateTime(value: string | null): string {
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
