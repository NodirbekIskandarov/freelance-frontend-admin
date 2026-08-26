import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import type { University } from '@/shared/types/catalogue';

import { useCreateUniversityMutation, useUpdateUniversityMutation } from './catalogueApi';

/**
 * Yaratish va tahrirlash uchun BITTA modal — ikkita alohida komponent
 * maydonlar va validatsiyani ikki nusxada saqlashni anglatardi.
 */
export function UniversityFormModal({
  open,
  university,
  onClose,
}: {
  open: boolean;
  /** `null` — yangi institut yaratiladi. */
  university: University | null;
  onClose: () => void;
}) {
  const [createUniversity, createState] = useCreateUniversityMutation();
  const [updateUniversity, updateState] = useUpdateUniversityMutation();

  const [name, setName] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [shortName, setShortName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [city, setCity] = useState('');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);

  // Modal ochilganda forma tanlangan yozuvdan to'ldiriladi: bir xil modal
  // turli qatorlar uchun qayta ishlatiladi va `useState` boshlang'ich
  // qiymati faqat birinchi renderda o'qiladi.
  useEffect(() => {
    if (!open) return;

    /*
     * `name` joriy tilga qarab yechilgan qiymat, `name_uz` esa ustunning
     * o'zi — ruscha interfeysda o'zbekcha maydonga ruscha nom tushib
     * qolmasligi uchun ustun o'qiladi.
     */
    setName(university?.name_uz ?? university?.name ?? '');
    setNameRu(university?.name_ru ?? '');
    setShortName(university?.short_name ?? '');
    setLogo(null);
    setCity(university?.city ?? '');
    setCode(university?.code ?? '');
    setIsActive(university?.is_active ?? true);
    setTouched(false);
  }, [open, university]);

  const nameError = touched && !name.trim() ? 'Nomni kiriting' : undefined;

  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;

  async function handleSubmit() {
    setTouched(true);
    if (!name.trim()) return;

    const body = {
      name: name.trim(),
      name_ru: nameRu.trim(),
      short_name: shortName.trim(),
      // Fayl tanlanmagan bo'lsa maydon umuman yuborilmaydi — aks holda
      // tahrirlashda mavjud logotip o'chib ketardi.
      ...(logo ? { logo } : {}),
      city: city.trim(),
      is_active: isActive,
      // Bo'sh qoldirilsa backend `short_name` dan o'zi yasaydi —
      // bo'sh satr yuborish uni majburan bo'sh qilib qo'yardi.
      ...(code.trim() ? { code: code.trim() } : {}),
    };

    try {
      if (university) await updateUniversity({ id: university.id, ...body }).unwrap();
      else await createUniversity(body).unwrap();
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
      title={university ? 'Institutni tahrirlash' : "Yangi institut qo'shish"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSaving}>
            {isSaving ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <FileDropzone
            label="Logotip yuklash"
            description="PNG, JPG yoki SVG formatda. Maksimal hajm: 2MB"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            actionLabel="tanlash"
            onFiles={(files) => setLogo(files[0] ?? null)}
          />

          {/*
            Tanlangan fayl nomi — yuklandi degan yagona belgi. Usiz
            foydalanuvchi bosgan-bosmagani bilinmasdi.
          */}
          {logo ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-fg-muted">
              <span className="truncate text-fg-soft">{logo.name}</span>
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="shrink-0 text-danger hover:underline"
              >
                olib tashlash
              </button>
            </p>
          ) : university?.logo ? (
            <p className="mt-2 text-xs text-fg-muted">
              Hozirgi logotip saqlanadi — almashtirish uchun yangi fayl tanlang.
            </p>
          ) : null}
        </div>

        <TextField
          label="Qisqartma nomi"
          required
          placeholder="Masalan: TATU, TDYU, ADU"
          value={shortName}
          onChange={(event) => setShortName(event.target.value)}
        />

        <TextField
          label="To'liq nomi (o'zbekcha)"
          required
          placeholder="Institutning to'liq nomini kiriting"
          value={name}
          error={nameError}
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="To'liq nomi (ruscha)"
          placeholder="Ташкентский университет информационных технологий"
          value={nameRu}
          hint="Ixtiyoriy — bo'sh qoldirilsa faqat o'zbekcha nom saqlanadi."
          onChange={(event) => setNameRu(event.target.value)}
        />

        <TextField
          label="Shahar"
          placeholder="Toshkent"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />

        <TextField
          label="Kod"
          placeholder="Bo'sh qoldirsangiz qisqa nomdan yasaladi"
          value={code}
          hint="Faqat harf, raqam, defis va pastki chiziq."
          onChange={(event) => setCode(event.target.value)}
        />

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-fg-soft">Faol — katalogda ko&apos;rinadi</span>
        </label>

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
