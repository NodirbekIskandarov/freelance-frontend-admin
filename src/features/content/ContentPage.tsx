import {
  ArrowRight,
  BookOpen,
  Calendar,
  CircleCheck,
  ClipboardList,
  Landmark,
  Layers,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';

import { SalesAreaChart } from '@/components/charts/SalesAreaChart';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';
import { formatSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import type { ContentStat, ContentStatusRow, TopBlock } from '@/shared/types/content';

import { useGetContentOverviewQuery } from './contentApi';

const statStyles: Record<string, { icon: LucideIcon; tone: string }> = {
  institutes: { icon: Landmark, tone: 'bg-success/12 text-success' },
  subjects: { icon: BookOpen, tone: 'bg-info/12 text-info' },
  tasks: { icon: ClipboardList, tone: 'bg-purple/12 text-purple' },
  variants: { icon: Layers, tone: 'bg-warning/12 text-warning' },
  solutions: { icon: CircleCheck, tone: 'bg-success/12 text-success' },
  requested: { icon: Users, tone: 'bg-orange/12 text-orange' },
  sales: { icon: ShoppingCart, tone: 'bg-cyan/12 text-cyan' },
};

const dotTones: Record<ContentStatusRow['tone'], string> = {
  success: 'bg-success',
  info: 'bg-info',
  purple: 'bg-purple',
  warning: 'bg-warning',
  orange: 'bg-orange',
  danger: 'bg-danger',
  cyan: 'bg-cyan',
};

/**
 * Dashboard'dagi StatCard'dan farqi: qiymat ostida bir necha izoh qatori bor
 * va kartalar bir qatorda ettitadan turadi, shuning uchun ular ancha tor.
 */
function ContentStatCard({ stat }: { stat: ContentStat }) {
  const style = statStyles[stat.key] ?? { icon: Landmark, tone: 'bg-info/12 text-info' };
  const Icon = style.icon;

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', style.tone)}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <p className="min-w-0 text-[13px] leading-snug text-fg-muted">{stat.label}</p>
      </div>

      <p className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-fg">
        {stat.value}
      </p>

      <dl className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
        {stat.details.map((detail) => (
          <div key={detail.label} className="flex items-center justify-between gap-2 text-xs">
            <dt className="truncate text-fg-muted">{detail.label}:</dt>
            <dd className="shrink-0 font-medium text-fg-soft">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TopCard({ block }: { block: TopBlock }) {
  return (
    <Card className="flex flex-col">
      <div className="px-5 pt-5">
        <h2 className="text-[15px] font-semibold text-fg">
          {block.title}{' '}
          {block.subtitle && <span className="font-normal text-fg-muted">{block.subtitle}</span>}
        </h2>
      </div>

      {/*
        `table-fixed` shart: karta tor (~245px), avtomatik kenglikda uchinchi
        ustun kartadan chiqib ketadi. Belgilangan kenglik bilan nom qisqaradi,
        raqamlar esa to'liq ko'rinadi.
      */}
      <table className="mt-4 w-full table-fixed text-xs">
        <thead>
          <tr className="border-b border-line text-[11px] text-fg-muted">
            <th scope="col" className="px-2 pb-2 text-left font-medium">
              {block.columns[0]}
            </th>
            <th scope="col" className="w-11 px-1 pb-2 text-right font-medium">
              {block.columns[1]}
            </th>
            <th scope="col" className="w-[72px] px-2 pb-2 text-right font-medium">
              {block.columns[2]}
            </th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, index) => (
            <tr key={row.id} className="border-b border-line last:border-b-0">
              <td className="px-2 py-2.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 shrink-0 text-[11px] text-fg-dim">{index + 1}</span>
                  <Avatar name={row.name} src={row.avatarUrl} size="sm" className="size-5" />
                  {/*
                    Nom kesilmaydi, o'raladi — dizaynda ham "Hisoblash
                    matematikasi" ikki qatorda turadi. Izoh alohida qator emas,
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
                {formatSom(row.income)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link
        to="#"
        className="mt-auto flex items-center justify-center gap-2 border-t border-line py-3.5 text-[13px] text-fg-soft transition-colors hover:text-primary"
      >
        Barchasini ko‘rish
        <ArrowRight className="size-4" strokeWidth={1.75} />
      </Link>
    </Card>
  );
}

export function ContentPage() {
  const { data, isLoading, error } = useGetContentOverviewQuery();

  if (error) {
    return (
      <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Kontent boshqaruvi"
        subtitle="Tayyor materialar bo‘yicha kontent statistikasi"
        actions={
          <Select
            aria-label="Sana oralig'i"
            options={[{ value: 'range', label: '01.07.2025 - 11.07.2025' }]}
            icon={<Calendar className="size-4" strokeWidth={1.75} />}
            className="w-64"
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
          {/* 7 ta stat karta — dizaynda bitta qatorda */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {data.stats.map((stat) => (
              <ContentStatCard key={stat.key} stat={stat} />
            ))}
          </section>

          <Card className="mt-4 pb-5">
            <CardHeader
              title="Kundalik sotuvlar"
              action={
                <Select
                  aria-label="Davr"
                  size="sm"
                  options={[
                    { value: 'daily', label: 'Kunlik' },
                    { value: 'weekly', label: 'Haftalik' },
                    { value: 'monthly', label: 'Oylik' },
                  ]}
                />
              }
            />

            <div className="flex flex-wrap items-baseline gap-3 px-5 pt-2">
              <span className="text-[26px] leading-tight font-semibold tracking-tight text-fg">
                {data.sales.total}
              </span>
              <span className="text-sm font-medium text-success">{data.sales.changePercent}</span>
              <span className="text-[13px] text-fg-muted">{data.sales.changeNote}</span>
            </div>

            <div className="px-5 pt-4">
              <SalesAreaChart data={data.sales.points} />
            </div>
          </Card>

          <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {data.topBlocks.map((block) => (
              <TopCard key={block.key} block={block} />
            ))}

            <Card className="p-5">
              <h2 className="text-[15px] font-semibold text-fg">Kontent holati</h2>

              <ul className="mt-4 flex flex-col gap-3">
                {data.contentStatus.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 text-[13px]"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden
                        className={cn('size-2 shrink-0 rounded-full', dotTones[row.tone])}
                      />
                      <span className="truncate text-fg-muted">{row.label}</span>
                    </span>
                    <span className="shrink-0 font-medium text-fg">{row.value}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </>
      )}
    </>
  );
}
