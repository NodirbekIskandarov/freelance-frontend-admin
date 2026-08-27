import {
  Activity,
  AlertTriangle,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Timer,
} from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AXIS_COLOR, GRID_COLOR } from '@/components/charts/chartTheme';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { cn } from '@/lib/cn';
import { getApiErrorMessage } from '@/shared/api';
import {
  MONITORING_WINDOWS,
  type ComponentHealth,
  type MonitoringPoint,
  type RouteStat,
} from '@/shared/types/monitoring';

import { useGetMonitoringQuery } from './monitoringApi';

/** Grafik va raqamlar necha soniyada bir yangilanadi. */
const REFRESH_MS = 15_000;

/** `YYYYMMDDHHMM` (UTC) → mahalliy `HH:MM`. */
function minuteLabel(value: string): string {
  if (value.length !== 12) return value;

  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(
    8,
    10,
  )}:${value.slice(10, 12)}:00Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function ms(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)} ms`;
}

/**
 * Yuklanish darajasiga qarab rang.
 *
 * Chegaralar: 75% dan past — normal, 90% gacha — diqqat, undan yuqori —
 * xavf. Bular sanoat amaliyotidagi odatiy qiymatlar; aniq raqam muhim
 * emas, muhimi ekranga qarab bir zumda «yaxshimi yo'qmi» deb aytish.
 */
function loadTone(percent: number | null): 'success' | 'warning' | 'danger' | 'neutral' {
  if (percent === null) return 'neutral';
  if (percent >= 90) return 'danger';
  if (percent >= 75) return 'warning';
  return 'success';
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const tones = {
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    danger: 'bg-danger/12 text-danger',
    neutral: 'bg-primary/12 text-primary',
  } as const;

  return (
    <div className="flex items-start gap-3 rounded-card border border-line bg-card p-4">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tones[tone])}>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-fg-muted">{label}</span>
        <span className="mt-0.5 block truncate text-xl font-semibold text-fg tabular-nums">
          {value}
        </span>
        {hint && <span className="mt-0.5 block truncate text-[11px] text-fg-dim">{hint}</span>}
      </span>
    </div>
  );
}

function HealthRow({ name, health }: { name: string; health: ComponentHealth }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <span className="flex items-center gap-2">
        <span
          className={cn('size-2 shrink-0 rounded-full', health.ok ? 'bg-success' : 'bg-danger')}
        />
        <span className="text-sm text-fg">{name}</span>
      </span>

      <span className="flex items-center gap-2">
        {/* Kechikish javobning bir qismi: javob beradigan, lekin sekin
            baza ham sekinlik sababi bo'lishi mumkin. */}
        <span className="text-xs text-fg-muted tabular-nums">{health.latency_ms} ms</span>
        <Badge tone={health.ok ? 'success' : 'danger'}>{health.ok ? 'Ishlayapti' : 'Xato'}</Badge>
      </span>
    </div>
  );
}

const routeColumns: Column<RouteStat>[] = [
  {
    key: 'route',
    header: 'Endpoint',
    className: 'min-w-[260px]',
    cell: (row) => (
      <span className="block truncate font-mono text-[12px] text-fg-soft" title={row.route}>
        {row.route}
      </span>
    ),
  },
  {
    key: 'requests',
    header: "So'rovlar",
    align: 'right',
    cell: (row) => <span className="tabular-nums">{row.requests}</span>,
  },
  {
    key: 'avg_ms',
    header: "O'rtacha",
    align: 'right',
    cell: (row) => (
      <span
        className={cn(
          'tabular-nums',
          row.avg_ms !== null && row.avg_ms >= 1000 && 'text-danger',
          row.avg_ms !== null && row.avg_ms >= 500 && row.avg_ms < 1000 && 'text-warning',
        )}
      >
        {ms(row.avg_ms)}
      </span>
    ),
  },
];

export function MonitoringPage() {
  const [window, setWindow] = useState('60');

  const { data, isLoading, isFetching, error, refetch } = useGetMonitoringQuery(
    { window: Number(window) },
    {
      // Ekran ochiq turganda o'zi yangilanadi — monitoring sahifasida
      // qo'lda yangilashni talab qilish uning ma'nosini yo'qotardi.
      pollingInterval: REFRESH_MS,
      refetchOnMountOrArgChange: true,
    },
  );

  const chartData = (data?.series ?? []).map((point: MonitoringPoint) => ({
    ...point,
    label: minuteLabel(point.minute),
  }));

  const system = data?.system;
  const summary = data?.summary;

  return (
    <>
      <PageHeader
        breadcrumbsPosition="above"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Server monitoringi' }]}
        title="Server monitoringi"
        subtitle="API yuklamasi, javob vaqti va server resurslari. Har 15 soniyada yangilanadi."
        actions={
          <>
            <Select
              aria-label="Vaqt oynasi"
              options={MONITORING_WINDOWS.map((item) => ({ ...item }))}
              value={window}
              onChange={(event) => setWindow(event.target.value)}
              className="w-44"
            />
            <Button
              variant="secondary"
              icon={
                <RefreshCw
                  className={cn('size-4', isFetching && 'animate-spin')}
                  strokeWidth={1.75}
                />
              }
              onClick={() => void refetch()}
            >
              Yangilash
            </Button>
          </>
        }
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : isLoading || !data ? (
        <div className="grid gap-4">
          <div className="h-24 animate-pulse rounded-card bg-elevated" />
          <div className="h-72 animate-pulse rounded-card bg-elevated" />
        </div>
      ) : (
        <div className="grid gap-4">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={Activity}
              label="Hozirgi yuklama"
              value={`${data.rps} RPS`}
              hint="Oxirgi 5 daqiqa bo'yicha"
            />
            <Metric
              icon={Timer}
              label="Javob vaqti (p95)"
              value={ms(summary?.p95_ms ?? null)}
              hint={`o'rtacha ${ms(summary?.avg_ms ?? null)} · p99 ${ms(summary?.p99_ms ?? null)}`}
              tone={
                summary?.p95_ms == null
                  ? 'neutral'
                  : summary.p95_ms >= 1000
                    ? 'danger'
                    : summary.p95_ms >= 500
                      ? 'warning'
                      : 'success'
              }
            />
            <Metric
              icon={AlertTriangle}
              label="Server xatolari"
              value={`${summary?.error_rate ?? 0}%`}
              hint={`${summary?.errors_5xx ?? 0} ta 5xx · ${summary?.errors_4xx ?? 0} ta 4xx`}
              tone={
                (summary?.error_rate ?? 0) >= 1
                  ? 'danger'
                  : (summary?.error_rate ?? 0) > 0
                    ? 'warning'
                    : 'success'
              }
            />
            <Metric
              icon={Gauge}
              label="Jami so'rovlar"
              value={String(summary?.requests ?? 0)}
              hint={`${data.window_minutes} daqiqa ichida`}
            />
          </section>

          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-fg">So&apos;rovlar oqimi</h2>
              <span className="text-xs text-fg-muted">
                Har nuqta —{' '}
                {data.minutes_per_point === 1
                  ? '1 daqiqa'
                  : `${data.minutes_per_point} daqiqa o'rtachasi`}
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rpmFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke={AXIS_COLOR}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={40}
                  />
                  <YAxis
                    stroke={AXIS_COLOR}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1411',
                      border: '1px solid #2a302e',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#A1A1AA' }}
                    formatter={(value) => [`${Number(value)} / daqiqa`, "So'rov"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rpm"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#rpmFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold text-fg">Javob vaqti (p95)</h2>
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke={AXIS_COLOR}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={40}
                  />
                  <YAxis
                    stroke={AXIS_COLOR}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1411',
                      border: '1px solid #2a302e',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#A1A1AA' }}
                    formatter={(value) => [`${Math.round(Number(value))} ms`, 'p95']}
                  />
                  <Area
                    type="monotone"
                    dataKey="p95_ms"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#latencyFill)"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-base font-semibold text-fg">Eng sekin endpointlar</h2>
                <p className="mt-0.5 text-xs text-fg-muted">
                  O&apos;rtacha vaqt bo&apos;yicha. Kamida 5 marta chaqirilganlari — bitta omadsiz
                  so&apos;rov ro&apos;yxatni egallab olmasin.
                </p>
              </div>
              <Table
                columns={routeColumns}
                rows={data.slowest_routes}
                rowKey={(row) => row.route}
                density="compact"
                emptyMessage="Bu oynada yetarli ma'lumot yo'q"
              />
            </Card>

            <div className="grid gap-4">
              <Card className="p-5">
                <h2 className="text-base font-semibold text-fg">Server resurslari</h2>

                <div className="mt-4 grid gap-3">
                  <Metric
                    icon={Cpu}
                    label="Protsessor"
                    value={system?.cpu_percent === null ? '—' : `${system?.cpu_percent}%`}
                    hint={
                      system?.load_average ? `load: ${system.load_average.join(' / ')}` : undefined
                    }
                    tone={loadTone(system?.cpu_percent ?? null)}
                  />
                  <Metric
                    icon={MemoryStick}
                    label="Operativ xotira"
                    value={system?.memory_percent === null ? '—' : `${system?.memory_percent}%`}
                    hint={
                      system?.memory_total_mb
                        ? `${(system.memory_used_mb! / 1024).toFixed(1)} / ${(
                            system.memory_total_mb / 1024
                          ).toFixed(1)} GB`
                        : undefined
                    }
                    tone={loadTone(system?.memory_percent ?? null)}
                  />
                  <Metric
                    icon={HardDrive}
                    label="Disk"
                    value={system?.disk_percent === null ? '—' : `${system?.disk_percent}%`}
                    hint={
                      system?.disk_total_gb
                        ? `${system.disk_used_gb} / ${system.disk_total_gb} GB`
                        : undefined
                    }
                    tone={loadTone(system?.disk_percent ?? null)}
                  />
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
                  <Database className="size-4 text-primary" strokeWidth={1.75} />
                  Xizmatlar holati
                </h2>

                <div className="mt-3">
                  {Object.entries(data.components).map(([name, health]) => (
                    <HealthRow
                      key={name}
                      name={name === 'database' ? "Ma'lumotlar bazasi" : 'Kesh (Redis)'}
                      health={health}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-fg">Eng ko&apos;p chaqirilganlar</h2>
            </div>
            <Table
              columns={routeColumns}
              rows={data.busiest_routes}
              rowKey={(row) => row.route}
              density="compact"
              emptyMessage="Bu oynada so'rov yo'q"
            />
          </Card>

          {/*
            Foizlar taxminiy ekani ochiq aytiladi: kimdir bu raqamlarga
            qarab qaror qabul qilsa, ularning aniqlik darajasini bilishi
            kerak.
          */}
          <p className="text-xs leading-relaxed text-fg-dim">
            Foizlar (p50/p95/p99) qat&apos;iy oraliqlar bo&apos;yicha hisoblanadi va taxminiy —
            oraliq chetiga aniq, millisekundga emas. Metrika 48 soat saqlanadi. O&apos;lchov faqat{' '}
            <span className="font-mono">/api/</span> so&apos;rovlari bo&apos;yicha: Next.js sayti
            alohida konteynerda va bu yerda ko&apos;rinmaydi.
          </p>
        </div>
      )}
    </>
  );
}
