import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminWallet } from '@/shared/types/adminWallet';

import { useAdjustWalletMutation } from './adminWalletApi';

/**
 * Qo'lda tuzatish — balansni oshirish yoki kamaytirish.
 *
 * Summa MANFIY ham bo'lishi mumkin, shuning uchun `type="number"`da
 * `min` qo'yilmagan. Yo'nalish tugma bilan tanlanadi: qo'lda minus
 * yozish osongina unutiladi va pul noto'g'ri tomonga ketardi.
 */
export function AdjustWalletModal({
  wallet,
  onClose,
}: {
  wallet: AdminWallet | null;
  onClose: () => void;
}) {
  const [adjustWallet, { isLoading, error, reset }] = useAdjustWalletMutation();
  const [direction, setDirection] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  function close() {
    setAmount('');
    setDescription('');
    setDirection('credit');
    reset();
    onClose();
  }

  async function submit() {
    if (!wallet) return;

    const value = amount.trim();
    try {
      await adjustWallet({
        id: wallet.id,
        amount: direction === 'debit' ? `-${value}` : value,
        description: description.trim(),
      }).unwrap();
    } catch {
      return;
    }

    close();
  }

  return (
    <Modal
      open={wallet !== null}
      onClose={close}
      title="Balansni tuzatish"
      description={
        wallet
          ? `${wallet.user.full_name || wallet.user.phone} · ${formatDecimalSom(wallet.balance)}`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Bekor qilish
          </Button>
          <Button
            variant="primary"
            disabled={isLoading || !amount.trim() || !description.trim()}
            onClick={() => void submit()}
          >
            {isLoading ? 'Bajarilmoqda…' : 'Tasdiqlash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button
            variant={direction === 'credit' ? 'primary' : 'secondary'}
            onClick={() => setDirection('credit')}
          >
            Qo&apos;shish
          </Button>
          <Button
            variant={direction === 'debit' ? 'danger' : 'secondary'}
            onClick={() => setDirection('debit')}
          >
            Yechish
          </Button>
        </div>

        <TextField
          label="Summa (so'm)"
          required
          type="number"
          min={0}
          step={1000}
          placeholder="50000"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <TextAreaField
          label="Izoh"
          required
          maxLength={255}
          placeholder="Nima uchun tuzatilyapti — tranzaksiya tarixida qoladi."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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
