import { Download } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { Modal } from '@/components/ui/Modal';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import {
  OFFER_STATUS_LABELS,
  TASK_STATUS_LABELS,
  type AdminTask,
  type OfferStatus,
} from '@/shared/types/adminExchange';
import { WORK_DIRECTION_LABELS } from '@/shared/types/adminFreelance';

import { useGetAdminTaskOffersQuery } from './adminExchangeApi';

const offerTones: Record<OfferStatus, BadgeTone> = {
  pending: 'warning',
  accepted: 'success',
  declined: 'danger',
  withdrawn: 'neutral',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU').slice(0, 16);
}

/**
 * Nizoni hal qilish uchun kerak bo'ladigan hamma narsa bitta ekranda:
 * kelishuv shartlari, ikkala fayl, topshirish izohi va takliflar.
 */
export function TaskDetailModal({
  task,
  onClose,
}: {
  task: AdminTask | null;
  onClose: () => void;
}) {
  const { data: offers, error } = useGetAdminTaskOffersQuery(task?.id ?? '', {
    skip: task === null,
  });

  return (
    <Modal
      open={task !== null}
      onClose={onClose}
      title={task?.title ?? ''}
      description={task ? `${task.reference} · ${TASK_STATUS_LABELS[task.status]}` : undefined}
      className="max-w-3xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Yopish
        </Button>
      }
    >
      {task && (
        <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto">
          {task.description && (
            <p className="rounded-control border border-line bg-input px-3.5 py-3 text-sm whitespace-pre-line text-fg-soft">
              {task.description}
            </p>
          )}

          <InfoList>
            <InfoRow
              label="Yo'nalish"
              value={WORK_DIRECTION_LABELS[task.direction] ?? task.direction}
            />
            <InfoRow label="Mijoz" value={task.client?.full_name ?? '—'} />
            <InfoRow label="Bajaruvchi" value={task.freelancer?.full_name ?? '—'} />
            <InfoRow
              label="Budjet / kelishilgan"
              value={`${formatDecimalSom(task.budget)} / ${formatDecimalSom(task.agreed_price)}`}
            />
            <InfoRow
              label="Komissiya"
              value={
                task.commission_amount
                  ? `${formatDecimalSom(task.commission_amount)} (${task.commission_percent}%)`
                  : '—'
              }
            />
            <InfoRow label="Freelancer ulushi" value={formatDecimalSom(task.freelancer_earning)} />
            <InfoRow
              label="Muddat"
              value={`${task.agreed_deadline_days ?? task.deadline_days} kun`}
            />
            <InfoRow label="Yaratilgan" value={formatDate(task.created_at)} />
            <InfoRow label="Boshlangan" value={formatDate(task.started_at)} />
            <InfoRow label="Topshirilgan" value={formatDate(task.delivered_at)} />
            <InfoRow label="Yakunlangan" value={formatDate(task.completed_at)} />
            {task.cancelled_at && (
              <InfoRow
                label="Bekor qilingan"
                value={`${formatDate(task.cancelled_at)}${task.cancel_reason ? ` — ${task.cancel_reason}` : ''}`}
              />
            )}
          </InfoList>

          <div className="flex flex-wrap gap-2">
            {task.task_file && (
              <a
                href={task.task_file}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-2 text-sm text-fg hover:bg-surface-hover"
              >
                <Download className="size-4" strokeWidth={1.75} />
                Topshiriq fayli
              </a>
            )}
            {task.delivery_file && (
              <a
                href={task.delivery_file}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-2 text-sm text-fg hover:bg-surface-hover"
              >
                <Download className="size-4" strokeWidth={1.75} />
                Topshirilgan ish
              </a>
            )}
          </div>

          {task.delivery_note && (
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-fg-muted uppercase">
                Topshirish izohi
              </h3>
              <p className="mt-1.5 text-sm whitespace-pre-line text-fg-soft">
                {task.delivery_note}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold tracking-wider text-fg-muted uppercase">
              Takliflar ({task.offer_count})
            </h3>

            {error !== undefined && error !== null ? (
              <p role="alert" className="mt-1.5 text-sm text-danger">
                {getApiErrorMessage(error)}
              </p>
            ) : !offers || offers.results.length === 0 ? (
              <p className="mt-1.5 text-sm text-fg-muted">Taklif yo&apos;q.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {offers.results.map((offer) => (
                  <li
                    key={offer.id}
                    className="flex flex-wrap items-center gap-3 rounded-control border border-line px-3.5 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">
                        {offer.freelancer.full_name}
                      </span>
                      <span className="block text-xs text-fg-muted">
                        reyting {offer.freelancer_rating} · {offer.freelancer_completed_jobs} ta ish
                        · {offer.deadline_days} kun
                      </span>
                      {offer.message && (
                        <span className="mt-1 block text-xs text-fg-soft">{offer.message}</span>
                      )}
                    </span>

                    <span className="text-sm font-semibold text-fg tabular-nums">
                      {formatDecimalSom(offer.price)}
                    </span>
                    <Badge tone={offerTones[offer.status]}>
                      {OFFER_STATUS_LABELS[offer.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
