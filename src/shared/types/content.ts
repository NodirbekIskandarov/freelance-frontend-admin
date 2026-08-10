/** 6-rasm — Kontent boshqaruvi. */

export interface ContentStat {
  key: string;
  label: string;
  value: string;
  /** Karta ichidagi qo'shimcha qatorlar: "Faol: 115". */
  details: { label: string; value: string }[];
}

export interface SalesPoint {
  date: string;
  amount: number;
}

/** "Top institutlar", "Top fanlar", "Top topshiriqlar" kartalari uchun qator. */
export interface TopRow {
  id: string;
  name: string;
  /** Ikkinchi qator (topshiriqlarda "Mustaqil ish №3"). */
  note?: string;
  avatarUrl?: string | null;
  count: number;
  income: number;
}

export interface TopBlock {
  key: string;
  title: string;
  subtitle: string;
  /** Ustun sarlavhalari: ["Institut", "Sotuvlar", "Daromad (so'm)"]. */
  columns: [string, string, string];
  rows: TopRow[];
}

export interface ContentStatusRow {
  label: string;
  value: string;
  tone: 'success' | 'info' | 'purple' | 'warning' | 'orange' | 'danger' | 'cyan';
}

export interface ContentOverview {
  stats: ContentStat[];
  sales: {
    total: string;
    changePercent: string;
    changeNote: string;
    points: SalesPoint[];
  };
  topBlocks: TopBlock[];
  contentStatus: ContentStatusRow[];
}
