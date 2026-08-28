import {
  BookOpen,
  Building2,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  FileWarning,
  Layers,
  ShoppingCart,
  TriangleAlert,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';

import { RevenueBarChart } from '@/components/charts/RevenueBarChart';
import { SeriesLineChart } from '@/components/charts/SeriesLineChart';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { formatDecimalSom, formatSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminDashboard } from '@/shared/types/adminDashboard';

import { useGetAdminDashboardQuery } from '../adminFreelance/adminFreelanceApi';

const rangeOptions = [
  { value: '7', label: '7 kunlik' },
  { value: '30', label: '30 kunlik' },
  { value: '90', label: '90 kunlik' },
];

function formatThousands(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2).replace(/\.?0+$/, '')}K`;
  return String(value);
}

/**
 * Y o'qi bo'linmalari ma'lumotdan hisoblanadi.
 *
 * Ilgari ular qo'lda yozilgan edi (`[0, 250, ... 1500]`) — mock'da
 * qiymatlar shu oraliqda bo'lgani uchun mos kelardi. Haqiqiy
 * ma'lumotda kunlik son 0–2 atrofida va grafik butunlay tekis
 * chiziqqa aylanib qolardi.
 */
function ticksFor(max: number): number[] {
  const top = Math.max(4, Math.ceil(max * 1.2));
  const step = Math.ceil(top / 4);
  return [0, step, step * 2, step * 3, step * 4];
}

function CardSkeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-card border border-line bg-card ${className}`} />;
}

/**
 * Diqqat talab qiladigan navbat — nol bo'lsa ham ko'rsatiladi, lekin
 * noldan katta bo'lsa rangi bilan ajralib turadi va bosilsa o'sha
 * bo'limga olib boradi.
 */
function QueueCard({
  label,
  count,
  to,
  icon: Icon,
}: {
  label: string;
  count: number;
  to: string;
  icon: typeof Users;
}) {
  const urgent = count > 0;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-card border p-4 transition-colors ${
        urgent
          ? 'border-warning/30 bg-warning/8 hover:bg-warning/12'
          : 'border-line bg-card hover:bg-elevated'
      }`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-control ${
          urgent ? 'bg-warning/15 text-warning' : 'bg-elevated text-fg-muted'
        }`}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-semibold text-fg tabular-nums">{count}</span>
        <span className="block truncate text-xs text-fg-muted">{label}</span>
      </span>
    </Link>
  );
}

/** Grafik nuqtalarini `SeriesLineChart` kutgan shaklga o'tkazadi. */
function toSeries(
  points: { date: string; count: number }[],
  cumulative: boolean,
): { date: string; primary: number; secondary: number }[] {
  let running = 0;
  return points.map((point) => {
    running += point.count;
    return {
      date: point.date.slice(5),
      primary: cumulative ? running : point.count,
      secondary: point.count,
    };
  });
}

function Charts({ data }: { data: AdminDashboard }) {
  const userSeries = toSeries(data.series.users, true);
  const solutionSeries = toSeries(data.series.solutions, true);

  const revenueSeries = data.series.orders.map((point) => ({
    date: point.date.slice(5),
    amount: Number(point.revenue),
  }));

  return (
    <>
      <Card className="pb-5">
        <CardHeader title="Foydalanuvchilar" />
        <div className="px-5 pt-5">
          <SeriesLineChart
            data={userSeries}
            primaryLabel="Jami (to'plangan)"
            secondaryLabel="Kunlik yangi"
            primaryColor="#22C55E"
            secondaryColor="#3B82F6"
            formatY={formatThousands}
            yTicks={ticksFor(Math.max(...userSeries.map((p) => p.primary), 0))}
          />
        </div>
      </Card>

      <Card className="pb-5">
        <CardHeader title="Yechimlar" />
        <div className="px-5 pt-5">
          <SeriesLineChart
            data={solutionSeries}
            primaryLabel="Jami (to'plangan)"
            secondaryLabel="Kunlik yangi"
            primaryColor="#3B82F6"
            secondaryColor="#F59E0B"
            yTicks={ticksFor(Math.max(...solutionSeries.map((p) => p.primary), 0))}
          />
        </div>
      </Card>

      <Card className="pb-5">
        <CardHeader title="Daromad" />
        <div className="px-5 pt-5">
          <RevenueBarChart data={revenueSeries} />
        </div>
      </Card>
    </>
  );
}

export function DashboardPage() {
  const [days, setDays] = useState('30');
  const { data, isLoading, error } = useGetAdminDashboardQuery({ days: Number(days) });

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
        title="Dashboard"
        subtitle="Platforma umumiy statistikasi"
        actions={
          <Select
            aria-label="Sana oralig'i"
            options={rangeOptions}
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="w-40"
          />
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 8 }, (_, index) => (
            <CardSkeleton key={index} className="h-[118px]" />
          ))
        ) : (
          <>
            <StatCard
              label="Jami foydalanuvchilar"
              value={formatSom(data.users.total)}
              icon={Users}
              tone="success"
              trend={{ direction: 'up', value: String(data.users.new_this_month), note: 'bu oy' }}
            />
            <StatCard
              label="Faol foydalanuvchilar"
              value={formatSom(data.users.active)}
              icon={UserRound}
              tone="info"
            />
            <StatCard
              label="Xodimlar"
              value={formatSom(data.users.staff)}
              icon={UserPlus}
              tone="purple"
            />
            <StatCard
              label="E'lon qilingan yechimlar"
              value={formatSom(data.solutions.published)}
              icon={FileCheck2}
              tone="cyan"
            />
            <StatCard
              label="Institutlar"
              value={formatSom(data.catalogue.universities)}
              icon={Building2}
              tone="orange"
            />
            <StatCard
              label="Fanlar"
              value={formatSom(data.catalogue.subjects)}
              icon={BookOpen}
              tone="info"
            />
            <StatCard
              label="Topshiriq / variant"
              value={`${data.catalogue.assignments} / ${data.catalogue.variants}`}
              icon={Layers}
              tone="purple"
            />
            <StatCard
              label="Jami daromad"
              value={formatDecimalSom(data.sales.revenue)}
              icon={CircleDollarSign}
              tone="success"
              trend={{
                direction: 'up',
                value: formatDecimalSom(data.sales.revenue_this_month),
                note: 'bu oy',
              }}
            />
          </>
        )}
      </section>

      {/* Moderatsiya navbatlari — dashboarddan to'g'ridan-to'g'ri o'tiladi. */}
      <section className="mt-4">
        {isLoading || !data ? (
          <CardSkeleton className="h-[92px]" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QueueCard
              label="Kutilayotgan yechimlar"
              count={data.solutions.pending}
              to="/yechimlar"
              icon={FileCheck2}
            />
            <QueueCard
              label="Fan arizalari"
              count={data.requests.subject_pending}
              to="/fanlar/arizalar"
              icon={ClipboardList}
            />
            <QueueCard
              label="Topshiriq arizalari"
              count={data.requests.assignment_pending}
              to="/yuborilgan/topshiriqlar"
              icon={FileWarning}
            />
            <QueueCard
              label="Shikoyatlar"
              count={data.requests.report_pending}
              to="/shikoyatlar"
              icon={TriangleAlert}
            />
          </div>
        )}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {isLoading || !data ? (
          Array.from({ length: 3 }, (_, index) => (
            <CardSkeleton key={index} className="h-[340px]" />
          ))
        ) : (
          <Charts data={data} />
        )}
      </section>

      <section className="mt-4">
        {isLoading || !data ? (
          <CardSkeleton className="h-[160px]" />
        ) : (
          <Card className="pb-5">
            <CardHeader title="Sotuvlar" />
            <div className="mt-5 grid grid-cols-1 gap-4 px-5 lg:grid-cols-4">
              {[
                { label: 'Buyurtmalar', value: formatSom(data.sales.orders), icon: ShoppingCart },
                {
                  label: 'Bu oyda',
                  value: formatSom(data.sales.orders_this_month),
                  icon: ShoppingCart,
                },
                {
                  label: 'Platforma komissiyasi',
                  value: formatDecimalSom(data.sales.commission),
                  icon: CircleDollarSign,
                },
                {
                  label: 'Sotuvchilarga',
                  value: formatDecimalSom(data.sales.seller_earning),
                  icon: CircleDollarSign,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-card border border-line bg-canvas p-5">
                  <p className="text-sm text-fg-muted">{item.label}</p>
                  <p className="mt-2 text-[22px] leading-tight font-semibold tracking-tight whitespace-nowrap text-fg">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>
    </>
  );
}
