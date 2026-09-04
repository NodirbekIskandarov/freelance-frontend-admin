import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import { WITHDRAWAL_METHOD_LABELS, type AdminWithdrawal } from '@/shared/types/adminWallet';

import { usePayWithdrawalMutation, useRejectWithdrawalMutation } from './adminWalletApi';

/**
 * To'lash va rad etish bitta modal: ekran bir xil, farq faqat izohning
 * majburiyligida. Rad etilganda summa hamyonga QAYTADI, shuning uchun
 * sabab shart; to'langanda esa izoh ixtiyoriy (chek raqami va h.k.).
 */
export function WithdrawalNoteModal({
  action,
  onClose,
}: {
  action: { row: AdminWithdrawal; kind: 'pay' | 'reject' } | null;
  onClose: () => void;
}) {
  const [pay, payState] = usePayWithdrawalMutation();
  const [rejectWithdrawal, rejectState] = useRejectWithdrawalMutation();
  const [note, setNote] = useState('');

  const isReject = action?.kind === 'reject';
  const state = isReject ? rejectState : payState;

  function close() {
    setNote('');
    payState.reset();
    rejectState.reset();
    onClose();
  }

  async function submit() {
    if (!action) return;

    const trimmed = note.trim();
    try {
      if (action.kind === 'reject') {
        await rejectWithdrawal({ id: action.row.id, note: trimmed }).unwrap();
      } else {
        await pay({ id: action.row.id, ...(trimmed ? { note: trimmed } : {}) }).unwrap();
      }
    } catch {
      return;
    }

    close();
  }

  return (
    <Modal
      open={action !== null}
      onClose={close}
      title={isReject ? "So'rovni rad etish" : "To'lovni tasdiqlash"}
      description={
        action
          ? `${action.row.user.full_name || action.row.user.phone} · ${formatDecimalSom(action.row.amount)}`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Bekor qilish
          </Button>
          <Button
            variant={isReject ? 'danger' : 'primary'}
            disabled={state.isLoading || (isReject && !note.trim())}
            onClick={() => void submit()}
          >
            {state.isLoading ? 'Bajarilmoqda…' : isReject ? 'Rad etish' : 'Tasdiqlash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {action && (
          <div className="rounded-control border border-line bg-input px-3.5 py-3 text-sm">
            <p className="text-fg">
              {WITHDRAWAL_METHOD_LABELS[action.row.method]}:{' '}
              <span className="font-mono">{action.row.destination}</span>
            </p>
            {action.row.destination_name && (
              <p className="mt-1 text-fg-muted">{action.row.destination_name}</p>
            )}
            <p className="mt-1 text-xs text-fg-muted">
              Hozirgi balans: {formatDecimalSom(action.row.balance)} · {action.row.reference}
            </p>
          </div>
        )}

        <TextAreaField
          label="Izoh"
          required={isReject}
          maxLength={500}
          placeholder={
            isReject
              ? "Sabab foydalanuvchiga ko'rinadi — aniq yozing."
              : "Chek raqami yoki o'tkazma haqida qisqa izoh (ixtiyoriy)."
          }
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />

        {isReject && (
          <p className="text-xs text-fg-muted">
            Rad etilgach so&apos;ralgan summa foydalanuvchi hamyoniga qaytariladi.
          </p>
        )}

        {state.error !== undefined && state.error !== null && (
          <p
            role="alert"
            className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {getApiErrorMessage(state.error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
