import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AXIS_COLOR, GRID_COLOR } from './chartTheme';
import type { SeriesPoint } from '@/shared/types/dashboard';

import { ChartTooltip } from './ChartTooltip';

/** Dizayndagi o'q va tur ranglari — tokenlar bilan bir xil. */

const axisProps = {
  stroke: AXIS_COLOR,
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

interface SeriesLineChartProps {
  data: SeriesPoint[];
  primaryLabel: string;
  secondaryLabel: string;
  primaryColor: string;
  secondaryColor: string;
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
  return (
    <div>
      <Legend
        items={[
          { label: primaryLabel, color: primaryColor },
          { label: secondaryLabel, color: secondaryColor },
        ]}
      />

      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="date" {...axisProps} dy={8} />
          <YAxis
            {...axisProps}
            tickFormatter={formatY}
            width={52}
            ticks={yTicks}
            domain={[yTicks[0] ?? 0, yTicks[yTicks.length - 1] ?? 'auto']}
          />
          <Tooltip
            cursor={{ stroke: GRID_COLOR }}
            content={<ChartTooltip />}
            // Recharts tooltip'ni har harakatda qayta chizadi; animatsiya
            // o'chirilmasa kursor tez yurganda kechikib ergashadi.
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="primary"
            name={primaryLabel}
            stroke={primaryColor}
            strokeWidth={2}
            dot={{ r: 3, fill: primaryColor, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="linear"
            dataKey="secondary"
            name={secondaryLabel}
            stroke={secondaryColor}
            strokeWidth={2}
            dot={{ r: 3, fill: secondaryColor, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
