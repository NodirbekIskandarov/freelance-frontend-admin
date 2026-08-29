import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { SegmentedControl } from '@/components/ui/Choice';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminWallet } from '@/shared/types/adminWallet';

import { useTopupWalletMutation } from './adminWalletApi';

/** Ko'p uchraydigan summalar — qo'lda terishni tezlashtiradi. */
const PRESETS = ['20000', '50000', '100000', '200000', '500000'];

/**
 * Balansni to'ldirish — tashqarida kelgan pulni yozish.
 *
 * `AdjustWalletModal` dan ATAYLAB alohida. Tuzatish xatoni to'g'rilaydi va
 * ikki tomonga ishlaydi; to'ldirish esa haqiqatan kelgan pulni (naqd olindi,
 * qo'lda o'tkazma) yozadi va faqat qo'shadi. Bitta oynaga yig'ilsa, jurnal
 * «bu balans qayerdan keldi» degan savolga javob bera olmasdi — ikkalasi
 * ham «tuzatish» bo'lib qolardi.
 */
export function TopupWalletModal({
  wallet,
  onClose,
}: {
  wallet: AdminWallet | null;
  onClose: () => void;
}) {
  const [topupWallet, { isLoading, error, reset }] = useTopupWalletMutation();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  function close() {
    setAmount('');
    setDescription('');
    reset();
    onClose();
  }

  async function submit() {
    if (!wallet) return;

    try {
      await topupWallet({
        id: wallet.id,
        amount: amount.trim(),
        description: description.trim(),
      }).unwrap();
    } catch {
      return;
    }

    close();
  }

  const value = Number(amount);
  const preview =
    wallet && Number.isFinite(value) && value > 0
      ? formatDecimalSom(String(Number(wallet.balance) + value))
      : null;

  return (
    <Modal
      open={wallet !== null}
      onClose={close}
      title="Balansni to'ldirish"
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
            disabled={isLoading || !(value > 0) || !description.trim()}
            onClick={() => void submit()}
          >
            {isLoading ? 'Bajarilmoqda…' : "To'ldirish"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SegmentedControl
          label="Ko'p uchraydiganlari"
          options={PRESETS}
          value={amount}
          onChange={setAmount}
        />

        <TextField
          label="Summa (so'm)"
          required
          type="number"
          min={0}
          step={1000}
          placeholder="100000"
          value={amount}
          hint={preview ? `To'ldirilgandan keyin: ${preview}` : undefined}
          onChange={(event) => setAmount(event.target.value)}
        />

        <TextAreaField
          label="Pul qayerdan keldi"
          required
          maxLength={255}
          placeholder="Masalan: naqd olindi, 29.08 — kvitansiya №142"
          value={description}
          hint="Tranzaksiya tarixida qoladi va foydalanuvchiga xabar bo'lib boradi."
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
