import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

/**
 * "Daromadlar umumiy ko'rinishi" kartalaridagi mini grafik:
 * o'q va tur yo'q, faqat chiziq va uning ostidagi so'nuvchi to'ldirish.
 */
export function Sparkline({ data, color }: { data: number[]; color: string }) {
  // Gradient id sahifada takrorlanmasligi kerak — bir nechta sparkline
  // bir vaqtda chizilganda ular bir-birining gradientini o'g'irlaydi.
  const gradientId = useId();
  const points = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={64}>
      <AreaChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
