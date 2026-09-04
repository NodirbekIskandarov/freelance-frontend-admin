import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminTask } from '@/shared/types/adminExchange';

import { useRefundTaskMutation } from './adminExchangeApi';

/**
 * Kafolatdagi pulni mijozga qaytarish — adminning birjadagi yagona
 * aralashuvi. Sabab MAJBURIY: bu ikkala tomonning ham pulini
 * o'zgartiradi va keyinchalik nima uchun qilinganini bilish kerak.
 */
export function RefundTaskModal({
  task,
  onClose,
}: {
  task: AdminTask | null;
  onClose: () => void;
}) {
  const [refundTask, { isLoading, error, reset }] = useRefundTaskMutation();
  const [reason, setReason] = useState('');

  function close() {
    setReason('');
    reset();
    onClose();
  }

  async function submit() {
    if (!task) return;

    try {
      await refundTask({ id: task.id, reason: reason.trim() }).unwrap();
    } catch {
      return;
    }

    close();
  }

  return (
    <Modal
      open={task !== null}
      onClose={close}
      title="Pulni mijozga qaytarish"
      description={task ? `${task.title} · ${task.reference}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            disabled={isLoading || !reason.trim()}
            onClick={() => void submit()}
          >
            {isLoading ? 'Bajarilmoqda…' : 'Qaytarish'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {task && (
          <div className="rounded-control border border-line bg-input px-3.5 py-3 text-sm">
            <p className="text-fg">
              Qaytariladigan summa:{' '}
              <span className="font-semibold">{formatDecimalSom(task.agreed_price)}</span>
            </p>
            <p className="mt-1 text-xs text-fg-muted">
              {task.client?.full_name ?? 'Mijoz'} &larr;{' '}
              {task.freelancer?.full_name ?? 'bajaruvchi'}
            </p>
          </div>
        )}

        <TextAreaField
          label="Sabab"
          required
          maxLength={255}
          placeholder="Nima uchun qaytarilyapti — ikkala tomon ham ko'radi."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        <p className="text-xs text-fg-muted">
          Topshiriq bekor qilinadi va kafolatdagi summa mijoz hamyoniga qaytariladi.
        </p>

        {error !== undefined && error !== null && (
          <p
            role="alert"
            className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {getApiErrorMessage(error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
