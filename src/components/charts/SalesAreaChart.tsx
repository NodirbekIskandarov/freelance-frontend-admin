import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useChartTheme } from './chartTheme';
import type { SalesPoint } from '@/shared/types/content';

import { ChartTooltip } from './ChartTooltip';

/**
 * O'q qiymatlari MA'LUMOTDAN hisoblanadi.
 *
 * Ilgari ular qat'iy 0–6M edi (mock shunday edi). Haqiqiy sotuv bundan
 * kichik bo'lsa grafik pastda yassi chiziq bo'lib qolardi.
 */
function ticksFor(max: number): { ticks: number[]; domain: [number, number] } {
  const top = max > 0 ? Math.ceil(max * 1.2) : 100_000;
  const step = Math.ceil(top / 5);
  return { ticks: [0, step, step * 2, step * 3, step * 4, step * 5], domain: [0, step * 5] };
}

/** 6 800 000 → "6M", 80 000 → "80K", nol esa shunchaki "0". */
function formatAxis(value: number): string {
  if (value === 0) return '0';
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function formatSom(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/ /g, ' ')} so'm`;
}

/** "Kundalik sotuvlar" katta grafigi (6-rasm). */
export function SalesAreaChart({ data }: { data: SalesPoint[] }) {
  const theme = useChartTheme();
  const { ticks, domain } = ticksFor(Math.max(...data.map((point) => point.amount), 0));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.series[0]} stopOpacity={0.25} />
            <stop offset="100%" stopColor={theme.series[0]} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis
          dataKey="date"
          stroke={theme.axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={8}
        />
        <YAxis
          stroke={theme.axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxis}
          ticks={ticks}
          domain={domain}
          width={48}
        />
        <Tooltip
          cursor={{ stroke: theme.grid }}
          content={<ChartTooltip formatter={formatSom} />}
          isAnimationActive={false}
        />
        <Area
          type="linear"
          dataKey="amount"
          name="Kunlik sotuv"
          stroke={theme.series[0]}
          strokeWidth={2}
          fill="url(#salesFill)"
          dot={{ r: 3.5, fill: theme.series[0], strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
