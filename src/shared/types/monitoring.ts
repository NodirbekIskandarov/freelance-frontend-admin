/**
 * Server monitoringi — `/admin/monitoring/`.
 *
 * Foizlar TAXMINIY: backend davomiylikni qat'iy qutilarga sanaydi
 * (Prometheus kabi) va foiz shu qutilar chetiga aniq bo'ladi,
 * millisekundga emas. Metrika 48 soat saqlanadi.
 */

export interface MonitoringPoint {
  /** `YYYYMMDDHHMM` — UTC. */
  minute: string;
  /** Daqiqasiga so'rov. Nuqta kengligi o'zgarsa ham taqqoslanadi. */
  rpm: number;
  requests: number;
  errors_5xx: number;
  errors_4xx: number;
  avg_ms: number | null;
  p95_ms: number | null;
}

export interface MonitoringSummary {
  requests: number;
  errors_5xx: number;
  errors_4xx: number;
  /** Faqat 5xx foizi — 404 mijoz xatosi va server nosozligi emas. */
  error_rate: number;
  avg_ms: number | null;
  p50_ms: number | null;
  p95_ms: number | null;
  p99_ms: number | null;
}

export interface SystemStats {
  /** `null` — o'qib bo'lmadi. Nol ko'rsatish javob bordek tuyulardi. */
  cpu_percent: number | null;
  memory_used_mb: number | null;
  memory_total_mb: number | null;
  memory_percent: number | null;
  disk_used_gb: number | null;
  disk_total_gb: number | null;
  disk_percent: number | null;
  load_average: number[] | null;
}

export interface ComponentHealth {
  ok: boolean;
  latency_ms: number;
  detail: string;
}

export interface RouteStat {
  route: string;
  requests: number;
  avg_ms: number | null;
  total_ms?: number;
}

export interface MonitoringSnapshot {
  window_minutes: number;
  /** Oxirgi 5 daqiqadan — sutkalik o'rtacha tunni hisobga olib pasaytirardi. */
  rps: number;
  summary: MonitoringSummary;
  series: MonitoringPoint[];
  minutes_per_point: number;
  system: SystemStats;
  components: Record<string, ComponentHealth>;
  slowest_routes: RouteStat[];
  busiest_routes: RouteStat[];
}

export const MONITORING_WINDOWS = [
  { value: '60', label: 'Oxirgi 1 soat' },
  { value: '360', label: 'Oxirgi 6 soat' },
  { value: '1440', label: 'Oxirgi 24 soat' },
  { value: '2880', label: 'Oxirgi 48 soat' },
] as const;
