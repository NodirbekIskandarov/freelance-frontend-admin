/**
 * Dashboard — bitta davrga bog'langan (`/admin/dashboard/overview/`).
 *
 * Ekranda bitta davr tanlagichi bor va u BUTUN sahifani boshqaradi:
 * grafiklar ham, o'nta ko'rsatkich ham, navbat ham. Shuning uchun ular
 * bitta so'rovdan keladi — sakkizta alohida so'rovda grafik «7 kun» deb
 * turganda yonidagi karta «30 kun» ko'rsatib qolishi mumkin edi.
 */

export const OVERVIEW_PERIODS = ['today', '7d', '30d', 'all'] as const;
export type OverviewPeriod = (typeof OVERVIEW_PERIODS)[number];

export const PERIOD_LABELS: Record<OverviewPeriod, string> = {
  today: 'Bugun',
  '7d': '7 kun',
  '30d': '30 kun',
  all: 'Butun davr',
};

/** Navbatdagi bitta bo'lim: nechta ish va eng eskisi qancha kutgani. */
export interface QueueBucket {
  count: number;
  waiting_hours: number;
}

export interface OverviewQueue {
  solutions: QueueBucket;
  assignment_requests: QueueBucket;
  disputes: QueueBucket;
  appeals: QueueBucket;
  total: number;
  waiting_hours: number;
}

export interface RevenueBucket {
  label: string;
  /** DRF o'nlik satri — hisob emas, ko'rsatish uchun. */
  seller: string;
  commission: string;
}

export interface OverviewRevenue {
  revenue: string;
  orders: number;
  seller_earning: string;
  commission: string;
  refunded: string;
  commission_percent: number;
  /** `null` — solishtiradigan oldingi davr yo'q. */
  change_percent: number | null;
  buckets: RevenueBucket[];
}

export interface GrowthPoint {
  label: string;
  total: number;
}

export interface GrowthLine {
  total: number;
  active: number;
  added: number;
  points: GrowthPoint[];
}

export interface OverviewGrowth {
  users: GrowthLine;
  solutions: GrowthLine;
}

/** Ko'rsatkich kartasining rangli yorlig'i. */
export type MetricGroup = 'people' | 'content' | 'sales';

export interface OverviewMetric {
  key: string;
  group: MetricGroup;
  label: string;
  value: string;
  unit: string;
  note: string;
  change_percent: number | null;
  spark: number[];
}

export interface TopSeller {
  id: string;
  name: string;
  university: string;
  course: number | null;
  solutions: number;
  rating: number | null;
  earning: string;
  sales: number;
}

export interface RetentionBucket {
  count: number;
  percent: number;
}

export interface OverviewRetention {
  total: number;
  once: RetentionBucket;
  repeat: RetentionBucket;
  loyal: RetentionBucket;
  also_sellers: RetentionBucket;
}

export interface OverviewQuality {
  rating: number | null;
  dispute_percent: number;
  refund_count: number;
  refund_total: string;
  decision_hours: number | null;
}

export interface AdminOverview {
  period: OverviewPeriod;
  queue: OverviewQueue;
  revenue: OverviewRevenue;
  growth: OverviewGrowth;
  metrics: OverviewMetric[];
  top_sellers: TopSeller[];
  retention: OverviewRetention;
  quality: OverviewQuality;
}
