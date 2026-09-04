import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { RevenueBucket } from '@/shared/types/adminOverview';

import { ChartTooltip } from './ChartTooltip';
import { useChartTheme } from './chartTheme';

/**
 * Aylanma ustunlari — sotuvchi ulushi va platforma komissiyasi
 * USTMA-UST.
 *
 * Ikkita alohida ustun emas: ular bitta sotuvning ikki bo'lagi va
 * yonma-yon qo'yilsa ustun balandligi jami aylanmani ko'rsatmay
 * qolardi — holbuki bu grafikning asosiy savoli.
 */
function ticksFor(max: number): { ticks: number[]; domain: [number, number] } {
  const top = max > 0 ? Math.ceil(max * 1.2) : 100_000;
  const step = Math.ceil(top / 3);
  return { ticks: [0, step, step * 2, step * 3], domain: [0, step * 3] };
}

function formatAxis(value: number): string {
  if (value === 0) return '0';
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function formatSom(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;
}

export function SplitRevenueChart({
  buckets,
  sellerLabel,
  commissionLabel,
}: {
  buckets: RevenueBucket[];
  sellerLabel: string;
  commissionLabel: string;
}) {
  const theme = useChartTheme();

  const data = buckets.map((bucket) => ({
    label: bucket.label,
    seller: Number(bucket.seller),
    commission: Number(bucket.commission),
  }));

  const max = Math.max(...data.map((point) => point.seller + point.commission), 0);
  const { ticks, domain } = ticksFor(max);

  /* Yorliqlar hammasi sig'maydi: soatlik oynada yigirma to'rtta,
     kunlikda o'ttizta. Har ikkinchi-uchinchisi yoziladi. */
  const interval = data.length > 12 ? Math.floor(data.length / 6) : 0;

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }} barCategoryGap="40%">
        <CartesianGrid stroke={theme.gridSubtle} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={theme.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={8}
          interval={interval}
        />
        <YAxis
          stroke={theme.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxis}
          width={44}
          ticks={ticks}
          domain={domain}
        />
        <Tooltip
          cursor={{ fill: theme.hover }}
          content={<ChartTooltip formatter={formatSom} />}
          isAnimationActive={false}
        />
        {/* Animatsiya YO'Q: davr almashtirilganda ustunlar har safar
            noldan o'sib chiqsa, ikki qiymatni solishtirmoqchi bo'lgan
            odam har bosishda bir soniya kutadi. */}
        <Bar
          dataKey="seller"
          stackId="revenue"
          name={sellerLabel}
          fill={theme.series[0]}
          radius={[0, 0, 2, 2]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="commission"
          stackId="revenue"
          name={commissionLabel}
          fill={theme.series[2]}
          radius={[6, 6, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
