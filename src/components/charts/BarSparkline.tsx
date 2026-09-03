/**
 * Kartadagi mayda ustunli grafik.
 *
 * Recharts EMAS: bu yerda o'q ham, tur ham, tooltip ham kerak emas —
 * faqat shakl. To'liq grafik kutubxonasini o'nta kartaga qo'yish har
 * bittasiga `ResponsiveContainer` va o'lchov kuzatuvchisini qo'shardi,
 * bir necha `div` esa bir xil natijani beradi.
 *
 * Balandlik QAT'IY va ustunlar `overflow-hidden` ichida: `ResponsiveContainer`
 * o'z balandligini o'zi belgilar va chizig'i karta chegarasidan tashqariga
 * chiqib ketardi.
 */
export function BarSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);

  return (
    <span className="flex h-8 items-end gap-[2px] overflow-hidden" aria-hidden>
      {data.map((value, index) => {
        const last = index === data.length - 1;

        return (
          <span
            key={index}
            className="w-[3px] shrink-0 rounded-[1px]"
            style={{
              // Eng past ustun ham ko'rinib tursin: nol balandlik
              // «ma'lumot yo'q» degan taassurot berardi.
              height: `${Math.max(8, Math.round((value / max) * 100))}%`,
              background: color,
              // Oxirgi ustun — joriy holat, shuning uchun to'liq rangda.
              opacity: last ? 1 : 0.28,
            }}
          />
        );
      })}
    </span>
  );
}
