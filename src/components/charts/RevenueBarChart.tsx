import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_COLOR, GRID_COLOR, SERIES_COLOR } from './chartTheme';
import type { RevenuePoint } from '@/shared/types/dashboard';

import { ChartTooltip } from './ChartTooltip';

/**
 * Y o'qi ma'lumotdan hisoblanadi.
 *
 * Ilgari u 0–10M ga qotib qo'yilgan edi (dizayn maketidagi qiymatlar
 * shunday edi). Haqiqiy daromad hozircha nol va grafik bo'sh maydonga
 * cho'zilib, hech narsa ko'rsatmasdi. Endi o'q eng katta qiymatga
 * moslashadi, nol bo'lsa esa kichik standart oraliq olinadi.
 */
function ticksFor(max: number): { ticks: number[]; domain: [number, number] } {
  const top = max > 0 ? Math.ceil(max * 1.2) : 100_000;
  const step = Math.ceil(top / 5);
  return {
    ticks: [0, step, step * 2, step * 3, step * 4, step * 5],
    domain: [0, step * 5],
  };
}

/** 6 800 000 → "6M", 80 000 → "80K", nol esa shunchaki "0". */
function formatAxis(value: number): string {
  if (value === 0) return '0';
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function formatSom(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;
}

export function RevenueBarChart({ data }: { data: RevenuePoint[] }) {
  const { ticks, domain } = ticksFor(Math.max(...data.map((point) => point.amount), 0));

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 px-1 text-[13px] text-fg-soft">
        <span
          aria-hidden
          className="h-[3px] w-4 rounded-full"
          style={{ background: SERIES_COLOR }}
        />
        Kunlik daromad (so‘m)
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: -8 }}
          barCategoryGap="34%"
        >
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
            tickFormatter={formatAxis}
            width={48}
            ticks={ticks}
            domain={domain}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={<ChartTooltip formatter={formatSom} />}
            isAnimationActive={false}
          />
          <Bar dataKey="amount" name="Kunlik daromad" fill={SERIES_COLOR} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
