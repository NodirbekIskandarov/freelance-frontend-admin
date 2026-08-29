import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';

import { useEditSolutionMutation } from './solutionsApi';

/**
 * Narx SATR sifatida yuboriladi — `PublishModal` dagi sabab bilan bir xil:
 * backend `DecimalField` kutadi va `Number` ga o'tkazib qaytarish katta
 * summalarda aniqlikni yo'qotardi.
 */
const PRICE_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;

/** `15000.00` → `15000` — tahrirlashda `.00` ni qo'lda o'chirishga majburlamaslik uchun. */
function trimTrailingZeros(value: string): string {
  return value.includes('.') ? value.replace(/\.?0+$/, '') : value;
}

/**
 * Yechim matni va narxini tuzatish.
 *
 * Yuklovchi o'z yechimini tahrirlay olmaydi — model ataylab shunday. Shu
 * sababli sarlavhadagi xatoni yoki ochiqcha noto'g'ri narxni tuzatishning
 * yagona yo'li yechimni rad etib, odamdan qaytadan yuklashni so'rash edi.
 *
 * Holat bu yerda o'zgarmaydi: tuzatish qaror emas. Tasdiqlash, rad etish va
 * e'lon qilish o'z tugmalarida qoladi.
 */
export function SolutionEditModal({
  solutionId,
  open,
  onClose,
  title: initialTitle,
  description: initialDescription,
  price: initialPrice,
  askingPrice,
}: {
  solutionId: string;
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  price: string;
  /** Yuklovchi so'ragan narx — solishtirish uchun ko'rsatiladi, tegilmaydi. */
  askingPrice: string;
}) {
  const [edit, { isLoading, error }] = useEditSolutionMutation();

  /*
   * Boshlang'ich qiymatlar holatga BIR MARTA tushadi: chaqiruvchi modalni
   * shartli chizadi, ya'ni u har ochilishda qaytadan yaratiladi va
   * effekt bilan sinxronlash kerak emas.
   */
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState(() => trimTrailingZeros(initialPrice));
  const [touched, setTouched] = useState(false);

  const titleError = touched && !title.trim() ? 'Sarlavhani kiriting' : undefined;
  const priceError =
    touched && !PRICE_PATTERN.test(price.trim())
      ? 'Narxni raqamda kiriting (masalan 25000 yoki 25000.50)'
      : undefined;

  const priceChanged = trimTrailingZeros(initialPrice) !== price.trim();

  async function handleSubmit() {
    setTouched(true);
    if (!title.trim() || !PRICE_PATTERN.test(price.trim())) return;

    try {
      await edit({
        id: solutionId,
        title: title.trim(),
        description: description.trim(),
        // Narx faqat O'ZGARGANDA yuboriladi: tegilmagan maydonni qayta
        // yuborish audit jurnalida bo'sh yozuv qoldirmasa ham, uni
        // «admin narxni tasdiqladi» deb o'qish mumkin edi.
        ...(priceChanged ? { price: price.trim() } : {}),
      }).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi.
      return;
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yechimni tahrirlash"
      description="Sarlavha, tavsif va narxni tuzatish. Holat o'zgarmaydi."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isLoading}>
            {isLoading ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Sarlavha"
          required
          maxLength={255}
          value={title}
          error={titleError}
          onChange={(event) => setTitle(event.target.value)}
        />

        <TextAreaField
          label="Tavsif"
          maxLength={2000}
          placeholder="Yechim haqida qisqacha."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <TextField
          label="Narx"
          required
          inputMode="decimal"
          placeholder="25000"
          value={price}
          error={priceError}
          hint={`Muallif so'ragan: ${formatDecimalSom(askingPrice)}. So'ralgan narx o'zgarmaydi.`}
          onChange={(event) => setPrice(event.target.value)}
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
