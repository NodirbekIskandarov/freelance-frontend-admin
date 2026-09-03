import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  FileCheck2,
  Mail,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';

import { GrowthLineChart } from '@/components/charts/GrowthLineChart';
import { Sparkline } from '@/components/charts/Sparkline';
import { SplitRevenueChart } from '@/components/charts/SplitRevenueChart';
import { useChartTheme } from '@/components/charts/chartTheme';
import { Card } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/cn';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import {
  OVERVIEW_PERIODS,
  PERIOD_LABELS,
  type AdminOverview,
  type MetricGroup,
  type OverviewMetric,
  type OverviewPeriod,
  type QueueBucket,
} from '@/shared/types/adminOverview';

import { useGetAdminOverviewQuery } from './dashboardApi';

const periodOptions = OVERVIEW_PERIODS.map((value) => ({ value, label: PERIOD_LABELS[value] }));

/** «2 kun» / «6 soat» — kutish vaqti odam o'qiydigan shaklda. */
function waitLabel(hours: number): string {
  if (hours <= 0) return '—';
  if (hours < 24) return `${hours} soat`;
  return `${Math.round(hours / 24)} kun`;
}

/**
 * Kutish qancha uzun bo'lsa, yorliq shuncha keskin.
 *
 * Chegaralar ish tartibidan: bir kundan oshgan navbat — kechikkan,
 * sakkiz soatdan oshgani — e'tibor talab qiladi.
 */
function waitTone(hours: number): string {
  if (hours >= 24) return 'bg-danger/12 text-danger';
  if (hours >= 8) return 'bg-warning/12 text-warning';
  return 'bg-elevated text-fg-muted';
}

function QueueCard({
  label,
  unit,
  bucket,
  to,
  icon: Icon,
}: {
  label: string;
  unit: string;
  bucket: QueueBucket;
  to: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-control border border-line bg-card p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-elevated text-fg-muted">
            <Icon className="size-3.5" strokeWidth={1.75} />
          </span>
          <span className="truncate text-sm font-medium text-fg">{label}</span>
        </span>
        <span
          className={cn(
            'shrink-0 rounded-badge px-2 py-0.5 text-[11px] font-medium tabular-nums',
            waitTone(bucket.waiting_hours),
          )}
        >
          {waitLabel(bucket.waiting_hours)}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-sm text-fg-muted">
          <span className="text-2xl font-semibold text-fg tabular-nums">{bucket.count}</span> {unit}
        </span>
        <Link to={to} className="text-xs font-medium text-primary hover:underline">
          Ko&apos;rish →
        </Link>
      </div>
    </div>
  );
}

/** Navbat — ekranning eng tepasida, chunki u bugun qilinadigan ish. */
function AttentionRow({ data }: { data: AdminOverview }) {
  const { queue } = data;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
          <span className="grid size-6 place-items-center rounded-md bg-warning/12 text-warning">
            <TriangleAlert className="size-3.5" strokeWidth={2} />
          </span>
          E&apos;tiboringiz kerak
          <span className="rounded-badge bg-elevated px-2 py-0.5 text-[11px] font-medium text-fg-muted tabular-nums">
            {queue.total} ta ish
          </span>
        </p>
        {queue.waiting_hours > 0 && (
          <p className="text-xs text-fg-muted">
            Eng eski ish {waitLabel(queue.waiting_hours)}dan beri kutmoqda
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QueueCard
          label="Yechim moderatsiyasi"
          unit="ta yechim"
          bucket={queue.solutions}
          to="/yechimlar"
          icon={FileCheck2}
        />
        <QueueCard
          label="Topshiriq arizalari"
          unit="ta ariza"
          bucket={queue.assignment_requests}
          to="/topshiriqlar/arizalar"
          icon={ClipboardList}
        />
        <QueueCard
          label="Xarid shikoyati"
          unit="ta nizo"
          bucket={queue.disputes}
          to="/xarid-shikoyatlari"
          icon={TriangleAlert}
        />
        <QueueCard
          label="Yangi murojaat"
          unit="ta xat"
          bucket={queue.appeals}
          to="/murojaatlar"
          icon={Mail}
        />
      </div>
    </Card>
  );
}

function Change({ value, className }: { value: number | null; className?: string }) {
  if (value === null) return null;

  const up = value >= 0;
  const Icon = up ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-badge px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
        up ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger',
        className,
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      {Math.abs(value)}%
    </span>
  );
}

function RevenueCard({ data }: { data: AdminOverview }) {
  const theme = useChartTheme();
  const { revenue } = data;

  const legend = [
    { label: 'Sotuvchilarga', value: revenue.seller_earning, color: theme.series[0] },
    { label: 'Platforma komissiyasi', value: revenue.commission, color: theme.series[2] },
    { label: 'Qaytarilgan', value: revenue.refunded, color: theme.series[1] },
  ];

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-wider text-fg-muted uppercase">
            Jami aylanma · {PERIOD_LABELS[data.period]}
          </p>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] leading-none font-semibold tracking-tight text-fg tabular-nums">
              {formatDecimalSom(revenue.revenue).replace(" so'm", '')}
            </span>
            <span className="text-sm text-fg-muted">so&apos;m</span>
            <Change value={revenue.change_percent} />
          </p>
        </div>

        <p className="text-right text-sm text-fg-muted">
          <span className="block text-xl font-semibold text-fg tabular-nums">{revenue.orders}</span>
          buyurtma
        </p>
      </div>

      <div className="mt-4">
        <SplitRevenueChart
          buckets={revenue.buckets}
          sellerLabel="Sotuvchilarga"
          commissionLabel="Platforma komissiyasi"
        />
      </div>

      {/* Ustunlar nimadan tuzilganini AYNAN shu yerda aytadi: ustun
          balandligi aylanma, ranglari esa uning taqsimoti. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
        {legend.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-[3px]"
              style={{ background: item.color }}
            />
            <span className="text-xs text-fg-muted">{item.label}</span>
            <span className="text-sm font-medium text-fg tabular-nums">
              {formatDecimalSom(item.value)}
            </span>
          </span>
        ))}
      </div>
    </Card>
  );
}

function GrowthCard({ data }: { data: AdminOverview }) {
  const [line, setLine] = useState<'users' | 'solutions'>('users');
  const current = data.growth[line];

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-wider text-fg-muted uppercase">
            O&apos;sish dinamikasi · {PERIOD_LABELS[data.period]}
          </p>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] leading-none font-semibold tracking-tight text-fg tabular-nums">
              {current.total}
            </span>
            <span className="text-sm text-fg-muted">
              jami · {current.active} {line === 'users' ? 'faol' : 'sotuvda'}
            </span>
            {current.added > 0 && (
              <span className="rounded-badge bg-success/12 px-1.5 py-0.5 text-[11px] font-medium text-success tabular-nums">
                +{current.added}
              </span>
            )}
          </p>
        </div>

        <SegmentedControl
          aria-label="Grafik turi"
          value={line}
          onChange={setLine}
          options={[
            { value: 'users', label: 'Foydalanuvchilar' },
            { value: 'solutions', label: 'Yechimlar' },
          ]}
        />
      </div>

      <div className="mt-4">
        <GrowthLineChart
          points={current.points}
          label={line === 'users' ? 'Foydalanuvchilar' : 'Yechimlar'}
        />
      </div>
    </Card>
  );
}

const groupTones: Record<MetricGroup, string> = {
  people: 'bg-info/12 text-info',
  content: 'bg-purple/12 text-purple',
  sales: 'bg-warning/12 text-warning',
};

const groupLabels: Record<MetricGroup, string> = {
  people: 'ODAM',
  content: 'KONTENT',
  sales: 'SAVDO',
};

function MetricCard({ metric }: { metric: OverviewMetric }) {
  const theme = useChartTheme();

  /* Sparkline rangi ko'rsatkich guruhiga ergashadi — karta yorlig'i
     bilan bir xil, ya'ni ikkisi bitta narsani aytadi. */
  const sparkColor =
    metric.group === 'sales'
      ? theme.series[2]
      : metric.group === 'content'
        ? theme.series[3]
        : theme.series[1];

  return (
    <Card className="flex flex-col p-4">
      <span
        className={cn(
          'w-fit rounded-badge px-1.5 py-0.5 text-[10px] font-semibold tracking-wider',
          groupTones[metric.group],
        )}
      >
        {groupLabels[metric.group]}
      </span>

      <p className="mt-2 truncate text-xs text-fg-muted" title={metric.label}>
        {metric.label}
      </p>

      <p className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[22px] leading-none font-semibold tracking-tight text-fg tabular-nums">
          {metric.value}
        </span>
        {metric.unit && <span className="text-xs text-fg-muted">{metric.unit}</span>}
      </p>

      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-[11px] text-fg-muted tabular-nums">
          {metric.change_percent !== null ? <Change value={metric.change_percent} /> : metric.note}
        </span>
        {metric.spark.length > 0 && (
          <span className="h-8 w-16 shrink-0">
            <Sparkline data={metric.spark} color={sparkColor} />
          </span>
        )}
      </div>
    </Card>
  );
}

function TopSellersCard({ data }: { data: AdminOverview }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-fg">Top sotuvchilar</p>
      <p className="mt-1 text-xs text-fg-muted">
        Daromad va sifat bir joyda — kimni rag&apos;batlantirish kerak.
      </p>

      {data.top_sellers.length === 0 ? (
        <p className="mt-6 text-sm text-fg-muted">Bu davrda sotuv bo&apos;lmagan.</p>
      ) : (
        <table className="mt-4 w-full">
          <thead>
            <tr className="text-[10px] font-semibold tracking-wider text-fg-muted uppercase">
              <th className="pb-2 text-left font-semibold">Muallif</th>
              <th className="pb-2 text-right font-semibold">Yechim</th>
              <th className="pb-2 text-right font-semibold">Baho</th>
              <th className="pb-2 text-right font-semibold">Daromad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.top_sellers.map((seller) => (
              <tr key={seller.id}>
                <td className="py-2.5 pr-3">
                  <span className="block truncate text-sm font-medium text-fg">
                    {seller.name || 'Noma’lum'}
                  </span>
                  <span className="block truncate text-[11px] text-fg-muted">
                    {[seller.university, seller.course ? `${seller.course}-kurs` : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </td>
                <td className="py-2.5 text-right text-sm text-fg-soft tabular-nums">
                  {seller.solutions}
                </td>
                <td className="py-2.5 text-right text-sm tabular-nums">
                  {seller.rating === null ? (
                    <span className="text-fg-muted">—</span>
                  ) : (
                    <span className={seller.rating >= 4.5 ? 'text-success' : 'text-warning'}>
                      ★ {seller.rating.toFixed(1)}
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-right text-sm font-medium text-fg tabular-nums">
                  {formatDecimalSom(seller.earning).replace(" so'm", '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function RetentionCard({ data }: { data: AdminOverview }) {
  const { retention, quality } = data;

  const rows = [
    { label: '1 marta sotib olgan', bucket: retention.once, color: 'bg-fg-muted' },
    { label: '2–3 marta', bucket: retention.repeat, color: 'bg-info' },
    { label: '4+ marta', bucket: retention.loyal, color: 'bg-success' },
    { label: "Sotuvchi ham bo'lgan", bucket: retention.also_sellers, color: 'bg-warning' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-sm font-semibold text-fg">Xaridorlarning qaytishi</p>
        <p className="mt-1 text-xs text-fg-muted">
          Bir marta sotib olgan talaba yana keladimi — platformaning eng muhim ko&apos;rsatkichi.
        </p>

        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-fg-soft">{row.label}</span>
                <span className="text-sm tabular-nums">
                  <span className="font-semibold text-fg">{row.bucket.count}</span>{' '}
                  <span className="text-fg-muted">{row.bucket.percent}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div
                  className={cn('h-full rounded-full', row.color)}
                  style={{ width: `${row.bucket.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-fg">Sifat va nizolar</p>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-fg-muted uppercase">
              O&apos;rtacha baho
            </p>
            <p className="mt-1.5 text-xl font-semibold text-success tabular-nums">
              {quality.rating === null ? '—' : quality.rating.toFixed(1)}
              <span className="ml-1 text-xs font-normal text-fg-muted">/ 5</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-fg-muted uppercase">
              Shikoyat
            </p>
            <p className="mt-1.5 text-xl font-semibold text-warning tabular-nums">
              {quality.dispute_percent}
              <span className="ml-1 text-xs font-normal text-fg-muted">% xaridlarda</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-fg-muted uppercase">
              Pul qaytarilgan
            </p>
            <p className="mt-1.5 text-xl font-semibold text-danger tabular-nums">
              {quality.refund_count}
              <span className="ml-1 text-xs font-normal text-fg-muted">
                ta · {formatDecimalSom(quality.refund_total).replace(" so'm", '')}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-fg-muted uppercase">
              Qaror vaqti
            </p>
            <p className="mt-1.5 text-xl font-semibold text-fg tabular-nums">
              {quality.decision_hours === null ? '—' : quality.decision_hours}
              <span className="ml-1 text-xs font-normal text-fg-muted">soat o&apos;rtacha</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-card border border-line bg-card', className)} />;
}

export function DashboardPage() {
  /*
    Sukut bo'yicha bir hafta.

    Bir kun juda qisqa (bitta sotuv ham foizni yuzga sakratadi), oy esa
    juda sekin — kechagi o'zgarish o'ttiz kunlik o'rtachada ko'rinmaydi.
  */
  const [period, setPeriod] = useState<OverviewPeriod>('7d');
  const { data, isLoading, isFetching, error } = useGetAdminOverviewQuery(period);

  if (error) {
    return (
      <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Dashboard</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-fg-muted">
            <span
              aria-hidden
              className={cn(
                'size-1.5 rounded-full',
                isFetching ? 'animate-pulse bg-warning' : 'bg-success',
              )}
            />
            {isFetching ? 'Yangilanmoqda…' : 'Ma’lumot joriy holatda'}
          </p>
        </div>

        <SegmentedControl
          aria-label="Davr"
          options={periodOptions}
          value={period}
          onChange={setPeriod}
        />
      </div>

      {isLoading || !data ? (
        <div className="mt-4 flex flex-col gap-4">
          <Skeleton className="h-[184px]" />
          <div className="grid gap-4 xl:grid-cols-2">
            <Skeleton className="h-[360px]" />
            <Skeleton className="h-[360px]" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => (
              <Skeleton key={index} className="h-[132px]" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <AttentionRow data={data} />

          <div className="grid gap-4 xl:grid-cols-2">
            <RevenueCard data={data} />
            <GrowthCard data={data} />
          </div>

          <section>
            <p className="text-sm font-semibold text-fg">
              Platforma ko&apos;rsatkichlari{' '}
              <span className="ml-1 rounded-badge bg-elevated px-2 py-0.5 text-[11px] font-medium text-fg-muted">
                {PERIOD_LABELS[data.period]}
              </span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
              {data.metrics.map((metric) => (
                <MetricCard key={metric.key} metric={metric} />
              ))}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <TopSellersCard data={data} />
            <RetentionCard data={data} />
          </div>
        </div>
      )}
    </>
  );
}
