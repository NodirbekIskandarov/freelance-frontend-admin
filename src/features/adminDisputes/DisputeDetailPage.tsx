import { ArrowLeft, Download, Gavel } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextAreaField } from '@/components/ui/Field';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { useLocaleNavigate } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { formatDateTime, formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_RESOLUTION_HINTS,
  DISPUTE_RESOLUTION_LABELS,
  DISPUTE_RESOLUTIONS,
  DISPUTE_STATUS_LABELS,
  type Dispute,
  type DisputeResolution,
} from '@/shared/types/disputes';

import { disputeTones } from './DisputesPage';
import { useGetDisputeQuery, useResolveDisputeMutation } from './disputesApi';

/** Bir tomonning tarixi — kim bilan ish ko'rilayotgani. */
function PartyCard({
  title,
  name,
  phone,
  lines,
}: {
  title: string;
  name: string;
  phone: string;
  lines: string[];
}) {
  return (
    <div className="rounded-control border border-line p-4">
      <p className="text-[11px] font-medium tracking-wider text-fg-muted uppercase">{title}</p>
      <p className="mt-2 text-sm font-semibold text-fg">{name || phone}</p>
      <p className="text-xs text-fg-muted">{phone}</p>
      <p className="mt-1.5 text-xs text-fg-muted">{lines.join(' · ')}</p>
    </div>
  );
}

/**
 * Qaror natijasini OLDINDAN aytadi.
 *
 * Pul harakati orqaga qaytmaydi, shuning uchun moderator «Qarorni qo'llash»
 * ni bosishdan oldin aynan qaysi summa qayerga ketishini o'qishi kerak.
 */
function outcomeOf(dispute: Dispute, resolution: DisputeResolution): string {
  const price = formatDecimalSom(dispute.unit_price);
  const earning = formatDecimalSom(dispute.seller_earning);
  const halfPrice = formatDecimalSom(String(Number(dispute.unit_price) / 2));
  const halfEarning = formatDecimalSom(String(Number(dispute.seller_earning) / 2));

  switch (resolution) {
    case 'full_refund':
      return `Xaridorga ${price} balansiga qaytariladi, muallif hech nima olmaydi, platforma ulushi ham qaytariladi.`;
    case 'partial_refund':
      return `Xaridorga ${halfPrice} qaytariladi, muallifga ${halfEarning} beriladi.`;
    case 'replace':
      return `Sotuv qoladi: muallifga ${earning} beriladi va undan tuzatilgan fayl so'raladi.`;
    case 'dismissed':
      return `Pul qaytarilmaydi, muallifga ${earning} to'liq beriladi.`;
  }
}

export function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useLocaleNavigate();

  const { data, isLoading, error } = useGetDisputeQuery(id ?? '', { skip: !id });
  const [resolve, { isLoading: isResolving, error: resolveError }] = useResolveDisputeMutation();

  const [resolution, setResolution] = useState<DisputeResolution>('full_refund');
  const [note, setNote] = useState('');
  const [unpublish, setUnpublish] = useState(false);
  const [requestFix, setRequestFix] = useState(false);
  const [warnAuthor, setWarnAuthor] = useState(false);

  if (!id) return <Navigate to="/xarid-shikoyatlari" replace />;

  const crumbs = [
    { label: 'Bosh sahifa', to: '/' },
    { label: 'Xarid shikoyatlari', to: '/xarid-shikoyatlari' },
    { label: data?.solution_title ?? 'Shikoyat' },
  ];

  if (error) {
    return (
      <>
        <PageHeader title="Shikoyat" breadcrumbs={crumbs} />
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      </>
    );
  }

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Shikoyat" breadcrumbs={crumbs} />
        <div className="h-64 animate-pulse rounded-card bg-elevated" />
      </>
    );
  }

  const closed = data.status === 'resolved' || data.status === 'rejected';

  async function handleResolve() {
    try {
      await resolve({
        id: id!,
        resolution,
        note: note.trim(),
        unpublish,
        request_fix: requestFix,
        warn_author: warnAuthor,
      }).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi.
    }
  }

  return (
    <>
      <PageHeader
        title={DISPUTE_REASON_LABELS[data.reason] ?? 'Shikoyat'}
        subtitle={data.solution_title}
        breadcrumbs={crumbs}
        actions={
          <>
            <Badge tone={disputeTones[data.status]}>
              {DISPUTE_STATUS_LABELS[data.status] ?? data.status}
            </Badge>
            <Button
              variant="secondary"
              icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
              onClick={() => void navigate('/xarid-shikoyatlari')}
            >
              Navbat
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <PartyCard
                title="Xaridor"
                name={data.buyer?.full_name ?? ''}
                phone={data.buyer?.phone ?? ''}
                lines={[
                  `${data.buyer_purchase_count} xarid`,
                  `${data.buyer_dispute_count} shikoyati`,
                ]}
              />
              <PartyCard
                title="Muallif"
                name={data.seller?.full_name ?? ''}
                phone={data.seller?.phone ?? ''}
                lines={[
                  `${data.seller_solution_count} yechim`,
                  `${data.seller_dispute_count} shikoyat (${data.seller_upheld_count} tasdiqlangan)`,
                ]}
              />
            </div>

            <p className="mt-5 text-[11px] font-medium tracking-wider text-fg-muted uppercase">
              Xaridor izohi
            </p>
            <blockquote className="mt-2 border-l-2 border-primary/50 pl-3.5 text-sm leading-relaxed whitespace-pre-line text-fg-soft">
              {data.description}
            </blockquote>

            {data.evidence.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.evidence.map((item, index) => (
                  <a
                    key={item.id}
                    href={item.file}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line px-3 text-xs font-medium text-fg-soft transition-colors hover:bg-elevated hover:text-fg"
                  >
                    <Download className="size-3.5" strokeWidth={1.75} />
                    Dalil {index + 1}
                  </a>
                ))}
              </div>
            )}

            <p className="mt-4 text-xs text-fg-muted">
              Yuborilgan: {formatDateTime(data.created_at)}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-fg">Muallif javobi</h2>
            {data.author_response ? (
              <>
                <blockquote className="mt-3 border-l-2 border-line pl-3.5 text-sm leading-relaxed whitespace-pre-line text-fg-soft">
                  {data.author_response}
                </blockquote>
                <p className="mt-2 text-xs text-fg-muted">
                  {formatDateTime(data.author_responded_at)}
                </p>
              </>
            ) : (
              /* Javobsizlik ham ma'lumot: muddat o'tgan bo'lsa moderator
                 muallifni kutmasdan qaror qabul qiladi. */
              <p className="mt-3 text-sm text-fg-muted">
                Javob yo&apos;q. Muddat: {formatDateTime(data.respond_deadline)}
              </p>
            )}
          </Card>

          {closed && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-fg">Qaror</h2>
              <InfoList className="mt-4">
                <InfoRow
                  label="Natija"
                  value={
                    DISPUTE_RESOLUTION_LABELS[data.resolution as DisputeResolution] ??
                    data.resolution ??
                    '—'
                  }
                />
                <InfoRow label="Qaytarilgan" value={formatDecimalSom(data.refunded_amount)} />
                <InfoRow label="Qachon" value={formatDateTime(data.resolved_at)} />
                <InfoRow
                  label="Kim"
                  value={data.resolved_by?.full_name || data.resolved_by?.phone || '—'}
                />
              </InfoList>
              {data.resolution_note && (
                <p className="mt-4 text-sm whitespace-pre-line text-fg-soft">
                  {data.resolution_note}
                </p>
              )}
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="text-[11px] font-medium tracking-wider text-fg-muted uppercase">
              Pul holati
            </h2>
            <InfoList className="mt-3">
              <InfoRow label="Xarid summasi" value={formatDecimalSom(data.unit_price)} />
              <InfoRow
                label="Muallif ulushi"
                value={
                  <span className={data.earning_held ? 'text-warning' : 'text-fg'}>
                    {formatDecimalSom(data.seller_earning)}
                    {data.earning_held ? ' muzlatilgan' : ''}
                  </span>
                }
              />
              <InfoRow label="Platforma ulushi" value={formatDecimalSom(data.commission_amount)} />
            </InfoList>
          </Card>

          {!closed && (
            <Card className="p-5">
              <h2 className="text-[11px] font-medium tracking-wider text-fg-muted uppercase">
                Qaror
              </h2>

              <div className="mt-3 flex flex-col gap-2">
                {DISPUTE_RESOLUTIONS.map((option) => {
                  const isSelected = option === resolution;
                  return (
                    <label
                      key={option}
                      className={cn(
                        'flex cursor-pointer items-start gap-2.5 rounded-control border px-3.5 py-3 transition-colors',
                        isSelected
                          ? 'border-primary/60 bg-primary/8'
                          : 'border-line hover:bg-elevated',
                      )}
                    >
                      <input
                        type="radio"
                        name="dispute-resolution"
                        className="mt-0.5 accent-primary"
                        checked={isSelected}
                        onChange={() => setResolution(option)}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-fg">
                          {DISPUTE_RESOLUTION_LABELS[option]}
                        </span>
                        <span className="block text-xs text-fg-muted">
                          {DISPUTE_RESOLUTION_HINTS[option]}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Choralar qarordan MUSTAQIL: xato yuklash faqat qaytarishga
                  arziydi, o'g'irlangan ish esa xaridor haqi qaytarilganda
                  ham chora talab qiladi. */}
              <p className="mt-5 text-[11px] font-medium tracking-wider text-fg-muted uppercase">
                Qo&apos;shimcha chora
              </p>
              <div className="mt-2 flex flex-col gap-2.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fg-soft">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={unpublish}
                    onChange={(event) => setUnpublish(event.target.checked)}
                  />
                  Yechimni sotuvdan olib qo&apos;yish
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fg-soft">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={requestFix}
                    onChange={(event) => setRequestFix(event.target.checked)}
                  />
                  Muallifga tuzatish so&apos;rovi yuborish
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fg-soft">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={warnAuthor}
                    onChange={(event) => setWarnAuthor(event.target.checked)}
                  />
                  Muallifga ogohlantirish (3 ta = blok)
                </label>
              </div>

              <TextAreaField
                className="mt-4"
                label="Izoh"
                maxLength={2000}
                placeholder="Qaror sababi — ikkala tomon xabarida qoladi."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />

              {/* Pul orqaga qaytmaydi — natija bosishdan OLDIN yoziladi. */}
              <p className="mt-4 rounded-control border border-primary/25 bg-primary/8 px-3.5 py-3 text-sm text-fg-soft">
                {outcomeOf(data, resolution)}
              </p>

              {resolveError !== undefined && resolveError !== null && (
                <p
                  role="alert"
                  className="mt-3 rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
                >
                  {getApiErrorMessage(resolveError)}
                </p>
              )}

              <Button
                className="mt-4 w-full"
                icon={<Gavel className="size-4" strokeWidth={1.75} />}
                disabled={isResolving}
                onClick={() => void handleResolve()}
              >
                {isResolving ? 'Qo’llanmoqda…' : "Qarorni qo'llash"}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
