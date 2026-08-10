import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { SalesPoint } from '@/shared/types/content';

import { ChartTooltip } from './ChartTooltip';

const AXIS_COLOR = '#8B97A3';
const GRID_COLOR = '#171F2D';
const LINE_COLOR = '#22C55E';

const Y_TICKS = [0, 1_000_000, 2_000_000, 3_000_000, 4_000_000, 5_000_000, 6_000_000];

function formatMillions(value: number): string {
  if (value === 0) return '0';
  return `${Math.round(value / 1_000_000)}M`;
}

function formatSom(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/ /g, ' ')} so'm`;
}

/** "Kundalik sotuvlar" katta grafigi (6-rasm). */
export function SalesAreaChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.25} />
            <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          stroke={AXIS_COLOR}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={8}
        />
        <YAxis
          stroke={AXIS_COLOR}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatMillions}
          ticks={Y_TICKS}
          domain={[0, 6_000_000]}
          width={48}
        />
        <Tooltip
          cursor={{ stroke: GRID_COLOR }}
          content={<ChartTooltip formatter={formatSom} />}
          isAnimationActive={false}
        />
        <Area
          type="linear"
          dataKey="amount"
          name="Kunlik sotuv"
          stroke={LINE_COLOR}
          strokeWidth={2}
          fill="url(#salesFill)"
          dot={{ r: 3.5, fill: LINE_COLOR, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
