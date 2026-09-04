/**
 * Admin dashboard — haqiqiy backend (`/admin/dashboard/`).
 *
 * Pul maydonlari SATR: DRF `DecimalField` shunday qaytaradi va uni
 * `number`ga o'tkazish katta summalarda aniqlikni yo'qotardi.
 */

export interface DashboardUsers {
  total: number;
  active: number;
  pending: number;
  blocked: number;
  staff: number;
  new_this_month: number;
}

export interface DashboardSolutions {
  total: number;
  pending: number;
  approved: number;
  published: number;
  rejected: number;
  archived: number;
}

export interface DashboardCatalogue {
  universities: number;
  active_universities: number;
  subjects: number;
  assignments: number;
  variants: number;
}

/** Diqqat talab qiladigan navbatlar — dashboarddan to'g'ridan-to'g'ri o'tiladi. */
export interface DashboardRequests {
  subject_pending: number;
  assignment_pending: number;
  report_pending: number;
  solution_demand: number;
}

export interface DashboardSales {
  orders: number;
  orders_this_month: number;
  revenue: string;
  revenue_this_month: string;
  commission: string;
  seller_earning: string;
}

export interface SeriesPoint {
  date: string;
  count: number;
}

export interface OrderSeriesPoint extends SeriesPoint {
  revenue: string;
}

/** Bitta ish navbati: nechta ish va eng eskisi necha soatdan beri kutmoqda. */
export interface DashboardQueueBucket {
  count: number;
  waiting_hours: number;
}

export interface DashboardQueue {
  solutions: DashboardQueueBucket;
  subject_requests: DashboardQueueBucket;
  assignment_requests: DashboardQueueBucket;
  reports: DashboardQueueBucket;
  disputes: DashboardQueueBucket;
}

export interface AdminDashboard {
  users: DashboardUsers;
  solutions: DashboardSolutions;
  catalogue: DashboardCatalogue;
  requests: DashboardRequests;
  queue: DashboardQueue;
  sales: DashboardSales;
  series_days: number;
  series: {
    users: SeriesPoint[];
    orders: OrderSeriesPoint[];
    solutions: SeriesPoint[];
  };
}

/** Institutlar bo'yicha yig'ma ko'rsatkichlar (`/admin/universities/summary/`). */
export interface AdminUniversitySummary {
  id: string;
  name: string;
  short_name: string;
  code: string;
  city: string;
  is_active: boolean;
  subject_count: number;
  assignment_count: number;
  variant_count: number;
  published_solution_count: number;
  pending_subject_request_count: number;
}

/**
 * Variantlarga talab (`/admin/variant-demand/`) — qaysi variantga yechim
 * so'ralgani-yu, hali nechtasi e'lon qilinganini ko'rsatadi.
 */
export interface AdminVariantDemand {
  id: string;
  number: number;
  label: string;
  assignment: string;
  assignment_title: string;
  subject: string;
  subject_name: string;
  university_name: string;
  request_count: number;
  published_count: number;
  max_published_solutions: number;
  is_active: boolean;
}
