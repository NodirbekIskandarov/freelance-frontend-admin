/**
 * Kontent boshqaruvi — HAQIQIY backend (`/admin/content-overview/`).
 *
 * Pul maydonlari SATR: DRF `DecimalField` shunday qaytaradi va uni
 * `number`ga o'tkazib qaytarish katta summalarda aniqlikni yo'qotardi.
 */

export interface ContentUniversityStats {
  total: number;
  active: number;
  pending_requests: number;
}

export interface ContentSubjectStats {
  total: number;
  active: number;
  pending_requests: number;
}

/** Topshiriq turlari backenddan yorliq bilan keladi — tarjima shart emas. */
export interface CountRow {
  type: string;
  label: string;
  count: number;
}

export interface ContentAssignmentStats {
  total: number;
  by_type: CountRow[];
}

export interface ContentVariantStats {
  total: number;
  with_solution: number;
  without_solution: number;
  requested: number;
}

export interface ContentSolutionStats {
  total: number;
  pending: number;
  approved: number;
  published: number;
  rejected: number;
  archived: number;
}

/** Talab: yechim so'ralgan, lekin hali yuklanmagan variantlar. */
export interface ContentDemandStats {
  total: number;
  waiting: number;
  answered: number;
  requests: number;
}

export interface ContentSalesStats {
  orders_total: number;
  orders_this_month: number;
  orders_today: number;
  revenue_total: string;
  commission_total: string;
  /** Tanlangan oraliqdagi va undan oldingi teng oraliqdagi daromad. */
  revenue_window: string;
  revenue_previous_window: string;
  window_days: number;
  change_percent: string | null;
}

export interface ContentSeriesPoint {
  date: string;
  orders: number;
  amount: string;
}

interface TopRowBase {
  id: string;
  name: string;
  sales: number;
  revenue: string;
}

export interface TopUniversityRow extends TopRowBase {
  short_name: string;
}

export interface TopSubjectRow extends TopRowBase {
  university_name: string;
}

export interface TopAssignmentRow extends TopRowBase {
  type: string;
  subject_name: string;
}

export interface TopAuthorRow extends TopRowBase {
  phone: string;
  solutions: number;
}

export interface ContentOverview {
  universities: ContentUniversityStats;
  subjects: ContentSubjectStats;
  assignments: ContentAssignmentStats;
  variants: ContentVariantStats;
  solutions: ContentSolutionStats;
  demand: ContentDemandStats;
  sales: ContentSalesStats;
  series: ContentSeriesPoint[];
  top_universities: TopUniversityRow[];
  top_subjects: TopSubjectRow[];
  top_assignments: TopAssignmentRow[];
  top_authors: TopAuthorRow[];
}

/** Grafik nuqtasi — summa satrdan songa faqat CHIZISH uchun o'tkaziladi. */
export interface SalesPoint {
  date: string;
  amount: number;
}
