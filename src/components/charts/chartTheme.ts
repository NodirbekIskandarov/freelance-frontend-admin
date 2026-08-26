/**
 * Grafik ranglari.
 *
 * Recharts SVG atributlariga aniq qiymat kutadi, shuning uchun bu yerda
 * CSS o'zgaruvchisi emas, literal qiymatlar. Ular `shared/styles/tokens.css`
 * dagi tokenlarning nusxasi — palitra o'zgarsa BU FAYLNI HAM yangilash
 * kerak, aks holda grafiklar eski rangda qolib ketadi (aynan shunday
 * bo'lgan: tokenlar yashilga o'tganda o'qlar ko'k-kulrang qolgandi).
 */

/** `--color-fg-muted` */
export const AXIS_COLOR = '#A1A1AA';

/** `--color-line` */
export const GRID_COLOR = '#1B221F';

/** `--color-brand-500` — shablondagi grafiklarda ham emerald. */
export const SERIES_COLOR = '#10B981';
