import {
  BarChart3,
  Briefcase,
  Calendar,
  CircleDollarSign,
  RefreshCw,
  ShoppingCart,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { RevenueBarChart } from '@/components/charts/RevenueBarChart';
import { SeriesLineChart } from '@/components/charts/SeriesLineChart';
import { Sparkline } from '@/components/charts/Sparkline';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { StatCard, type StatTone } from '@/components/ui/StatCard';
import { getApiErrorMessage } from '@/shared/api';

import { useGetDashboardQuery } from './dashboardApi';

/**
 * Stat kartaning ikonkasi va rangi API'dan emas, shu yerdan keladi —
 * backend ko'rinishni bilmasligi kerak, u faqat `key` yuboradi.
 */
const statStyles: Record<string, { icon: LucideIcon; tone: StatTone }> = {
  'total-users': { icon: Users, tone: 'success' },
  'total-freelancers': { icon: UserRound, tone: 'info' },
  'new-users': { icon: UserPlus, tone: 'purple' },
  'new-jobs': { icon: Briefcase, tone: 'orange' },
  'active-jobs': { icon: RefreshCw, tone: 'cyan' },
  'materials-sold': { icon: ShoppingCart, tone: 'warning' },
  'total-revenue': { icon: CircleDollarSign, tone: 'success' },
  'avg-daily-revenue': { icon: BarChart3, tone: 'purple' },
};

const sparkColors: Record<string, string> = {
  today: '#22C55E',
  month: '#A855F7',
  'all-time': '#3B82F6',
};

const rangeOptions = [
  { value: '7', label: '7 kunlik' },
  { value: '30', label: '30 kunlik' },
  { value: '90', label: '90 kunlik' },
];

function formatThousands(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2).replace(/\.?0+$/, '')}K`;
  return String(value);
}

function CardSkeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-card border border-line bg-card ${className}`} />;
}

export function DashboardPage() {
  const { data, isLoading, error } = useGetDashboardQuery();

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
            options={[{ value: 'today', label: '11-iyul, 2025' }]}
            icon={<Calendar className="size-4" strokeWidth={1.75} />}
            className="w-56"
          />
        }
      />

      {/* 8 ta stat karta — dizaynda 4 ustun, 2 qator */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }, (_, index) => <CardSkeleton key={index} className="h-[118px]" />)
          : data?.stats.map((stat) => {
              const style = statStyles[stat.key] ?? { icon: Users, tone: 'info' as StatTone };
              return (
                <StatCard
                  key={stat.key}
                  label={stat.label}
                  value={stat.value}
                  icon={style.icon}
                  tone={style.tone}
                  trend={stat.trend}
                />
              );
            })}
      </section>

      {/* 3 ta grafik */}
      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {isLoading || !data ? (
          Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} className="h-[340px]" />)
        ) : (
          <>
            <Card className="pb-5">
              <CardHeader
                title="Foydalanuvchilar statistikasi"
                action={<Select options={rangeOptions} size="sm" defaultValue="7" />}
              />
              <div className="px-5 pt-5">
                <SeriesLineChart
                  data={data.userSeries}
                  primaryLabel="Jami foydalanuvchilar"
                  secondaryLabel="Yangi foydalanuvchilar"
                  primaryColor="#22C55E"
                  secondaryColor="#3B82F6"
                  formatY={formatThousands}
                  yTicks={[0, 250, 500, 750, 1000, 1250, 1500]}
                />
              </div>
            </Card>

            <Card className="pb-5">
              <CardHeader
                title="Ishlar statistikasi"
                action={<Select options={rangeOptions} size="sm" defaultValue="7" />}
              />
              <div className="px-5 pt-5">
                <SeriesLineChart
                  data={data.jobSeries}
                  primaryLabel="Tushgan ishlar"
                  secondaryLabel="Bajarilayotgan ishlar"
                  primaryColor="#3B82F6"
                  secondaryColor="#F59E0B"
                  yTicks={[0, 20, 40, 60, 80, 100, 120]}
                />
              </div>
            </Card>

            <Card className="pb-5">
              <CardHeader
                title="Daromad statistikasi"
                action={<Select options={rangeOptions} size="sm" defaultValue="30" />}
              />
              <div className="px-5 pt-5">
                <RevenueBarChart data={data.revenueSeries} />
              </div>
            </Card>
          </>
        )}
      </section>

      {/* Daromadlar umumiy ko'rinishi */}
      <section className="mt-4">
        {isLoading || !data ? (
          <CardSkeleton className="h-[220px]" />
        ) : (
          <Card className="pb-5">
            <CardHeader title="Daromadlar umumiy ko‘rinishi" />
            <div className="mt-5 grid grid-cols-1 gap-4 px-5 lg:grid-cols-3">
              {data.revenueSummary.map((item) => (
                <div key={item.key} className="rounded-card border border-line bg-canvas p-5">
                  <p className="text-sm text-fg-muted">{item.label}</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      {/* Summa bir qatorda qolishi kerak — dizaynda ham shunday. */}
                      <p className="text-[22px] leading-tight font-semibold tracking-tight whitespace-nowrap text-fg">
                        {item.value}
                      </p>
                      <p className="mt-1.5 text-[13px] whitespace-nowrap">
                        <span className="font-medium text-success">↑ {item.changeValue}</span>{' '}
                        <span className="text-fg-muted">{item.changeNote}</span>
                      </p>
                    </div>
                    <div className="w-[42%] max-w-[170px] shrink-0">
                      <Sparkline data={item.spark} color={sparkColors[item.key] ?? '#22C55E'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>
    </>
  );
}
