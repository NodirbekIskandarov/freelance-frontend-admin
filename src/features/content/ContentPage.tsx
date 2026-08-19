import {
  BookOpen,
  CircleCheck,
  ClipboardList,
  Landmark,
  Layers,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { SalesAreaChart } from '@/components/charts/SalesAreaChart';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';
import { formatDecimalSom, formatSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import { assignmentTypeLabel } from '@/shared/types/assignments';
import type { ContentOverview } from '@/shared/types/content';

import { useGetContentOverviewQuery } from './contentApi';

const windowOptions = [
  { value: '7', label: "So'nggi 7 kun" },
  { value: '30', label: "So'nggi 30 kun" },
  { value: '90', label: "So'nggi 90 kun" },
];

interface StatDetail {
  label: string;
  value: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  details,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
  details: StatDetail[];
}) {
  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tone)}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <p className="min-w-0 text-[13px] leading-snug text-fg-muted">{label}</p>
      </div>

      <p className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-fg">{value}</p>

      <dl className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
        {details.map((detail) => (
          <div key={detail.label} className="flex items-center justify-between gap-2 text-xs">
            <dt className="truncate text-fg-muted">{detail.label}:</dt>
            <dd className="shrink-0 font-medium text-fg-soft">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface TopRow {
  id: string;
  name: string;
  note?: string;
  count: number;
  revenue: string;
}

function TopCard({
  title,
  subtitle,
  countHeader,
  rows,
}: {
  title: string;
  subtitle: string;
  countHeader: string;
  rows: TopRow[];
}) {
  return (
    <Card className="flex flex-col">
      <div className="px-5 pt-5">
        <h2 className="text-[15px] font-semibold text-fg">
          {title} <span className="font-normal text-fg-muted">{subtitle}</span>
        </h2>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs text-fg-muted">Ma&apos;lumot yo&apos;q</p>
      ) : (
        /*
          `table-fixed` shart: karta tor (~245px), avtomatik kenglikda
          uchinchi ustun kartadan chiqib ketadi. Belgilangan kenglik bilan
          nom qisqaradi, raqamlar esa to'liq ko'rinadi.
        */
        <table className="mt-4 w-full table-fixed text-xs">
          <thead>
            <tr className="border-b border-line text-[11px] text-fg-muted">
              <th scope="col" className="px-2 pb-2 text-left font-medium">
                Nomi
              </th>
              <th scope="col" className="w-11 px-1 pb-2 text-right font-medium">
                {countHeader}
              </th>
              <th scope="col" className="w-[72px] px-2 pb-2 text-right font-medium">
                Daromad
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b border-line last:border-b-0">
                <td className="px-2 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 shrink-0 text-[11px] text-fg-dim">{index + 1}</span>
                    <Avatar name={row.name} size="sm" className="size-5" />
                    {/*
                      Nom kesilmaydi, o'raladi. Izoh alohida qator emas,
                      nomdan keyin qavsda: alohida qator bo'lsa tor ustunda
                      har so'z bo'linib, qator balandligi uch barobar oshadi.
                    */}
                    <span className="min-w-0 leading-snug text-fg">
                      {row.name}
                      {row.note && <span className="text-fg-muted"> ({row.note})</span>}
                    </span>
                  </span>
                </td>
                <td className="px-1 py-2.5 text-right whitespace-nowrap text-fg-soft">
                  {formatSom(row.count)}
                </td>
                <td className="px-2 py-2.5 text-right whitespace-nowrap text-fg-soft">
                  {formatDecimalSom(row.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function StatusRow({ label, value, tone }: { label: string; value: ReactNode; tone: string }) {
  return (
    <li className="flex items-center justify-between gap-3 text-[13px]">
      <span className="flex min-w-0 items-center gap-2.5">
        <span aria-hidden className={cn('size-2 shrink-0 rounded-full', tone)} />
        <span className="truncate text-fg-muted">{label}</span>
      </span>
      <span className="shrink-0 font-medium text-fg">{value}</span>
    </li>
  );
}

/** Grafik `amount`ni son sifatida kutadi — satr faqat chizish uchun o'tkaziladi. */
function toChartPoints(overview: ContentOverview) {
  return overview.series.map((point) => ({
    date: point.date.slice(5).replace('-', '.'),
    amount: Number(point.amount),
  }));
}

export function ContentPage() {
  const [days, setDays] = useState('30');
  const { data, isLoading, error } = useGetContentOverviewQuery({ days: Number(days) });

  if (error) {
    return (
      <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  const change = data?.sales.change_percent;
  const changeUp = change !== null && change !== undefined && !change.startsWith('-');

  return (
    <>
      <PageHeader
        title="Kontent boshqaruvi"
        subtitle="Tayyor materiallar bo'yicha kontent statistikasi"
        actions={
          <Select
            aria-label="Davr"
            options={windowOptions}
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="w-48"
          />
        }
      />

      {isLoading || !data ? (
        <div className="flex flex-col gap-4">
          <div className="h-40 animate-pulse rounded-card border border-line bg-card" />
          <div className="h-80 animate-pulse rounded-card border border-line bg-card" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <StatCard
              label="Institutlar"
              value={formatSom(data.universities.total)}
              icon={Landmark}
              tone="bg-success/12 text-success"
              details={[
                { label: 'Faol', value: formatSom(data.universities.active) },
                { label: 'Ariza', value: formatSom(data.universities.pending_requests) },
              ]}
            />
            <StatCard
              label="Fanlar"
              value={formatSom(data.subjects.total)}
              icon={BookOpen}
              tone="bg-info/12 text-info"
              details={[
                { label: 'Faol', value: formatSom(data.subjects.active) },
                { label: 'Ariza', value: formatSom(data.subjects.pending_requests) },
              ]}
            />
            <StatCard
              label="Topshiriqlar"
              value={formatSom(data.assignments.total)}
              icon={ClipboardList}
              tone="bg-purple/12 text-purple"
              details={data.assignments.by_type.slice(0, 3).map((row) => ({
                label: assignmentTypeLabel(row.type, row.label),
                value: formatSom(row.count),
              }))}
            />
            <StatCard
              label="Variantlar"
              value={formatSom(data.variants.total)}
              icon={Layers}
              tone="bg-warning/12 text-warning"
              details={[
                { label: 'Yechimli', value: formatSom(data.variants.with_solution) },
                { label: 'Yechimsiz', value: formatSom(data.variants.without_solution) },
              ]}
            />
            <StatCard
              label="Yechimlar"
              value={formatSom(data.solutions.total)}
              icon={CircleCheck}
              tone="bg-success/12 text-success"
              details={[
                { label: 'Chop etilgan', value: formatSom(data.solutions.published) },
                { label: 'Kutilmoqda', value: formatSom(data.solutions.pending) },
              ]}
            />
            <StatCard
              label="Talab"
              value={formatSom(data.demand.total)}
              icon={Users}
              tone="bg-orange/12 text-orange"
              details={[
                { label: 'Kutilmoqda', value: formatSom(data.demand.waiting) },
                { label: 'Javob berilgan', value: formatSom(data.demand.answered) },
              ]}
            />
            <StatCard
              label="Sotuvlar"
              value={formatSom(data.sales.orders_total)}
              icon={ShoppingCart}
              tone="bg-cyan/12 text-cyan"
              details={[
                { label: 'Bu oy', value: formatSom(data.sales.orders_this_month) },
                { label: 'Bugun', value: formatSom(data.sales.orders_today) },
              ]}
            />
          </section>

          <Card className="mt-4 pb-5">
            <CardHeader title="Kunlik sotuvlar" />

            <div className="flex flex-wrap items-baseline gap-3 px-5 pt-2">
              <span className="text-[26px] leading-tight font-semibold tracking-tight text-fg">
                {formatDecimalSom(data.sales.revenue_window)}
              </span>
              {change !== null && change !== undefined && (
                <span
                  className={cn('text-sm font-medium', changeUp ? 'text-success' : 'text-danger')}
                >
                  {changeUp ? '+' : ''}
                  {change}%
                </span>
              )}
              <span className="text-[13px] text-fg-muted">
                oldingi {data.sales.window_days} kunga nisbatan (
                {formatDecimalSom(data.sales.revenue_previous_window)})
              </span>
            </div>

            <div className="px-5 pt-4">
              <SalesAreaChart data={toChartPoints(data)} />
            </div>
          </Card>

          <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <TopCard
              title="Top institutlar"
              subtitle="sotuv bo'yicha"
              countHeader="Sotuv"
              rows={data.top_universities.map((row) => ({
                id: row.id,
                name: row.short_name || row.name,
                count: row.sales,
                revenue: row.revenue,
              }))}
            />
            <TopCard
              title="Top fanlar"
              subtitle="sotuv bo'yicha"
              countHeader="Sotuv"
              rows={data.top_subjects.map((row) => ({
                id: row.id,
                name: row.name,
                note: row.university_name,
                count: row.sales,
                revenue: row.revenue,
              }))}
            />
            <TopCard
              title="Top topshiriqlar"
              subtitle="sotuv bo'yicha"
              countHeader="Sotuv"
              rows={data.top_assignments.map((row) => ({
                id: row.id,
                name: row.name,
                note: row.subject_name,
                count: row.sales,
                revenue: row.revenue,
              }))}
            />
            <TopCard
              title="Top mualliflar"
              subtitle="daromad bo'yicha"
              countHeader="Sotuv"
              rows={data.top_authors.map((row) => ({
                id: row.id,
                name: row.name || row.phone,
                note: `${row.solutions} ta yechim`,
                count: row.sales,
                revenue: row.revenue,
              }))}
            />

            <Card className="p-5">
              <h2 className="text-[15px] font-semibold text-fg">Kontent holati</h2>

              <ul className="mt-4 flex flex-col gap-3">
                <StatusRow
                  label="Chop etilgan"
                  value={formatSom(data.solutions.published)}
                  tone="bg-success"
                />
                <StatusRow
                  label="Tasdiqlangan"
                  value={formatSom(data.solutions.approved)}
                  tone="bg-info"
                />
                <StatusRow
                  label="Kutilmoqda"
                  value={formatSom(data.solutions.pending)}
                  tone="bg-warning"
                />
                <StatusRow
                  label="Rad etilgan"
                  value={formatSom(data.solutions.rejected)}
                  tone="bg-danger"
                />
                <StatusRow
                  label="Arxivlangan"
                  value={formatSom(data.solutions.archived)}
                  tone="bg-purple"
                />
                <StatusRow
                  label="Yechim so'ralgan"
                  value={formatSom(data.variants.requested)}
                  tone="bg-orange"
                />
                <StatusRow
                  label="Jami komissiya"
                  value={formatDecimalSom(data.sales.commission_total)}
                  tone="bg-cyan"
                />
              </ul>
            </Card>
          </section>
        </>
      )}
    </>
  );
}
