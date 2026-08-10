/** Dashboard (1-rasm) uchun API shakllari. */

export interface StatTrend {
  direction: 'up' | 'down' | 'flat';
  value: string;
  note?: string;
}

export interface DashboardStat {
  /** UI'da ikonka va rangni tanlash uchun barqaror kalit. */
  key: string;
  label: string;
  value: string;
  trend?: StatTrend;
}

/** Foydalanuvchilar va ishlar grafiklari uchun kunlik nuqta. */
export interface SeriesPoint {
  date: string;
  primary: number;
  secondary: number;
}

/** Daromad ustun grafigi uchun nuqta. */
export interface RevenuePoint {
  date: string;
  amount: number;
}

export interface RevenueSummaryCard {
  key: string;
  label: string;
  value: string;
  changeValue: string;
  changeNote: string;
  /** Mini grafik uchun nuqtalar. */
  spark: number[];
}

export interface DashboardData {
  stats: DashboardStat[];
  userSeries: SeriesPoint[];
  jobSeries: SeriesPoint[];
  revenueSeries: RevenuePoint[];
  revenueSummary: RevenueSummaryCard[];
}
