/** `{name}` o'rniga qiymat qo'yish — sodda o'rinbosar, to'liq ICU emas. */
export function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
