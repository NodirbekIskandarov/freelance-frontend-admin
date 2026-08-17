import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';

import { useRejectSolutionMutation } from './solutionsApi';

/** Backend `reason` uchun `maxLength: 1000` beradi va bo'sh qiymatni rad etadi. */
const MAX_REASON_LENGTH = 1000;

export function RejectModal({
  solutionId,
  open,
  onClose,
  onRejected,
}: {
  solutionId: string;
  open: boolean;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reject, { isLoading, error }] = useRejectSolutionMutation();
  const [reason, setReason] = useState('');

  async function handleSubmit() {
    const trimmed = reason.trim();
    if (!trimmed) return;

    try {
      await reject({ id: solutionId, reason: trimmed }).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi; yozilgan sabab formada qoladi.
      return;
    }

    onRejected();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yechimni rad etish"
      description="Sabab muallifga ko'rsatiladi, shuning uchun aniq yozing."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            onClick={() => void handleSubmit()}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? 'Yuborilmoqda…' : 'Rad etish'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextAreaField
          label="Rad etish sababi"
          required
          maxLength={MAX_REASON_LENGTH}
          placeholder="Masalan: fayl talab qilingan variantga mos kelmaydi."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        {error && (
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
