import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  FolderOpen,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  Phone,
  Plus,
  Printer,
  Star,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Timeline } from '@/components/ui/Timeline';
import { cn } from '@/lib/cn';
import { getApiErrorMessage } from '@/shared/api';
import type { DocumentEntry, SpecialityEntry } from '@/shared/types/applicationDetail';

import { useGetFreelancerApplicationQuery } from './applicationsApi';

const tabs: TabItem[] = [
  { id: 'general', label: "Umumiy ma'lumotlar", icon: FileText },
  { id: 'specialities', label: 'Mutaxassislik(lar)', icon: Award },
  { id: 'documents', label: 'Hujjatlar', icon: FolderOpen },
  { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
  { id: 'jobs', label: 'Bajarilgan ishlar', icon: Briefcase },
  { id: 'reviews', label: 'Reyting va sharhlar', icon: Star },
  { id: 'activity', label: 'Faollik tarixi', icon: Clock },
];

const specialityTones = {
  info: 'bg-info/12 text-info',
  orange: 'bg-orange/12 text-orange',
  purple: 'bg-purple/12 text-purple',
  success: 'bg-success/12 text-success',
  cyan: 'bg-cyan/12 text-cyan',
} as const;

function SpecialityItem({ item }: { item: SpecialityEntry }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-canvas p-3.5">
      <span
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-xl',
          specialityTones[item.tone],
        )}
      >
        <Award className="size-5" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-fg">{item.name}</span>
          {item.isPrimary && (
            <Badge tone="success" className="text-[11px]">
              Asosiy
            </Badge>
          )}
        </p>
        <p className="mt-0.5 text-xs text-fg-muted">Tajribasi: {item.experience}</p>
      </div>

      <span className="flex shrink-0 items-center gap-1.5 text-sm text-fg">
        <Star className="size-4 fill-warning text-warning" strokeWidth={0} />
        {item.rating.toFixed(1)}
      </span>
    </div>
  );
}

function DocumentItem({ item }: { item: DocumentEntry }) {
  return (
    <div className="flex items-center gap-3">
      {item.thumbUrl ? (
        <img
          src={item.thumbUrl}
          alt=""
          className="h-12 w-16 shrink-0 rounded border border-line object-cover"
        />
      ) : (
        <span className="grid h-12 w-16 shrink-0 place-items-center rounded border border-line bg-canvas text-fg-dim">
          <FileText className="size-5" strokeWidth={1.75} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{item.title}</p>
        <p className="truncate text-xs text-fg-muted">{item.fileName}</p>
        <p className="mt-0.5 text-xs text-fg-dim">
          {item.format} • {item.size}
        </p>
      </div>

      <span className="flex shrink-0 items-center gap-1.5">
        <IconButton label={`${item.title} — ko'rish`} size="sm">
          <Eye className="size-4" strokeWidth={1.75} />
        </IconButton>
        <IconButton label={`${item.title} — yuklab olish`} size="sm">
          <Download className="size-4" strokeWidth={1.75} />
        </IconButton>
      </span>
    </div>
  );
}

export function ApplicationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  const { data, isLoading, error } = useGetFreelancerApplicationQuery(id, { skip: !id });

  if (error) {
    return (
      <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 w-64 animate-pulse rounded-card bg-card" />
        <div className="h-56 animate-pulse rounded-card border border-line bg-card" />
        <div className="h-96 animate-pulse rounded-card border border-line bg-card" />
      </div>
    );
  }

  const isPending = data.status === 'Kutilmoqda';

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="secondary"
            icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
            onClick={() => navigate(-1)}
          >
            Orqaga
          </Button>

          <PageHeader
            className="mb-0"
            title={
              <span className="flex flex-wrap items-center gap-3">
                Freelancer arizasi ma’lumotlari
                <StatusBadge status={data.status} />
              </span>
            }
            breadcrumbs={[
              { label: 'Bosh sahifa', to: '/' },
              { label: 'Freelancer arizalari', to: '/freelancer-arizalari' },
              { label: `Ariza ${data.displayId}` },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPending && (
            <>
              <Button variant="success" icon={<Check className="size-4" strokeWidth={2} />}>
                Tasdiqlash
              </Button>
              <Button variant="danger" icon={<X className="size-4" strokeWidth={2} />}>
                Rad etish
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            icon={<Printer className="size-4" strokeWidth={1.75} />}
            trailing={<ChevronDown className="size-4" strokeWidth={2} />}
          >
            Chop etish
          </Button>
        </div>
      </div>

      {/* Profil kartasi */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <Avatar name={data.name} src={data.avatarUrl} size="xl" />
              {data.isOnline && (
                <span className="mt-2 flex items-center justify-center gap-1.5 text-xs text-fg-muted">
                  <span aria-hidden className="size-2 rounded-full bg-success" />
                  Online
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">{data.name}</h2>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-fg">
                  <Star className="size-4 fill-warning text-warning" strokeWidth={0} />
                  {data.rating.toFixed(1)}
                </span>
                {data.badge && <Badge tone="success">{data.badge}</Badge>}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-fg-soft">
                <span className="flex items-center gap-2">
                  <Phone className="size-4 text-fg-muted" strokeWidth={1.75} />
                  {data.phone}
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="size-4 text-fg-muted" strokeWidth={1.75} />
                  {data.email}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
                {[
                  { label: 'Ariza ID', value: data.displayId },
                  { label: "Ro'yxatdan o'tgan sana", value: data.registeredAt },
                  { label: 'Oxirgi faollik', value: data.lastActiveAt },
                ].map((meta) => (
                  <div key={meta.label}>
                    <p className="text-xs text-fg-muted">{meta.label}</p>
                    <p className="mt-1 text-sm text-fg">{meta.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 xl:w-[420px]">
            <div className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success/12 text-success">
                <GraduationCap className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-fg-muted">Universitet</p>
                <p className="text-base font-semibold text-fg">{data.university.short}</p>
                <p className="truncate text-xs text-fg-muted">{data.university.full}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple/12 text-purple">
                <BookOpen className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-fg-muted">Diplom bosqichi</p>
                <p className="text-base font-semibold text-fg">{data.diplomaStage}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} className="mt-6" />

      {/*
        Dizaynda faqat "Umumiy ma'lumotlar" tabi chizilgan. Qolganlari uchun
        maketa yo'q, shuning uchun ular shu paytda bo'sh holat ko'rsatadi —
        dizayn kelgach shu yerga qo'shiladi.
      */}
      {activeTab !== 'general' ? (
        <Card className="mt-6 grid place-items-center px-6 py-20 text-center">
          <p className="text-sm font-medium text-fg-soft">
            «{tabs.find((tab) => tab.id === activeTab)?.label}» uchun dizayn berilmagan
          </p>
          <p className="mt-1 text-sm text-fg-muted">Maket kelgach shu tab to‘ldiriladi.</p>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <h3 className="mb-4 text-base font-semibold text-fg">Shaxsiy ma’lumotlar</h3>
                <InfoList>
                  <InfoRow label="Ism familiya" value={data.personal.fullName} />
                  <InfoRow label="Telefon raqami" value={data.personal.phone} />
                  <InfoRow label="Email" value={data.personal.email} />
                  <InfoRow label="Tug‘ilgan sana" value={data.personal.birthDate} />
                  <InfoRow label="Jinsi" value={data.personal.gender} />
                  <InfoRow label="Manzil" value={data.personal.address} />
                </InfoList>
              </Card>

              <Card className="p-5">
                <h3 className="mb-3 text-base font-semibold text-fg">Qisqacha ma’lumot</h3>
                <p className="text-sm leading-relaxed text-fg-muted">{data.about}</p>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-fg">Mutaxassislik(lar)</h3>
                  <Badge tone="success">{data.specialities.length} ta</Badge>
                </div>

                <div className="flex flex-col gap-2.5">
                  {data.specialities.map((item) => (
                    <SpecialityItem key={item.id} item={item} />
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-line py-3 text-sm text-fg-muted transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Plus className="size-4" strokeWidth={2} />
                  Yana mutaxassislik qo‘shish
                </button>
              </Card>

              <Card className="p-5">
                <h3 className="mb-3 text-base font-semibold text-fg">Ko‘nikmalar</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-control border border-line bg-canvas px-2.5 py-1.5 text-[13px] text-fg-soft"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <h3 className="mb-4 text-base font-semibold text-fg">Hujjatlar</h3>

                <div className="flex flex-col gap-4">
                  {data.documents.map((item) => (
                    <DocumentItem key={item.id} item={item} />
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center gap-2 border-t border-line pt-4 text-sm text-fg-soft transition-colors hover:text-primary"
                >
                  <Download className="size-4" strokeWidth={1.75} />
                  Barchasini yuklab olish
                </button>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-fg">Portfolio</h3>
                  <Badge tone="success">{data.portfolio.total} ta loyiha</Badge>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {data.portfolio.previews.map((preview, index) =>
                    preview ? (
                      <img
                        key={index}
                        src={preview}
                        alt=""
                        className="aspect-square w-full rounded object-cover"
                      />
                    ) : (
                      <span
                        key={index}
                        className="grid aspect-square w-full place-items-center rounded border border-line bg-canvas text-fg-dim"
                      >
                        <ImageIcon className="size-4" strokeWidth={1.75} />
                      </span>
                    ),
                  )}

                  {data.portfolio.total > data.portfolio.previews.length && (
                    <span className="grid aspect-square w-full place-items-center rounded border border-line bg-elevated text-sm font-medium text-fg-soft">
                      +{data.portfolio.total - data.portfolio.previews.length}
                    </span>
                  )}
                </div>

                <Link
                  to="#"
                  className="mt-4 flex items-center justify-center gap-2 border-t border-line pt-4 text-sm text-fg-soft transition-colors hover:text-primary"
                >
                  Barchasini ko‘rish
                  <ArrowRight className="size-4" strokeWidth={1.75} />
                </Link>
              </Card>
            </div>
          </div>

          <Card className="mt-4 p-5">
            <h3 className="mb-4 text-base font-semibold text-fg">Faollik tarixi</h3>
            <Timeline entries={data.timeline} />
          </Card>
        </>
      )}
    </>
  );
}
