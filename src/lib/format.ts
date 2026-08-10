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
