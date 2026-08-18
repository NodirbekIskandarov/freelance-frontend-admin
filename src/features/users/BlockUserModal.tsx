import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import { useState } from 'react';

import { useBlockUserMutation } from './adminUsersApi';

export function BlockUserModal({
  user,
  onClose,
}: {
  /** `null` — modal yopiq. Foydalanuvchi obyekti nomni ko'rsatish uchun. */
  user: { id: string; full_name: string; phone: string | null } | null;
  onClose: () => void;
}) {
  const [blockUser, { isLoading, error }] = useBlockUserMutation();
  const [reason, setReason] = useState('');

  async function handleSubmit() {
    if (!user) return;

    try {
      // Sabab ixtiyoriy — bo'sh bo'lsa umuman yubormaymiz.
      await blockUser({
        id: user.id,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      }).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi.
      return;
    }

    setReason('');
    onClose();
  }

  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      title="Foydalanuvchini bloklash"
      description={user ? `${user.full_name || user.phone || user.id}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={() => void handleSubmit()} disabled={isLoading}>
            {isLoading ? 'Yuborilmoqda…' : 'Bloklash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextAreaField
          label="Sabab (ixtiyoriy)"
          maxLength={500}
          placeholder="Masalan: qoidabuzarlik haqida shikoyatlar."
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
