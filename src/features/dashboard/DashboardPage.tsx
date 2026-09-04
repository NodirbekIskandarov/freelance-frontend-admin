import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  Mail,
  Minus,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';

import { GrowthLineChart } from '@/components/charts/GrowthLineChart';
import { BarSparkline } from '@/components/charts/BarSparkline';
import { SplitRevenueChart } from '@/components/charts/SplitRevenueChart';
import { useChartTheme } from '@/components/charts/chartTheme';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
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

/** Ustunlar qaysi bo'lakda — davr tanlagichi bilan birga o'zgaradi. */
function bucketCaption(period: OverviewPeriod): string {
  if (period === 'today') return 'Soatlik aylanma';
  if (period === '30d') return 'Haftalik aylanma';
  if (period === 'all') return 'Oylik aylanma';
  return 'Kunlik aylanma';
}

/** «2 kun» / «6 soat» — kutish vaqti odam o'qiydigan shaklda. */
function waitLabel(hours: number): string {
  if (hours <= 0) return '—';
  if (hours < 24) return `${hours} soat`;
  return `${Math.round(hours / 24)} kun`;
}

const queueTones: Record<'neutral' | 'warning' | 'danger', string> = {
  neutral: 'bg-neutral-quiet text-fg-muted border-neutral-line',
  warning: 'bg-warning-quiet text-warning border-warning-line',
  danger: 'bg-danger-quiet text-danger border-danger-line',
};

/**
 * Keskinlik ish TURIDAN emas, eng eski ishning YOSHIDAN kelib chiqadi.
 *
 * Ilgari «Xarid shikoyati» turi bo'yicha doim qizil edi va NOLTA nizo
 * ham qizil `—` tamg'a bilan chizilardi: ekranda hech qanday ish yo'q
 * joyda ogohlantirish turardi. Bir necha kun shunday ko'rgan odam qizil
 * rangga umuman ishonmay qo'yadi — va o'shanda haqiqiy nizo ham
 * sezilmay qoladi.
 *
 * Bo'sh navbat — TINCH holat va u shunday deb ham yoziladi.
 */
function queueSeverity(bucket: QueueBucket): 'neutral' | 'warning' | 'danger' {
  if (bucket.count <= 0) return 'neutral';
  if (bucket.waiting_hours >= 24) return 'danger';
  if (bucket.waiting_hours >= 8) return 'warning';
  return 'neutral';
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
  const severity = queueSeverity(bucket);
  const empty = bucket.count <= 0;

  return (
    /* BUTUN karta havola. Ilgari bosiladigan joy o'ng pastdagi
       «Ko'rish →» yozuvi edi — kartaning o'ndan bir qismi. */
    <Link
      to={to}
      className={cn(
        'group block rounded-control border border-line-subtle bg-card p-3.5',
        'transition-colors duration-(--dur) ease-soft outline-none',
        'hover:bg-surface-hover focus-visible:shadow-(--ring)',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-md border',
              queueTones[severity],
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
          </span>
          <span className="truncate text-[13px] font-medium text-fg">{label}</span>
        </span>

        {!empty && (
          <span
            className={cn(
              'shrink-0 rounded-badge border px-2 py-0.5 text-[11px] leading-[16px] font-medium tabular-nums',
              queueTones[severity],
            )}
          >
            {waitLabel(bucket.waiting_hours)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        {empty ? (
          <span className="text-[13px] text-fg-muted">Hammasi tartibda</span>
        ) : (
          <span className="text-[13px] text-fg-muted">
            <span className="text-2xl leading-none font-semibold text-fg tabular-nums">
              {bucket.count}
            </span>{' '}
            {unit}
          </span>
        )}

        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-fg-dim transition-transform duration-(--dur) ease-soft group-hover:translate-x-0.5 group-hover:text-fg-muted"
          strokeWidth={2}
        />
      </div>
    </Link>
  );
}

/** Navbat — ekranning eng tepasida, chunki u bugun qilinadigan ish. */
function AttentionRow({ data }: { data: AdminOverview }) {
  const { queue } = data;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
          <span className="grid size-6 place-items-center rounded-md border border-warning-line bg-warning-quiet text-warning">
            <TriangleAlert className="size-3.5" strokeWidth={2} />
          </span>
          E&apos;tiboringiz kerak
          <span className="rounded-badge border border-neutral-line bg-neutral-quiet px-2 py-0.5 text-[11px] leading-[16px] font-medium text-fg-muted tabular-nums">
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

  /* Nol — o'sish ham, pasayish ham emas. Ilgari u yashil «↑ 0%» bo'lib
     chiqardi va o'sish bo'lmagan joyda o'sish borday ko'rinardi. */
  const flat = value === 0;
  const up = value > 0;
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-badge border px-1.5 py-0.5 text-[11px] leading-[16px] font-medium tabular-nums',
        flat
          ? 'border-neutral-line bg-neutral-quiet text-fg-muted'
          : up
            ? 'border-success-line bg-success-quiet text-success'
            : 'border-danger-line bg-danger-quiet text-danger',
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

  const sellerPercent = Math.max(0, Math.round(100 - revenue.commission_percent));

  /* Uch qator uch xil narsani aytadi: ustunning ikki bo'lagi va
     ulardan tashqarida qaytib ketgan pul. Qaytarilgan pul QIZIL —
     u aylanmaning bo'lagi emas, uning teskarisi. */
  const legend = [
    {
      label: 'Sotuvchilarga',
      value: revenue.seller_earning,
      color: theme.series[0],
      share: sellerPercent,
    },
    {
      label: 'Platforma komissiyasi',
      value: revenue.commission,
      color: theme.series[2],
      share: Math.round(revenue.commission_percent),
    },
    /* Qaytarilgan pul ulushsiz: u ustunning bir bo'lagi EMAS, undan
       tashqarida qaytib ketgan summa. Ulush yozilsa u ham ustunga
       kirgandek ko'rinardi. */
    { label: 'Qaytarilgan', value: revenue.refunded, color: theme.danger, share: undefined },
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

      {/*
        BITTA legenda.

        Ilgari ikkitasi bor edi: biri grafik ostida ulushlar bilan, ikkinchisi
        pastda summalar bilan — bir xil uch rang ikki marta tushuntirilardi
        va o'quvchi ular boshqa-boshqa narsa deb o'ylashi mumkin edi. Endi
        bitta qator: rang, nomi, ulushi va summasi.
      */}
      <p className="mt-3 text-[11px] font-medium tracking-[0.06em] text-fg-dim uppercase">
        {bucketCaption(data.period)}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line-subtle pt-3">
        {legend.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-[3px]"
              style={{ background: item.color }}
            />
            <span className="text-xs text-fg-muted">
              {item.label}
              {item.share !== undefined && ` (${item.share}%)`}
            </span>
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
  const theme = useChartTheme();
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

      {/* Chiziq TO'PLANGAN jami ekanini aytish shart: usiz uni kunlik
          qo'shilganlar deb o'qish mumkin va grafik ma'nosini yo'qotadi. */}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-fg-soft">
        <span
          aria-hidden
          className="h-[3px] w-4 shrink-0 rounded-full"
          style={{ background: theme.series[0] }}
        />
        Jami (to&apos;plangan)
      </div>
    </Card>
  );
}

/*
 * Guruh yorlig'i — RANGSIZ.
 *
 * Ilgari har guruh o'z rangida edi (ko'k / binafsha / sariq) va natijada
 * sahifadagi eng rangli narsa eng kam ma'lumot tashiydigan narsa bo'lib
 * qolgandi: yorliq raqamni emas, faqat uning turkumini aytadi. Turkum
 * matnning o'zida yozilgan, unga rang kerak emas.
 */
/**
 * Turkum yorlig'i — RANGSIZ va yorliqning O'ZI.
 *
 * Ilgari u rangli tamg'a edi (ko'k / binafsha / sariq) va sahifadagi eng
 * rangli narsa eng kam ma'lumot tashiydigan narsa bo'lib qolgandi:
 * tamg'a raqamni emas, faqat uning turkumini aytadi. Endi u ko'rsatkich
 * nomining ustidagi xira sarlavha — o'qiladi, lekin e'tibor talab
 * qilmaydi.
 */
const groupLabels: Record<MetricGroup, string> = {
  people: 'ODAM',
  content: 'KONTENT',
  sales: 'SAVDO',
};

/** Davr so'zi — «+4» ni «+4 bu hafta» qiladi. */
const periodNotes: Record<OverviewPeriod, string> = {
  today: 'bugun',
  '7d': 'bu hafta',
  '30d': 'bu oy',
  all: 'jami',
};

function MetricCard({ metric, period }: { metric: OverviewMetric; period: OverviewPeriod }) {
  const theme = useChartTheme();

  /* «+4» o'z-o'zicha savol qoldiradi — qachondan beri to'rtta? Davr
     so'zi javobni yoniga qo'yadi. Boshqa shakldagi izohlar («7 faol»)
     tegilmaydi. */
  const note = metric.note.startsWith('+') ? `${metric.note} ${periodNotes[period]}` : metric.note;

  return (
    <Card className="flex min-h-27 flex-col p-5">
      <p className="text-[11px] font-medium tracking-[0.08em] text-fg-dim uppercase">
        {groupLabels[metric.group]}
      </p>

      <p className="mt-1 truncate text-[13px] text-fg-muted" title={metric.label}>
        {metric.label}
      </p>

      <p className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[28px] leading-none font-semibold tracking-tight text-fg tabular-nums">
          {metric.value}
        </span>
        {metric.unit && <span className="text-sm text-fg-muted">{metric.unit}</span>}
      </p>

      {/* `mt-auto`: izoh va grafik kartaning PASTIGA yopishadi, ya'ni
          yonma-yon turgan o'nta kartada ular bitta chiziqda bo'ladi —
          nomi ikki qatorli kartada ham. */}
      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
        {/* Yorliq QISQARTIRILMAYDI: «bu h…» hech nima anglatmaydi.
            O'rniga sparkline qisqaradi — u shakl beradi, aniq qiymat
            emas, ya'ni sakkizta ustun ham o'n ikkitasicha ish qiladi. */}
        <span className="flex items-center gap-1.5 text-[11px] whitespace-nowrap text-fg-dim tabular-nums">
          <Change value={metric.change_percent} />
          {metric.change_percent !== null ? periodNotes[period] : note}
        </span>

        {/* Sparkline AKSENT rangida va xira: u tendensiyani ko'rsatadi,
            raqamning o'zi bilan bellashmaydi. Ilgari har guruh o'z
            rangida edi va o'nta karta o'nta rangli grafik berardi. */}
        {metric.spark.length > 0 && (
          <BarSparkline data={metric.spark.slice(-8)} color={theme.series[0]} />
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
  return <div className={cn('bg-skeleton rounded-card', className)} />;
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
      <Card>
        <ErrorState message={getApiErrorMessage(error)} />
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                'size-1.5 rounded-full',
                isFetching ? 'animate-pulse bg-warning' : 'bg-success',
              )}
            />
            {isFetching ? 'Yangilanmoqda…' : 'Ma’lumot joriy holatda'}
          </span>
        }
        actions={
          <SegmentedControl
            aria-label="Davr"
            options={periodOptions}
            value={period}
            onChange={setPeriod}
          />
        }
      />

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
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {data.metrics.map((metric) => (
                <MetricCard key={metric.key} metric={metric} period={data.period} />
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
