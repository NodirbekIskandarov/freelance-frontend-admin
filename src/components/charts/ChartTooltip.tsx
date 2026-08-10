/**
 * Recharts'ning standart tooltip'i oq fonli — dark temaga mos emas.
 *
 * Prop tiplari Recharts'nikidan meros olinmagan, o'zimizniki: Recharts
 * `content` ga berilgan elementni kerakli proplar bilan klonlaydi, shuning
 * uchun barcha proplar ixtiyoriy bo'lishi kifoya. Meros olinsa, `<ChartTooltip />`
 * ni propsiz yozib bo'lmaydi — TS majburiy maydonlarni talab qiladi.
 */

interface TooltipEntry {
  dataKey?: string | number | ((item: unknown) => unknown);
  name?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  /** Qiymatni ko'rinadigan matnga aylantiradi (masalan so'm formati). */
  formatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-control border border-line bg-card px-3 py-2 shadow-dropdown">
      <p className="mb-1 text-xs text-fg-muted">{label}</p>
      {payload.map((entry, index) => (
        <p
          key={typeof entry.dataKey === 'function' ? index : (entry.dataKey ?? index)}
          className="flex items-center gap-2 text-[13px] text-fg"
        >
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-fg-muted">{entry.name}</span>
          <span className="ml-auto font-medium">
            {typeof entry.value === 'number' && formatter ? formatter(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}
