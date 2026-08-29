import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useChartTheme } from './chartTheme';
import type { SeriesPoint } from '@/shared/types/dashboard';

import { ChartTooltip } from './ChartTooltip';

const axisProps = {
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

interface SeriesLineChartProps {
  data: SeriesPoint[];
  primaryLabel: string;
  secondaryLabel: string;
  /*
    Ranglar IXTIYORIY va sukut bo'yicha mavzudan olinadi.
    Ilgari ular majburiy edi va har chaqiruvchi o'zicha tanlardi: bitta
    grafikda «kunlik yangi» ko'k, ikkinchisida «jami» ko'k bo'lib qolgandi
    — ya'ni rang hech nima anglatmasdi. Endi ma'no rangga bog'langan:
    to'plangan qiymat doim series[0], kunlik oqim doim series[1].
  */
  primaryColor?: string;
  secondaryColor?: string;
  /** Y o'qidagi qiymatlarni qisqartirish (1250 → 1.25K). */
  formatY?: (value: number) => string;
  /**
   * Y o'qi bo'linmalari. Aniq berilishi kerak — Recharts avtomatik tanlaganda
   * dizayndagidan boshqa qadam chiqadi (masalan 350 oralig'ida 250 o'rniga).
   */
  yTicks: number[];
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-5 px-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2 text-[13px] text-fg-soft">
          <span
            aria-hidden
            className="h-[3px] w-4 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function SeriesLineChart({
  data,
  primaryLabel,
  secondaryLabel,
  primaryColor,
  secondaryColor,
  formatY,
  yTicks,
}: SeriesLineChartProps) {
  const theme = useChartTheme();
  const primary = primaryColor ?? theme.series[0];
  const secondary = secondaryColor ?? theme.series[1];

  return (
    <div>
      <Legend
        items={[
          { label: primaryLabel, color: primary },
          { label: secondaryLabel, color: secondary },
        ]}
      />

      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis dataKey="date" {...axisProps} stroke={theme.axis} dy={8} />
          <YAxis
            {...axisProps}
            stroke={theme.axis}
            tickFormatter={formatY}
            width={52}
            ticks={yTicks}
            domain={[yTicks[0] ?? 0, yTicks[yTicks.length - 1] ?? 'auto']}
          />
          <Tooltip
            cursor={{ stroke: theme.grid }}
            content={<ChartTooltip />}
            // Recharts tooltip'ni har harakatda qayta chizadi; animatsiya
            // o'chirilmasa kursor tez yurganda kechikib ergashadi.
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="primary"
            name={primaryLabel}
            stroke={primary}
            strokeWidth={2}
            dot={{ r: 3, fill: primary, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="linear"
            dataKey="secondary"
            name={secondaryLabel}
            stroke={secondary}
            strokeWidth={2}
            dot={{ r: 3, fill: secondary, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
