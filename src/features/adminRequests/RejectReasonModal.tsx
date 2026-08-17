import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';

/**
 * Rad etish sababi — arizalar, shikoyatlar va freelancer arizasi uchun
 * bir xil. Backend hamma joyda `{ reason }` kutadi va uni MAJBURIY
 * qiladi, shuning uchun bo'sh sabab bilan tugma bosilmaydi.
 */
export function RejectReasonModal({
  open,
  title,
  itemName,
  isLoading,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  itemName?: string;
  isLoading: boolean;
  error: unknown;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');

  function handleClose() {
    setReason('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={itemName}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            disabled={isLoading || !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
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
          maxLength={1000}
          placeholder="Sabab arizachiga ko'rsatiladi — aniq yozing."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

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
