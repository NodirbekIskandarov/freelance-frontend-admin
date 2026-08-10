import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { RevenuePoint } from '@/shared/types/dashboard';

import { ChartTooltip } from './ChartTooltip';

const AXIS_COLOR = '#8B97A3';
const GRID_COLOR = '#171F2D';
const BAR_COLOR = '#22C55E';

/** Y o'qi bo'linmalari — dizaynda 0 dan 10M gacha 2M qadam bilan. */
const Y_TICKS = [0, 2_000_000, 4_000_000, 6_000_000, 8_000_000, 10_000_000];

/** 6 800 000 → "6M"; nol esa shunchaki "0" (dizaynda "0M" emas). */
function formatMillions(value: number): string {
  if (value === 0) return '0';
  return `${Math.round(value / 1_000_000)}M`;
}

function formatSom(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;
}

export function RevenueBarChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 px-1 text-[13px] text-fg-soft">
        <span aria-hidden className="h-[3px] w-4 rounded-full" style={{ background: BAR_COLOR }} />
        Kunlik daromad (so‘m)
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }} barCategoryGap="34%">
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={AXIS_COLOR}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={8}
            // 30 kunlik ma'lumotda har kuni sig'maydi — dizaynda ham
            // faqat har 7-kun yozilgan.
            interval={6}
          />
          <YAxis
            stroke={AXIS_COLOR}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatMillions}
            width={48}
            ticks={Y_TICKS}
            domain={[0, 10_000_000]}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={<ChartTooltip formatter={formatSom} />}
            isAnimationActive={false}
          />
          <Bar dataKey="amount" name="Kunlik daromad" fill={BAR_COLOR} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
