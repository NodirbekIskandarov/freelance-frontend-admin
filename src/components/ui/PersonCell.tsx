/**
 * Jadvaldagi «kim» katagi: ism ustida, telefon ostida.
 *
 * Bir nechta bo'limda bir xil savolga javob beriladi — arizani kim
 * yubordi, yechimni kim yukladi — va javob har joyda bir xil ko'rinishi
 * kerak. Ilgari har sahifada qaytadan yozilardi va biroz farq qilardi.
 *
 * Ism bo'lmasa telefon YAGONA qator bo'lib qoladi: uni ikki marta
 * takrorlash katakni behuda ikki qatorga cho'zardi.
 */
export function PersonCell({
  name,
  phone,
  empty = '—',
}: {
  name?: string | null;
  phone?: string | null;
  empty?: string;
}) {
  const fullName = name?.trim();
  const primary = fullName || phone?.trim();

  if (!primary) return <span className="text-fg-dim">{empty}</span>;

  return (
    <span className="block min-w-0">
      <span className="block truncate text-[13px] font-medium text-fg" title={primary}>
        {primary}
      </span>
      {fullName && phone && <span className="block truncate text-[11px] text-fg-dim">{phone}</span>}
    </span>
  );
}
