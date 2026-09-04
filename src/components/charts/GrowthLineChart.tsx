import {
  CartesianGrid,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { GrowthPoint } from '@/shared/types/adminOverview';

import { ChartTooltip } from './ChartTooltip';
import { useChartTheme } from './chartTheme';

/**
 * O'sish chizig'i — TO'PLANGAN jami.
 *
 * Kunlik yangi qo'shilganlar emas: bu grafik «platforma o'smoqdami»
 * degan savolga javob beradi, seshanba kuni ikkita foydalanuvchi
 * qo'shilgani esa unga javob emas.
 *
 * O'q noldan boshlanmaydi — mavjud bazasi bor platformada nolgacha
 * cho'zilgan o'q butun o'sishni yuqoridagi ingichka chiziqqa siqib
 * qo'yardi.
 */
function bounds(points: GrowthPoint[]): { ticks: number[]; domain: [number, number] } {
  const values = points.map((point) => point.total);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const floor = Math.max(0, Math.floor(min - (max - min) * 0.2));
  const step = Math.max(1, Math.ceil((max - floor) / 4));
  const ticks = [0, 1, 2, 3, 4].map((index) => floor + step * index);
  return { ticks, domain: [floor, floor + step * 4] };
}

export function GrowthLineChart({ points, label }: { points: GrowthPoint[]; label: string }) {
  const theme = useChartTheme();
  const { ticks, domain } = bounds(points);

  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
        <CartesianGrid stroke={theme.gridSubtle} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={theme.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={8}
          interval={points.length > 12 ? Math.floor(points.length / 6) : 0}
        />
        <YAxis
          stroke={theme.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={44}
          ticks={ticks}
          domain={domain}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} isAnimationActive={false} />
        {/* Maydon to'ldirish 10% — chiziqning ostidagi hajm ko'rinsin,
            lekin to'rni bosib qolmasin. */}
        <defs>
          <linearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.series[0]} stopOpacity={0.18} />
            <stop offset="100%" stopColor={theme.series[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="total"
          name={label}
          stroke={theme.series[0]}
          strokeWidth={2}
          fill="url(#growth-area)"
          /* Nuqtalar FAQAT ustiga kelganda: o'ttiz kunlik chiziqda
             o'ttizta doira chiziqning o'zini yashirib qo'yardi. */
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
