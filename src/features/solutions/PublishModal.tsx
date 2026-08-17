import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';

import { usePublishSolutionMutation } from './solutionsApi';

/**
 * Narx va komissiya SATR sifatida yuboriladi.
 *
 * Backend `DecimalField` kutadi (`^-?\d{0,10}(?:\.\d{0,2})?$`). Qiymatni
 * `Number`ga o'tkazib qaytarish katta summalarda aniqlikni yo'qotardi,
 * shuning uchun kiritilgan matn faqat tekshiriladi va o'zgarishsiz ketadi.
 */
const PRICE_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;
const PERCENT_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;

export function PublishModal({
  solutionId,
  open,
  onClose,
  onPublished,
}: {
  solutionId: string;
  open: boolean;
  onClose: () => void;
  onPublished: () => void;
}) {
  const [publish, { isLoading, error }] = usePublishSolutionMutation();

  const [price, setPrice] = useState('');
  const [commission, setCommission] = useState('10');
  const [touched, setTouched] = useState(false);

  const priceError =
    touched && !PRICE_PATTERN.test(price.trim())
      ? "Narxni raqamda kiriting (masalan 25000 yoki 25000.50)"
      : undefined;

  const commissionValue = Number(commission);
  const commissionError =
    touched &&
    (!PERCENT_PATTERN.test(commission.trim()) || commissionValue < 0 || commissionValue > 100)
      ? "Komissiya 0–100 oralig'ida bo'lishi kerak"
      : undefined;

  const canSubmit = PRICE_PATTERN.test(price.trim()) && !commissionError && commissionValue <= 100;

  // Sotuvchiga qoladigan summa — admin nima e'lon qilayotganini bosishdan
  // oldin ko'rsin.
  const payout =
    PRICE_PATTERN.test(price.trim()) && !commissionError
      ? String(Math.round(Number(price) * (1 - commissionValue / 100) * 100) / 100)
      : null;

  async function handleSubmit() {
    setTouched(true);
    if (!canSubmit) return;

    try {
      await publish({
        id: solutionId,
        price: price.trim(),
        commission_percent: commission.trim(),
      }).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi (masalan variant to'lgan bo'lsa).
      return;
    }

    onPublished();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yechimni e'lon qilish"
      description="Sotuv narxi va platforma komissiyasini belgilang."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isLoading}>
            {isLoading ? 'Yuborilmoqda…' : "E'lon qilish"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Sotuv narxi"
          required
          inputMode="decimal"
          placeholder="25000"
          value={price}
          error={priceError}
          hint="So'mda, kasr qismisiz yoki ikki xonagacha."
          onChange={(event) => setPrice(event.target.value)}
        />

        <TextField
          label="Platforma komissiyasi (%)"
          required
          inputMode="decimal"
          placeholder="10"
          value={commission}
          error={commissionError}
          onChange={(event) => setCommission(event.target.value)}
        />

        {payout !== null && (
          <p className="rounded-control border border-line bg-elevated px-3.5 py-2.5 text-sm text-fg-soft">
            Muallifga: <strong className="text-fg">{formatDecimalSom(payout)}</strong>
          </p>
        )}

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
